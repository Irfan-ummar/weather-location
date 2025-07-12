<template>
  <div class="project-details-page">
    <div class="container">
      <div class="project-container">
        <!-- Project Info Section -->
        <div class="project-info-section">
          <div class="section-header">
            <h2>{{ isEditMode ? 'Edit Project' : 'Create New Project' }}</h2>
            <p v-if="!isEditMode">Fill in the project details below and save to view the location on the map.</p>
          </div>
          
          <form class="project-form" @submit.prevent="handleSubmit">
            <div class="form-row">
              <div class="form-group full-width">
                <label for="projectName">Name</label>
                <input
                  id="projectName"
                  v-model="projectData.name"
                  type="text"
                  placeholder="Enter project name"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="projectLocality">Project Locality/Area</label>
                <input
                  id="projectLocality"
                  v-model="projectData.locality"
                  type="text"
                  placeholder="Enter locality/area"
                />
              </div>
              <div class="form-group">
                <label for="projectCity">Project City</label>
                <input
                  id="projectCity"
                  v-model="projectData.city"
                  type="text"
                  placeholder="Enter city"
                />
              </div>
              <div class="form-group">
                <label for="projectCountry">Country</label>
                <input
                  id="projectCountry"
                  v-model="projectData.country"
                  type="text"
                  placeholder="Enter country"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="latitude">Latitude</label>
                <input
                  id="latitude"
                  v-model="projectData.latitude"
                  type="number"
                  step="any"
                  placeholder="Enter latitude"
                  @input="updateMapLocation"
                  required
                />
              </div>
              <div class="form-group">
                <label for="longitude">Longitude</label>
                <input
                  id="longitude"
                  v-model="projectData.longitude"
                  type="number"
                  step="any"
                  placeholder="Enter longitude"
                  @input="updateMapLocation"
                  required
                />
              </div>
              <div class="form-group">
                <label for="startDate">Project Start Date</label>
                <input
                  id="startDate"
                  v-model="projectData.startDate"
                  type="date"
                />
              </div>
            </div>
          </form>
        </div>

        <!-- Map Section -->
        <div class="map-section">
          <!-- Show placeholder message if no valid coordinates or not in edit mode -->
          <div v-if="!isValidCoordinates || (!savedProject && !isEditMode)" class="map-placeholder">
            <div class="placeholder-content">
              <div class="placeholder-icon">🗺️</div>
              <h3>{{ !isValidCoordinates ? 'Enter Coordinates to View Map' : 'Save Project to View Location' }}</h3>
              <p>{{ !isValidCoordinates ? 'Please enter valid latitude and longitude coordinates' : 'Enter the project details and save to see the location on the map' }}</p>
            </div>
          </div>
          
          <!-- Show map if we have valid coordinates -->
          <div v-else class="map-wrapper">
            <div 
              ref="mapContainer" 
              class="map-container"
              :class="{ 'loading': mapLoading }"
            >
              <div v-if="mapLoading" class="map-loading">
                <div class="loading-spinner"></div>
                <p>Loading map...</p>
              </div>
            </div>
            
            <!-- Weather Button -->
            <div class="map-controls">
              <button 
                class="btn btn-primary weather-control-btn"
                @click="showWeatherForProject"
                :disabled="!isValidCoordinates"
              >
                <span>🌤️</span>
                Check Weather for Location
              </button>
              <button 
                class="btn btn-secondary"
                @click="initializeMap"
                style="margin-left: 10px;"
              >
                🗺️ Reload Map
              </button>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <router-link to="/projects" class="btn btn-secondary">
            {{ savedProject ? 'BACK TO PROJECTS' : 'CANCEL' }}
          </router-link>
          <button 
            type="button"
            class="btn btn-primary submit-btn"
            @click="handleSubmit"
            :disabled="!isFormValid"
          >
            {{ isEditMode ? 'UPDATE PROJECT' : 'SAVE PROJECT' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Weather Modal -->
    <WeatherModal 
      v-if="showWeatherModal" 
      @close="closeWeatherModal"
      :preset-coordinates="projectCoordinates"
    />
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Loader } from '@googlemaps/js-api-loader'
import { useProjects } from '../composables/useProjects.js'
import WeatherModal from '../components/WeatherModal.vue'

export default {
  name: 'ProjectDetails',
  components: {
    WeatherModal
  },
  props: {
    id: String
  },
  setup(props) {
    const route = useRoute()
    const router = useRouter()
    const { addProject, updateProject, getProject } = useProjects()

    const mapContainer = ref(null)
    const mapLoading = ref(false)
    const showWeatherModal = ref(false)
    const map = ref(null)
    const marker = ref(null)
    const savedProject = ref(null)

    const projectData = reactive({
      name: '',
      locality: '',
      city: '',
      country: '',
      latitude: '',
      longitude: '',
      startDate: ''
    })

    const isEditMode = computed(() => {
      return !!(props.id || route.params.id)
    })

    const isFormValid = computed(() => {
      return projectData.name && 
             projectData.latitude && 
             projectData.longitude
    })

    const isValidCoordinates = computed(() => {
      return projectData.latitude && 
             projectData.longitude && 
             !isNaN(parseFloat(projectData.latitude)) && 
             !isNaN(parseFloat(projectData.longitude))
    })

    const projectCoordinates = computed(() => {
      if (isValidCoordinates.value) {
        return {
          latitude: parseFloat(projectData.latitude),
          longitude: parseFloat(projectData.longitude)
        }
      }
      return null
    })

    const initializeMap = async () => {
      if (!isValidCoordinates.value || !mapContainer.value) {
        console.log('Map initialization skipped:', {
          validCoords: isValidCoordinates.value,
          mapContainer: !!mapContainer.value,
          savedProject: !!savedProject.value
        })
        return
      }

      try {
        mapLoading.value = true
        console.log('Initializing map with coordinates:', projectData.latitude, projectData.longitude)
        console.log('Map container dimensions:', {
          width: mapContainer.value.offsetWidth,
          height: mapContainer.value.offsetHeight,
          clientWidth: mapContainer.value.clientWidth,
          clientHeight: mapContainer.value.clientHeight
        })
        
        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['places', 'marker']
        })

        const google = await loader.load()
        console.log('Google Maps loaded successfully')
        
        // Import the AdvancedMarkerElement and PinElement libraries
        const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker")
        console.log('AdvancedMarkerElement and PinElement loaded successfully')
        
        const projectLocation = {
          lat: parseFloat(projectData.latitude),
          lng: parseFloat(projectData.longitude)
        }
        
        // Create map with mapId required for Advanced Markers
        map.value = new google.maps.Map(mapContainer.value, {
          center: projectLocation,
          zoom: 14,
          mapTypeId: 'satellite',
          // Add mapId required for Advanced Markers
          mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID',
          // Note: styles property cannot be used with mapId - styling managed via Google Cloud Console
          // Map controls (following Maps Platform 101 best practices)
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_CENTER,
            mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain']
          },
          streetViewControl: true,
          streetViewControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
          },
          fullscreenControl: true,
          fullscreenControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
          },
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER
          },
          scaleControl: true,
          rotateControl: true,
          // Enhanced user experience
          gestureHandling: 'greedy',
          keyboardShortcuts: true
        })

        // Create a red pin element for better visibility
        const pin = new PinElement({
          background: "#FF0000",
          borderColor: "#FFFFFF",
          glyphColor: "#FFFFFF",
          scale: 1.2
        })
        
        // Create advanced marker with red pin element
        marker.value = new AdvancedMarkerElement({
          map: map.value,
          position: projectLocation,
          title: projectData.name || 'Project Location',
          content: pin.element,
          gmpDraggable: true
        })
        
        console.log('✅ Advanced marker with PinElement created successfully!')
        console.log('📍 Marker position:', projectLocation)
        console.log('🗺️ Map center:', map.value.getCenter())
        console.log('🔍 Map zoom:', map.value.getZoom())
        console.log('📌 Pin element:', pin.element)
        console.log('🎯 Marker instance:', marker.value)
        
        // Force the map to center on the marker position to ensure it's visible
        setTimeout(() => {
          map.value.setCenter(projectLocation)
          map.value.setZoom(16)
          console.log('🎯 Map recentered on marker position with zoom 16')
        }, 1000)

        // Create info window for marker
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 10px;">
              <h3>${projectData.name || 'Project Location'}</h3>
              <p><strong>Coordinates:</strong><br>
              Lat: ${parseFloat(projectData.latitude).toFixed(6)}<br>
              Lng: ${parseFloat(projectData.longitude).toFixed(6)}</p>
              <p><em>Drag marker or click map to update location</em></p>
            </div>
          `
        })

        // Show info window on marker click
        marker.value.addListener('click', () => {
          infoWindow.open(map.value, marker.value)
        })

        // Handle marker drag to update coordinates
        marker.value.addListener('dragend', (event) => {
          const lat = event.latLng.lat()
          const lng = event.latLng.lng()
          projectData.latitude = lat.toString()
          projectData.longitude = lng.toString()
          
          // Get location name using reverse geocoding
          reverseGeocode(lat, lng, infoWindow)
        })

        // Handle map click to move marker
        map.value.addListener('click', (event) => {
          const lat = event.latLng.lat()
          const lng = event.latLng.lng()
          const newPosition = { lat, lng }
          
          marker.value.position = newPosition
          projectData.latitude = lat.toString()
          projectData.longitude = lng.toString()
          
          // Get location name and update info window
          reverseGeocode(lat, lng, infoWindow, true)
        })

        // Reverse geocoding function
        const reverseGeocode = async (lat, lng, infoWindow, fromClick = false) => {
          try {
            const geocoder = new google.maps.Geocoder()
            const response = await geocoder.geocode({
              location: { lat, lng }
            })
            
            let locationName = 'Unknown Location'
            if (response.results[0]) {
              locationName = response.results[0].formatted_address
            }
            
            // Update info window with location details
            infoWindow.setContent(`
              <div style="padding: 10px; max-width: 300px;">
                <h3>${projectData.name || 'Project Location'}</h3>
                <p><strong>Address:</strong><br>${locationName}</p>
                <p><strong>Coordinates:</strong><br>
                Lat: ${lat.toFixed(6)}<br>
                Lng: ${lng.toFixed(6)}</p>
                <p><em>${fromClick ? 'Location updated by map click!' : 'Location updated!'}</em></p>
              </div>
            `)
            
            if (fromClick) {
              infoWindow.open(map.value, marker.value)
            }
          } catch (error) {
            console.error('Reverse geocoding failed:', error)
            infoWindow.setContent(`
              <div style="padding: 10px;">
                <h3>${projectData.name || 'Project Location'}</h3>
                <p><strong>Coordinates:</strong><br>
                Lat: ${lat.toFixed(6)}<br>
                Lng: ${lng.toFixed(6)}</p>
                <p><em>Location updated!</em></p>
              </div>
            `)
          }
        }

        // Open info window initially
        setTimeout(() => {
          infoWindow.open(map.value, marker.value)
        }, 1000)

        console.log('Map initialized successfully')
        mapLoading.value = false
      } catch (error) {
        console.error('Error loading Google Maps:', error)
        console.error('Error details:', error.message)
        mapLoading.value = false
        
        // Show user-friendly error based on error type
        if (error.message.includes('API key')) {
          alert('Google Maps API key error. Please check your API key in the .env file.')
        } else if (error.message.includes('quota') || error.message.includes('billing')) {
          alert('Google Maps quota exceeded or billing not enabled. Please check your Google Cloud Console.')
        } else if (error.message.includes('referer')) {
          alert('API key restrictions error. Please add your domain to the API key restrictions.')
        } else {
          alert(`Error loading map: ${error.message}. Please check the browser console for more details.`)
        }
      }
    }

    const updateMapLocation = () => {
      if (map.value && marker.value && isValidCoordinates.value) {
        const newPosition = {
          lat: parseFloat(projectData.latitude),
          lng: parseFloat(projectData.longitude)
        }
        
        map.value.setCenter(newPosition)
        marker.value.position = newPosition
      }
    }

    const showWeatherForProject = () => {
      if (isValidCoordinates.value) {
        showWeatherModal.value = true
      }
    }

    const closeWeatherModal = () => {
      showWeatherModal.value = false
    }

    const handleSubmit = async () => {
      if (!isFormValid.value) return

      try {
        if (isEditMode.value) {
          // Update existing project
          const projectId = props.id || route.params.id
          const updated = updateProject(projectId, projectData)
          if (updated) {
            savedProject.value = updated
            alert('Project updated successfully!')
            
            // Initialize map after saving if coordinates are valid
            if (isValidCoordinates.value) {
              await nextTick()
              initializeMap()
            }
          }
        } else {
          // Create new project
          const newProject = addProject(projectData)
          savedProject.value = newProject
          alert('Project saved successfully!')
          
          // Initialize map after saving
          if (isValidCoordinates.value) {
            await nextTick()
            initializeMap()
          }
          
          // Update URL to edit mode
          router.replace(`/project/${newProject.id}`)
        }
      } catch (error) {
        console.error('Error saving project:', error)
        alert('Error saving project. Please try again.')
      }
    }

    const loadExistingProject = () => {
      if (isEditMode.value) {
        const projectId = props.id || route.params.id
        const project = getProject(projectId)
        
        if (project) {
          // Load project data into form
          Object.keys(projectData).forEach(key => {
            if (project[key] !== undefined) {
              projectData[key] = project[key]
            }
          })
          savedProject.value = project
        } else {
          // Project not found, redirect to projects list
          router.replace('/projects')
        }
      }
    }

    onMounted(async () => {
      loadExistingProject()
      
      // Wait a bit for DOM to be ready and then initialize map if we have coordinates
      await nextTick()
      
      if (isValidCoordinates.value) {
        console.log('Attempting to initialize map on mount...')
        initializeMap()
      }
    })

    // Watch for coordinate changes to update map
    watch([() => projectData.latitude, () => projectData.longitude], () => {
      updateMapLocation()
    }, { immediate: false })

    // Watch for savedProject changes to initialize map when project is loaded/saved
    watch(savedProject, (newProject) => {
      if (newProject && isValidCoordinates.value) {
        nextTick(() => {
          initializeMap()
        })
      }
    })

    return {
      mapContainer,
      mapLoading,
      projectData,
      showWeatherModal,
      savedProject,
      isEditMode,
      isFormValid,
      isValidCoordinates,
      projectCoordinates,
      showWeatherForProject,
      closeWeatherModal,
      handleSubmit,
      updateMapLocation
    }
  }
}
</script>

<style scoped>
.project-details-page {
  min-height: calc(100vh - 80px);
  padding: 20px 0;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.project-container {
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-width: 1200px;
  margin: 0 auto;
}

.project-info-section {
  padding: 30px;
  border-bottom: 1px solid #e9ecef;
}

.section-header {
  margin-bottom: 25px;
}

.section-header h2 {
  font-size: 1.8rem;
  color: #2d3436;
  font-weight: 600;
  margin: 0 0 10px 0;
}

.section-header p {
  color: #636e72;
  font-size: 1rem;
  margin: 0;
}

.project-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  align-items: end;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 600;
  color: #2d3436;
  font-size: 0.9rem;
}

.form-group input {
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #74b9ff;
}

.map-section {
  position: relative;
  height: 400px;
  background: #f8f9fa;
}

.map-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.placeholder-content {
  text-align: center;
  padding: 40px;
}

.placeholder-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.6;
}

.placeholder-content h3 {
  font-size: 1.5rem;
  color: #636e72;
  margin-bottom: 10px;
}

.placeholder-content p {
  color: #81868e;
  font-size: 1rem;
}

.map-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-container.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.map-loading {
  text-align: center;
  color: #636e72;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e9ecef;
  border-top: 3px solid #74b9ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.map-controls {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 10;
}

.weather-control-btn {
  padding: 10px 15px;
  font-size: 0.9rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.weather-control-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-buttons {
  padding: 25px 30px;
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.action-buttons .btn {
  padding: 12px 24px;
  font-weight: 600;
  text-transform: uppercase;
  min-width: 120px;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .project-container {
    margin: 10px;
    border-radius: 10px;
  }
  
  .project-info-section {
    padding: 20px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .map-section {
    height: 300px;
  }
  
  .action-buttons {
    padding: 20px;
    flex-direction: column;
  }
  
  .action-buttons .btn {
    width: 100%;
  }
}
</style> 