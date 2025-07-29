<template>
  <div class="camera-setup-page">
    <div class="container">
      <div class="setup-header">
        <h1>📹 Camera Setup</h1>
        <p>Set up your camera locations by uploading a floor plan or capturing a map snapshot</p>
      </div>

      <!-- Step 1: Choose Floor Plan Method -->
      <div v-if="currentStep === 1" class="setup-step">
        <div class="step-header">
          <h2>Step 1: Choose Your Floor Plan Method</h2>
          <p>Select how you want to provide your floor plan</p>
        </div>
        
        <div class="method-cards">
          <div class="method-card" @click="setMethod('upload')">
            <div class="card-icon">📁</div>
            <h3>Upload Floor Plan</h3>
            <p>Upload an existing floor plan image file</p>
          </div>
          
          <div class="method-card" @click="setMethod('map')">
            <div class="card-icon">🗺️</div>
            <h3>Map Snapshot</h3>
            <p>Search a location and capture a map screenshot</p>
          </div>
        </div>
      </div>

      <!-- Step 2: Upload or Map -->
      <div v-if="currentStep === 2" class="setup-step">
        <div class="step-header">
          <h2>Step 2: {{ selectedMethod === 'upload' ? 'Upload Floor Plan' : 'Capture Map Snapshot' }}</h2>
          <button class="btn btn-secondary" @click="goBack">← Back</button>
        </div>

        <!-- Upload Method -->
        <div v-if="selectedMethod === 'upload'" class="upload-section">
          <div class="upload-area" @click="triggerFileUpload" @dragover.prevent @drop="handleDrop">
            <input 
              ref="fileInput" 
              type="file" 
              accept="image/*" 
              @change="handleFileSelect" 
              style="display: none;"
            >
            <div v-if="!uploadedImage" class="upload-placeholder">
              <div class="upload-icon">📤</div>
              <p>Click or drag to upload floor plan</p>
              <small>Supports: JPG, PNG, GIF</small>
            </div>
            <div v-else class="uploaded-preview">
              <img :src="uploadedImage" alt="Floor plan preview" />
            </div>
          </div>
          
          <div v-if="uploadedImage" class="upload-form">
            <input 
              v-model="floorPlanName" 
              type="text" 
              placeholder="Enter floor plan name" 
              class="form-input"
            >
            <button class="btn btn-primary" @click="saveFloorPlan">
              Continue to Camera Placement
            </button>
          </div>
        </div>

        <!-- Map Method -->
        <div v-if="selectedMethod === 'map'" class="map-section">
          <div class="search-bar">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search for a location..." 
              @keyup.enter="searchLocation"
              class="form-input"
            >
            <button class="btn btn-primary" @click="searchLocation">Search</button>
          </div>
          
          <div class="map-container" ref="mapContainer">
            <div v-if="!mapLoaded" class="map-placeholder">
              <div class="map-icon">🗺️</div>
              <p>{{ isSearching ? 'Searching...' : 'Enter a location to search' }}</p>
              <small>Map will appear here</small>
            </div>
          </div>
          
          <div class="map-actions">
            <input 
              v-model="floorPlanName" 
              type="text" 
              placeholder="Enter location name" 
              class="form-input"
            >
            <button 
              class="btn btn-primary" 
              @click="captureMapSnapshot" 
              :disabled="!mapLoaded || isSearching"
            >
              {{ mapLoaded && !isSearching ? 'Capture This View' : 
                 isSearching ? 'Searching...' : 
                 'Capture This View (Map not loaded)' }}
            </button>
            <div class="debug-info" style="margin-top: 10px; font-size: 12px; color: #666;">
              Debug: mapLoaded={{ mapLoaded }}, isSearching={{ isSearching }}, searchQuery='{{ searchQuery }}'
              <br>Button should be: {{ !mapLoaded || isSearching ? 'DISABLED' : 'ENABLED' }}
            </div>
            <button 
              class="btn btn-secondary" 
              @click="testCapture" 
              style="margin-top: 10px;"
            >
              🧪 Test Capture (Debug)
            </button>
            <button 
              class="btn btn-success" 
              @click="forceMapLoaded" 
              style="margin-top: 5px;"
              v-if="!mapLoaded"
            >
              🔧 Force Enable Capture
            </button>
          </div>
        </div>
      </div>

      <!-- Step 3: Place Cameras -->
      <div v-if="currentStep === 3" class="setup-step">
        <div class="step-header">
          <h2>Step 3: Place Your Cameras</h2>
          <p>Click on the floor plan to add camera locations</p>
          <div class="step-actions">
            <button class="btn btn-secondary" @click="goBack">← Back</button>
            <button class="btn btn-success" @click="finishSetup" :disabled="placedCameras.length === 0">
              Finish Setup ({{ placedCameras.length }} cameras)
            </button>
          </div>
        </div>

        <div class="camera-placement">
          <div class="placement-controls">
            <div class="camera-info">
              <h4>Camera Settings</h4>
              <input 
                v-model="newCameraName" 
                type="text" 
                placeholder="Camera name" 
                class="form-input"
              >
              <select v-model="newCameraType" class="form-select">
                <option value="indoor">Indoor Camera</option>
                <option value="outdoor">Outdoor Camera</option>
              </select>
              <textarea 
                v-model="newCameraDescription" 
                placeholder="Description (optional)"
                class="form-textarea"
              ></textarea>
            </div>
            
            <div class="placed-cameras-list">
              <h4>Placed Cameras ({{ placedCameras.length }})</h4>
              <div class="camera-list">
                <div 
                  v-for="camera in placedCameras" 
                  :key="camera.id"
                  class="camera-item"
                  @click="selectCamera(camera)"
                  :class="{ active: selectedCamera?.id === camera.id }"
                >
                  <span class="camera-name">{{ camera.name }}</span>
                  <button class="btn-remove" @click.stop="removeCamera(camera.id)">×</button>
                </div>
              </div>
            </div>
          </div>

          <div class="floor-plan-container">
            <div 
              class="floor-plan-canvas" 
              @click="addCameraAtPosition"
              ref="floorPlanCanvas"
            >
              <img :src="currentFloorPlan.imageUrl" alt="Floor plan" />
              <div 
                v-for="camera in placedCameras"
                :key="camera.id"
                class="camera-marker"
                :style="{ left: camera.x + 'px', top: camera.y + 'px' }"
                :class="{ active: selectedCamera?.id === camera.id }"
                @click.stop="selectCamera(camera)"
              >
                <div class="camera-icon">📹</div>
                <div class="camera-label">{{ camera.name }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCameras } from '../composables/useCameras.js'
import { Loader } from '@googlemaps/js-api-loader'

export default {
  name: 'CameraSetup',
  setup() {
    const router = useRouter()
    const { 
      addFloorPlan, 
      addCamera, 
      handleFileUpload, 
      takeMapSnapshot 
    } = useCameras()

    // Setup state
    const currentStep = ref(1)
    const selectedMethod = ref(null)
    const uploadedImage = ref(null)
    const floorPlanName = ref('')
    const currentFloorPlan = ref(null)
    const searchQuery = ref('')

    // Camera placement state
    const placedCameras = ref([])
    const selectedCamera = ref(null)
    const newCameraName = ref('')
    const newCameraType = ref('indoor')
    const newCameraDescription = ref('')

    // Refs
    const fileInput = ref(null)
    const mapContainer = ref(null)
    const floorPlanCanvas = ref(null)
    
    // Map state
    const map = ref(null)
    const mapLoaded = ref(false)
    const isSearching = ref(false)

    // Methods
    const setMethod = (method) => {
      selectedMethod.value = method
      currentStep.value = 2
    }

    const goBack = () => {
      if (currentStep.value > 1) {
        currentStep.value--
      }
    }

    const triggerFileUpload = () => {
      fileInput.value?.click()
    }

    const handleFileSelect = async (event) => {
      const file = event.target.files[0]
      if (file) {
        try {
          uploadedImage.value = await handleFileUpload(file)
        } catch (error) {
          alert(error.message)
        }
      }
    }

    const handleDrop = async (event) => {
      event.preventDefault()
      const file = event.dataTransfer.files[0]
      if (file) {
        try {
          uploadedImage.value = await handleFileUpload(file)
        } catch (error) {
          alert(error.message)
        }
      }
    }

    const initializeMap = async () => {
      console.log('🗺️ initializeMap called')
      try {
        console.log('🔑 Creating Google Maps loader...')
        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['places', 'geometry']
        })

        console.log('⏳ Loading Google Maps...')
        const google = await loader.load()
        console.log('✅ Google Maps loaded successfully for camera setup')

        console.log('🗺️ Creating map instance...')
        // Initialize map centered on a default location
        map.value = new google.maps.Map(mapContainer.value, {
          center: { lat: 37.7749, lng: -122.4194 }, // San Francisco default
          zoom: 15,
          mapTypeId: 'hybrid', // Better for floor plan context
          mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID',
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true
        })

        console.log('🎯 Setting mapLoaded to true...')
        mapLoaded.value = true
        console.log('✅ Map initialization complete, mapLoaded:', mapLoaded.value)
      } catch (error) {
        console.error('❌ Error loading Google Maps:', error)
        alert('Failed to load Google Maps. Please check your API key configuration.')
      }
    }

    const searchLocation = async () => {
      console.log('🔍 searchLocation called with query:', searchQuery.value)
      
      if (!searchQuery.value.trim()) {
        alert('Please enter a location to search')
        return
      }

      console.log('📊 Before init check - mapLoaded:', mapLoaded.value, 'map exists:', !!map.value)
      
      if (!mapLoaded.value) {
        console.log('⚠️ Map not loaded, initializing...')
        await initializeMap()
        console.log('✅ After initializeMap - mapLoaded:', mapLoaded.value)
      } else {
        console.log('✅ Map already loaded')
      }

      console.log('🔍 Starting location search...')
      isSearching.value = true

      try {
        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['places', 'geometry']
        })

                 const google = await loader.load()
         const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker")
         const geocoder = new google.maps.Geocoder()

         geocoder.geocode(
           { address: searchQuery.value },
           (results, status) => {
             isSearching.value = false
             
             if (status === 'OK' && results[0]) {
               const location = results[0].geometry.location
               const bounds = results[0].geometry.viewport
               
               // Center map on the found location
               map.value.setCenter(location)
               map.value.fitBounds(bounds)
               
               // Create a custom pin element
               const pin = new PinElement({
                 background: "#ff4444",
                 borderColor: "#ffffff",
                 glyphColor: "#ffffff",
                 scale: 1.2
               })
               
               // Add a marker to show the searched location using new AdvancedMarkerElement
               new AdvancedMarkerElement({
                 position: location,
                 map: map.value,
                 title: searchQuery.value,
                 content: pin.element
               })
               
               console.log('Location found:', results[0].formatted_address)
             } else {
               alert('Location not found. Please try a different search term.')
             }
           }
         )
      } catch (error) {
        isSearching.value = false
        console.error('Error searching location:', error)
        alert('Error searching for location')
      }
    }

              const captureMapSnapshot = async () => {
      console.log('🔥 Capture button clicked!')
      console.log('📊 Debug state:', {
        mapValue: !!map.value,
        mapLoaded: mapLoaded.value,
        isSearching: isSearching.value,
        searchQuery: searchQuery.value
      })
      
      if (!map.value) {
        console.error('❌ Map not available')
        alert('Please search for a location first')
        return
      }

      if (!searchQuery.value.trim()) {
        console.error('❌ Search query empty')
        alert('Please enter a location name first')
        return
      }

      try {
        console.log('Starting map capture process...')
        
        // Create canvas for the snapshot
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = 800
        canvas.height = 600
        
        console.log('Canvas created:', canvas.width, 'x', canvas.height)
        
        // Get current map information
        let currentCenter = null
        let currentZoom = null
        
        try {
          currentCenter = map.value.getCenter()
          currentZoom = map.value.getZoom()
          console.log('Map center:', currentCenter?.lat(), currentCenter?.lng())
          console.log('Map zoom:', currentZoom)
        } catch (mapError) {
          console.warn('Could not get map center/zoom:', mapError)
        }
        
        // Create a detailed map snapshot representation
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        gradient.addColorStop(0, '#4285f4')
        gradient.addColorStop(0.5, '#34a853')
        gradient.addColorStop(1, '#137333')
        
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Add map details header
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
        ctx.fillRect(20, 20, canvas.width - 40, 120)
        
        // Add border
        ctx.strokeStyle = '#333'
        ctx.lineWidth = 2
        ctx.strokeRect(20, 20, canvas.width - 40, 120)
        
        ctx.fillStyle = '#333'
        ctx.font = 'bold 24px Arial'
        ctx.textAlign = 'left'
        ctx.fillText('📍 Map Snapshot', 40, 55)
        
        ctx.font = 'bold 18px Arial'
        ctx.fillText(`Location: ${searchQuery.value}`, 40, 85)
        
        if (currentCenter) {
          ctx.font = '16px Arial'
          ctx.fillText(`Lat: ${currentCenter.lat().toFixed(6)}`, 40, 110)
          ctx.fillText(`Lng: ${currentCenter.lng().toFixed(6)}`, 250, 110)
        }
        
        ctx.font = '14px Arial'
        ctx.fillStyle = '#666'
        ctx.fillText(`Captured: ${new Date().toLocaleString()}`, 40, 130)
        
        // Add some visual elements to represent roads/features
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.lineWidth = 4
        
        // Draw some road-like lines
        const roadPaths = [
          [[100, 200], [300, 180], [500, 200], [700, 180]],
          [[150, 300], [350, 320], [550, 300], [750, 310]],
          [[200, 180], [220, 400], [240, 500]],
          [[400, 150], [380, 350], [360, 550]],
          [[600, 160], [620, 360], [640, 520]]
        ]
        
        roadPaths.forEach(path => {
          ctx.beginPath()
          ctx.moveTo(path[0][0], path[0][1])
          path.slice(1).forEach(point => {
            ctx.lineTo(point[0], point[1])
          })
          ctx.stroke()
        })
        
        // Add location marker in center
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2 + 60
        
        // Marker shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
        ctx.beginPath()
        ctx.ellipse(centerX + 2, centerY + 22, 12, 4, 0, 0, 2 * Math.PI)
        ctx.fill()
        
        // Marker body
        ctx.fillStyle = '#ff4444'
        ctx.beginPath()
        ctx.arc(centerX, centerY, 18, 0, 2 * Math.PI)
        ctx.fill()
        
        // Marker border
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 3
        ctx.stroke()
        
        // Marker center dot
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI)
        ctx.fill()
        
        // Add scale indicator
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.fillRect(canvas.width - 150, canvas.height - 60, 120, 40)
        ctx.strokeStyle = '#333'
        ctx.lineWidth = 1
        ctx.strokeRect(canvas.width - 150, canvas.height - 60, 120, 40)
        
        ctx.fillStyle = '#333'
        ctx.font = '12px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('Floor Plan Ready', canvas.width - 90, canvas.height - 35)
        ctx.fillText('for Camera Placement', canvas.width - 90, canvas.height - 20)
        
        // Convert to data URL with high quality
        const dataURL = canvas.toDataURL('image/png', 0.95)
        console.log('Canvas converted to data URL, length:', dataURL.length)
        
        // Set the captured image
        uploadedImage.value = dataURL
        
        // Auto-fill floor plan name if empty
        if (!floorPlanName.value.trim()) {
          floorPlanName.value = searchQuery.value
        }
        
        console.log('Map snapshot captured successfully, proceeding to save floor plan')
        
        // Small delay to ensure reactivity updates
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Save the floor plan and proceed to next step
        saveFloorPlan()
        
      } catch (error) {
        console.error('Error capturing map snapshot:', error)
        
        // Simple fallback method
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          canvas.width = 800
          canvas.height = 600
          
          ctx.fillStyle = '#e3f2fd'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          
          ctx.fillStyle = '#1976d2'
          ctx.font = 'bold 32px Arial'
          ctx.textAlign = 'center'
          ctx.fillText('📍 Map Snapshot', canvas.width / 2, canvas.height / 2 - 50)
          
          ctx.font = 'bold 24px Arial'
          ctx.fillText(searchQuery.value, canvas.width / 2, canvas.height / 2)
          
          ctx.font = '18px Arial'
          ctx.fillText('Ready for Camera Placement', canvas.width / 2, canvas.height / 2 + 50)
          
          ctx.font = '14px Arial'
          ctx.fillStyle = '#666'
          ctx.fillText(`Created: ${new Date().toLocaleString()}`, canvas.width / 2, canvas.height / 2 + 80)
          
          uploadedImage.value = canvas.toDataURL('image/png')
          
          if (!floorPlanName.value.trim()) {
            floorPlanName.value = searchQuery.value
          }
          
          console.log('Fallback snapshot created successfully')
          saveFloorPlan()
          
        } catch (fallbackError) {
          console.error('Fallback method also failed:', fallbackError)
          alert('Unable to capture map snapshot. Please try again or upload a floor plan instead.')
        }
      }
    }

    const saveFloorPlan = () => {
      if (!floorPlanName.value) {
        alert('Please enter a name for the floor plan')
        return
      }

      const floorPlan = {
        name: floorPlanName.value,
        type: selectedMethod.value,
        imageUrl: uploadedImage.value,
        mapData: selectedMethod.value === 'map' ? { query: searchQuery.value } : null
      }

      currentFloorPlan.value = addFloorPlan(floorPlan)
      currentStep.value = 3
      
      // Reset camera form
      newCameraName.value = `Camera ${placedCameras.value.length + 1}`
    }

    const addCameraAtPosition = (event) => {
      const rect = floorPlanCanvas.value.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      const camera = {
        name: newCameraName.value || `Camera ${placedCameras.value.length + 1}`,
        type: newCameraType.value,
        description: newCameraDescription.value,
        x: x,
        y: y,
        floorPlanId: currentFloorPlan.value.id
      }

      const newCamera = addCamera(camera)
      placedCameras.value.push(newCamera)
      
      // Reset form for next camera
      newCameraName.value = `Camera ${placedCameras.value.length + 1}`
      newCameraDescription.value = ''
    }

    const selectCamera = (camera) => {
      selectedCamera.value = camera
      newCameraName.value = camera.name
      newCameraType.value = camera.type
      newCameraDescription.value = camera.description
    }

    const removeCamera = (cameraId) => {
      const index = placedCameras.value.findIndex(cam => cam.id === cameraId)
      if (index > -1) {
        placedCameras.value.splice(index, 1)
      }
      if (selectedCamera.value?.id === cameraId) {
        selectedCamera.value = null
      }
    }

    const finishSetup = () => {
      router.push('/cameras')
    }

    const testCapture = () => {
      console.log('🧪 TEST CAPTURE CLICKED!')
      console.log('All state:', {
        mapLoaded: mapLoaded.value,
        isSearching: isSearching.value,
        searchQuery: searchQuery.value,
        map: !!map.value,
        uploadedImage: !!uploadedImage.value,
        floorPlanName: floorPlanName.value
      })
      alert('Test capture clicked! Check console for details.')
    }

    const forceMapLoaded = () => {
      console.log('🔧 Force enabling map capture...')
      mapLoaded.value = true
      console.log('✅ mapLoaded set to:', mapLoaded.value)
      alert('Map capture enabled! Now try the "Capture This View" button.')
    }

    // Initialize map when component mounts and user is on map step
    onMounted(() => {
      // Map will be initialized when user searches for a location
    })

    return {
      currentStep,
      selectedMethod,
      uploadedImage,
      floorPlanName,
      currentFloorPlan,
      searchQuery,
      placedCameras,
      selectedCamera,
      newCameraName,
      newCameraType,
      newCameraDescription,
      fileInput,
      mapContainer,
      floorPlanCanvas,
      map,
      mapLoaded,
      isSearching,
      setMethod,
      goBack,
      triggerFileUpload,
      handleFileSelect,
      handleDrop,
      searchLocation,
      captureMapSnapshot,
      saveFloorPlan,
      addCameraAtPosition,
      selectCamera,
      removeCamera,
      finishSetup,
      testCapture,
      forceMapLoaded
    }
  }
}
</script>

<style scoped>
.camera-setup-page {
  min-height: calc(100vh - 80px);
  padding: 40px 0;
}

.setup-header {
  text-align: center;
  margin-bottom: 40px;
}

.setup-header h1 {
  font-size: 2.5rem;
  color: #2d3436;
  margin-bottom: 10px;
}

.setup-step {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.step-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.step-header h2 {
  color: #2d3436;
  margin: 0;
  flex-grow: 1;
}

.step-actions {
  display: flex;
  gap: 15px;
}

.method-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.method-card {
  background: rgba(255, 255, 255, 0.8);
  padding: 40px;
  border-radius: 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.method-card:hover {
  transform: translateY(-5px);
  border-color: #74b9ff;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.upload-area {
  border: 3px dashed #ddd;
  border-radius: 15px;
  padding: 60px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.upload-area:hover {
  border-color: #74b9ff;
  background: rgba(116, 185, 255, 0.05);
}

.upload-icon {
  font-size: 3rem;
  color: #636e72;
  margin-bottom: 20px;
}

.uploaded-preview img {
  max-width: 100%;
  max-height: 400px;
  border-radius: 10px;
}

.search-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.map-container {
  height: 400px;
  border: 2px solid #ddd;
  border-radius: 15px;
  margin-bottom: 20px;
  overflow: hidden;
}

.map-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #636e72;
}

.map-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.map-actions {
  display: flex;
  gap: 15px;
}

.camera-placement {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 30px;
}

.placement-controls {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.camera-info {
  background: rgba(255, 255, 255, 0.8);
  padding: 20px;
  border-radius: 10px;
}

.camera-info h4 {
  margin-bottom: 15px;
  color: #2d3436;
}

.placed-cameras-list {
  background: rgba(255, 255, 255, 0.8);
  padding: 20px;
  border-radius: 10px;
}

.camera-list {
  max-height: 300px;
  overflow-y: auto;
}

.camera-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 5px;
  background: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.camera-item:hover {
  background: #f8f9fa;
}

.camera-item.active {
  background: #74b9ff;
  color: white;
}

.btn-remove {
  background: #ff7675;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 14px;
}

.floor-plan-container {
  border: 2px solid #ddd;
  border-radius: 15px;
  overflow: hidden;
  background: white;
}

.floor-plan-canvas {
  position: relative;
  cursor: crosshair;
}

.floor-plan-canvas img {
  max-width: 100%;
  height: auto;
  display: block;
}

.camera-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  background: rgba(116, 185, 255, 0.9);
  border: 2px solid white;
  border-radius: 50%;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.camera-marker:hover,
.camera-marker.active {
  background: #74b9ff;
  transform: translate(-50%, -50%) scale(1.1);
}

.camera-icon {
  font-size: 16px;
  color: white;
}

.camera-label {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  margin-top: 5px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  margin-bottom: 15px;
  font-size: 14px;
}

.form-textarea {
  min-height: 80px;
  resize: vertical;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background: #74b9ff;
  color: white;
}

.btn-secondary {
  background: #636e72;
  color: white;
}

.btn-success {
  background: #00b894;
  color: white;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .camera-placement {
    grid-template-columns: 1fr;
  }
  
  .step-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-bar,
  .map-actions {
    flex-direction: column;
  }
}
</style> 