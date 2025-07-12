# Vue 3 Weather Dashboard with Google APIs - Complete Development Guide

## 🌟 Project Overview

This Vue 3 application demonstrates how to build a modern weather dashboard that integrates with Google's Weather API and Maps Platform. The project showcases real-world usage of Vue 3 Composition API, Google Maps integration, and weather data visualization.

### 🚀 Key Features

- **Weather Popup from Header**: Access weather information from anywhere in the app
- **Google Weather API Integration**: Real-time weather data using Google's official Weather API
- **Interactive Google Maps**: Display project locations with draggable markers
- **Project Management**: Create and manage location-based projects
- **Responsive Design**: Works on desktop and mobile devices
- **Vue 3 Composition API**: Modern Vue.js patterns and best practices

### 🛠 Tech Stack

- **Frontend**: Vue 3 with Composition API
- **Build Tool**: Vite
- **Routing**: Vue Router 4
- **HTTP Client**: Axios
- **Maps**: Google Maps JavaScript API
- **Weather**: Google Weather API
- **Styling**: Scoped CSS with modern gradients

---

## 📦 Project Setup

### 1. Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Cloud Platform account
- Google Maps Platform API key with Weather API enabled

### 2. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd weather-location

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Google Maps Platform API Key
VITE_GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key_here

# Optional: Google Maps Map ID for Advanced Markers
VITE_GOOGLE_MAPS_MAP_ID=your_map_id_here
```

---

## 🗝️ Google Cloud Platform Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable billing for your project

### 2. Enable Required APIs

Enable the following APIs in the [API Library](https://console.cloud.google.com/apis/library):

- **Maps JavaScript API**
- **Geocoding API** 
- **Weather API** (Note: This is a newer API, ensure it's available in your region)

### 3. Create API Key

1. Go to **Credentials** → **Create Credentials** → **API Key**
2. Copy the API key to your `.env` file
3. (Recommended) Restrict the API key:
   - **Application restrictions**: HTTP referrers
   - **API restrictions**: Select only the APIs you enabled

### 4. API Key Restrictions (Optional but Recommended)

```
HTTP referrers (web sites):
- http://localhost:*
- https://yourdomain.com/*
```

---

## 🏗️ Project Structure

```
weather-location/
├── src/
│   ├── components/           # Reusable components
│   │   ├── AppHeader.vue    # Main navigation header
│   │   └── WeatherModal.vue # Weather popup modal
│   ├── composables/         # Vue 3 composables
│   │   ├── useWeather.js    # Weather API logic
│   │   └── useProjects.js   # Project management logic
│   ├── views/               # Page components
│   │   ├── Dashboard.vue    # Home dashboard
│   │   ├── ProjectsList.vue # Projects management
│   │   └── ProjectDetails.vue # Project creation/editing
│   ├── router/              # Vue Router configuration
│   │   └── index.js
│   ├── App.vue              # Root component
│   ├── main.js              # Application entry point
│   └── style.css            # Global styles
├── .env                     # Environment variables
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
└── test-api.js              # API testing utility
```

---

## 🌤️ Weather API Integration

### Core Weather Composable (`src/composables/useWeather.js`)

The weather functionality is encapsulated in a Vue 3 composable:

```javascript
import { ref, reactive } from 'vue'
import axios from 'axios'

export function useWeather() {
  const loading = ref(false)
  const error = ref(null)
  const weatherData = ref(null)
  
  const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  
  const locationInfo = reactive({
    latitude: '',
    longitude: '',
    address: ''
  })

  const fetchWeatherData = async (lat, lng) => {
    loading.value = true
    error.value = null
    
    try {
      // Get location details from Geocoding API
      const geocodeResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`
      )
      
      if (geocodeResponse.data.results.length > 0) {
        locationInfo.address = geocodeResponse.data.results[0].formatted_address
        locationInfo.latitude = lat
        locationInfo.longitude = lng
      }

      // Fetch weather from Google Weather API
      const weatherResponse = await axios.get(
        `https://weather.googleapis.com/v1/currentConditions:lookup?key=${GOOGLE_API_KEY}&location.latitude=${lat}&location.longitude=${lng}`
      )

      const weatherApiData = weatherResponse.data
      
      // Transform API response to app format
      weatherData.value = {
        location: locationInfo.address || `${lat}, ${lng}`,
        temperature: Math.round(weatherApiData.temperature?.degrees || 0),
        feelsLike: Math.round(weatherApiData.feelsLikeTemperature?.degrees || 0),
        humidity: weatherApiData.relativeHumidity || 0,
        pressure: Math.round(weatherApiData.airPressure?.meanSeaLevelMillibars || 0),
        windSpeed: convertWindSpeed(weatherApiData.wind?.speed),
        windDirection: weatherApiData.wind?.direction?.cardinal || 'N/A',
        cloudCover: weatherApiData.cloudCover || 0,
        condition: weatherApiData.weatherCondition?.description?.text || 'Unknown',
        icon: getWeatherIcon(weatherApiData.weatherCondition?.type),
        uvIndex: weatherApiData.uvIndex || 0,
        visibility: weatherApiData.visibility?.distance || 0,
        dewPoint: Math.round(weatherApiData.dewPoint?.degrees || 0),
        rainfall: weatherApiData.precipitation?.qpf?.quantity || 0
      }
      
    } catch (err) {
      error.value = handleWeatherError(err)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    weatherData,
    locationInfo,
    fetchWeatherData,
    getCurrentLocation,
    resetWeatherData
  }
}
```

### Weather Modal Component

The weather modal provides a clean interface for weather data:

```vue
<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="weather-modal" @click.stop>
      <div class="modal-header">
        <h3>Weather Info</h3>
        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <!-- Location Input Form -->
      <div class="location-form" v-if="!weatherData">
        <div class="input-row">
          <div class="input-group">
            <label for="latitude">Latitude</label>
            <input
              id="latitude"
              v-model="locationForm.latitude"
              type="number"
              step="any"
              placeholder="Enter latitude"
            />
          </div>
          <div class="input-group">
            <label for="longitude">Longitude</label>
            <input
              id="longitude"
              v-model="locationForm.longitude"
              type="number"
              step="any"
              placeholder="Enter longitude"
            />
          </div>
        </div>

        <div class="form-actions">
          <button @click="useCurrentLocation" class="btn btn-secondary">
            📍 Use Current Location
          </button>
          <button @click="fetchWeather" class="btn btn-primary">
            🌤️ Get Weather
          </button>
        </div>
      </div>

      <!-- Weather Display -->
      <div class="weather-display" v-if="weatherData">
        <div class="weather-main">
          <div class="weather-condition">
            <span class="weather-icon-large">{{ weatherData.icon }}</span>
            <div class="condition-text">{{ weatherData.condition }}</div>
          </div>
        </div>

        <div class="weather-details">
          <div class="detail-row">
            <div class="detail-item">
              <span class="label">Temp</span>
              <span class="value">{{ weatherData.temperature }}°C</span>
            </div>
            <div class="detail-item">
              <span class="label">Feels like</span>
              <span class="value">{{ weatherData.feelsLike }}°C</span>
            </div>
          </div>
          <!-- More weather details... -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { useWeather } from '../composables/useWeather.js'

export default {
  name: 'WeatherModal',
  props: {
    presetCoordinates: {
      type: Object,
      default: null
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const { loading, error, weatherData, fetchWeatherData } = useWeather()
    
    const locationForm = reactive({
      latitude: '',
      longitude: ''
    })

    const fetchWeather = async () => {
      await fetchWeatherData(
        parseFloat(locationForm.latitude),
        parseFloat(locationForm.longitude)
      )
    }

    return {
      loading,
      error,
      weatherData,
      locationForm,
      fetchWeather
    }
  }
}
</script>
```

---

## 🗺️ Google Maps Integration

### Maps Implementation in Project Details

The project details page showcases advanced Google Maps integration:

```javascript
// src/views/ProjectDetails.vue
import { Loader } from '@googlemaps/js-api-loader'

const initializeMap = async () => {
  if (!isValidCoordinates.value || !mapContainer.value) return

  try {
    mapLoading.value = true
    
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places', 'marker']
    })

    const google = await loader.load()
    
    // Import Advanced Marker libraries
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker")
    
    const projectLocation = {
      lat: parseFloat(projectData.latitude),
      lng: parseFloat(projectData.longitude)
    }
    
    // Create map with required mapId for Advanced Markers
    map.value = new google.maps.Map(mapContainer.value, {
      center: projectLocation,
      zoom: 14,
      mapTypeId: 'satellite',
      mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID',
      // Enhanced controls
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
      gestureHandling: 'greedy'
    })

    // Create custom red pin marker
    const pin = new PinElement({
      background: "#FF0000",
      borderColor: "#FFFFFF", 
      glyphColor: "#FFFFFF",
      scale: 1.2
    })
    
    // Create advanced marker
    marker.value = new AdvancedMarkerElement({
      map: map.value,
      position: projectLocation,
      title: projectData.name || 'Project Location',
      content: pin.element,
      gmpDraggable: true
    })
    
    // Handle marker interactions
    marker.value.addListener('click', () => {
      infoWindow.open(map.value, marker.value)
    })

    marker.value.addListener('dragend', (event) => {
      const lat = event.latLng.lat()
      const lng = event.latLng.lng()
      projectData.latitude = lat.toString()
      projectData.longitude = lng.toString()
    })

    mapLoading.value = false
  } catch (error) {
    console.error('Error loading Google Maps:', error)
    mapLoading.value = false
  }
}
```

### Map Template Structure

```vue
<template>
  <div class="map-section">
    <!-- Map placeholder when no coordinates -->
    <div v-if="!isValidCoordinates" class="map-placeholder">
      <div class="placeholder-content">
        <div class="placeholder-icon">🗺️</div>
        <h3>Enter Coordinates to View Map</h3>
        <p>Please enter valid latitude and longitude coordinates</p>
      </div>
    </div>
    
    <!-- Active map display -->
    <div v-else class="map-wrapper">
      <div ref="mapContainer" class="map-container">
        <div v-if="mapLoading" class="map-loading">
          <div class="loading-spinner"></div>
          <p>Loading map...</p>
        </div>
      </div>
      
      <!-- Map controls -->
      <div class="map-controls">
        <button 
          class="btn btn-primary weather-control-btn"
          @click="showWeatherForProject"
        >
          🌤️ Check Weather for Location
        </button>
      </div>
    </div>
  </div>
</template>
```

---

## 📱 Component Architecture

### 1. App Header (`src/components/AppHeader.vue`)

Simple navigation header with weather access:

```vue
<template>
  <header class="app-header">
    <div class="container">
      <nav class="navbar">
        <div class="nav-brand">
          <router-link to="/">
            <h2>🌤️ Weather App</h2>
          </router-link>
        </div>
        
        <div class="nav-actions">
          <nav class="nav-menu">
            <router-link to="/" class="nav-link">
              🏠 Dashboard
            </router-link>
            <router-link to="/projects" class="nav-link">
              🗺️ Projects
            </router-link>
          </nav>
        </div>
      </nav>
    </div>
  </header>
</template>
```

### 2. Dashboard (`src/views/Dashboard.vue`)

Main landing page with weather and project access:

```vue
<template>
  <div class="dashboard-page">
    <main class="main-content">
      <div class="container">
        <div class="dashboard">
          <h1>Weather Location Dashboard</h1>
          <p>Welcome to your weather management system.</p>
          
          <div class="dashboard-actions">
            <div class="action-card">
              <div class="card-icon">🌤️</div>
              <h3>Check Weather</h3>
              <p>Get current weather conditions for any location.</p>
              <button class="btn btn-primary" @click="toggleWeatherModal">
                Open Weather Tool
              </button>
            </div>
            
            <div class="action-card">
              <div class="card-icon">🗺️</div>
              <h3>Project Management</h3>
              <p>Create and manage projects with location-based monitoring.</p>
              <router-link to="/projects" class="btn btn-secondary">
                Manage Projects
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </main>

    <WeatherModal v-if="showWeatherModal" @close="closeWeatherModal" />
  </div>
</template>

<script>
import { ref } from 'vue'
import WeatherModal from '../components/WeatherModal.vue'

export default {
  components: { WeatherModal },
  setup() {
    const showWeatherModal = ref(false)

    const toggleWeatherModal = () => {
      showWeatherModal.value = !showWeatherModal.value
    }

    const closeWeatherModal = () => {
      showWeatherModal.value = false
    }

    return {
      showWeatherModal,
      toggleWeatherModal,
      closeWeatherModal
    }
  }
}
</script>
```

### 3. Projects Management (`src/composables/useProjects.js`)

Composable for project CRUD operations:

```javascript
import { ref } from 'vue'

export function useProjects() {
  const projects = ref([])

  const loadProjects = () => {
    try {
      const stored = localStorage.getItem('weather-app-projects')
      if (stored) {
        projects.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error loading projects:', error)
      projects.value = []
    }
  }

  const saveProjects = () => {
    try {
      localStorage.setItem('weather-app-projects', JSON.stringify(projects.value))
    } catch (error) {
      console.error('Error saving projects:', error)
    }
  }

  const addProject = (projectData) => {
    const newProject = {
      id: Date.now().toString(),
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    projects.value.push(newProject)
    saveProjects()
    return newProject
  }

  const updateProject = (projectId, projectData) => {
    const index = projects.value.findIndex(p => p.id === projectId)
    if (index !== -1) {
      projects.value[index] = {
        ...projects.value[index],
        ...projectData,
        updatedAt: new Date().toISOString()
      }
      saveProjects()
      return projects.value[index]
    }
    return null
  }

  const deleteProject = (projectId) => {
    const index = projects.value.findIndex(p => p.id === projectId)
    if (index !== -1) {
      projects.value.splice(index, 1)
      saveProjects()
      return true
    }
    return false
  }

  const getProject = (projectId) => {
    return projects.value.find(p => p.id === projectId)
  }

  // Initialize
  loadProjects()

  return {
    projects,
    addProject,
    updateProject,
    deleteProject,
    getProject
  }
}
```

---

## 🎨 Styling Approach

The project uses scoped CSS with modern design patterns:

### Global Styles (`src/style.css`)

```css
/* Modern CSS Reset and Variables */
:root {
  --primary-color: #74b9ff;
  --secondary-color: #636e72;
  --success-color: #00b894;
  --danger-color: #e17055;
  --background-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--background-gradient);
  color: #2d3436;
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Button Components */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: #0984e3;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #ddd;
  color: #2d3436;
}

.btn-secondary:hover {
  background: #b2bec3;
}
```

### Component-Specific Styles

Each component uses scoped styles for encapsulation:

```vue
<style scoped>
.weather-modal {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);
}

.weather-details {
  margin-bottom: 25px;
}

.detail-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 15px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 10px;
  backdrop-filter: blur(10px);
}

/* Responsive Design */
@media (max-width: 600px) {
  .detail-row {
    grid-template-columns: 1fr;
  }
}
</style>
```

---

## 🧪 Testing Your Setup

### API Testing Script

The project includes a testing utility (`test-api.js`):

```bash
# Test your Google API setup
npm run test-api
```

This script will:
- Verify your API key
- Test Geocoding API
- Test Weather API
- Provide troubleshooting guidance

### Manual Testing Steps

1. **Weather Modal Test**:
   - Open dashboard
   - Click "Open Weather Tool"
   - Enter coordinates: `40.7128, -74.0060` (NYC)
   - Verify weather data appears

2. **Project Management Test**:
   - Go to Projects page
   - Create new project with coordinates
   - Verify map displays with red marker
   - Test weather button on map

3. **Maps Integration Test**:
   - Drag marker to new location
   - Verify coordinates update
   - Click map to move marker
   - Test info window functionality

---

## 🐛 Troubleshooting

### Common Issues

#### 1. API Key Errors (403 Forbidden)

```
Error: Request failed with status code 403
```

**Solutions**:
- Verify API key in `.env` file
- Check if Weather API is enabled in Google Cloud Console
- Ensure billing is enabled for your project
- Verify API key restrictions

#### 2. Weather API Not Found (404)

```
Error: Request failed with status code 404
```

**Solutions**:
- Ensure Weather API is enabled in your Google Cloud project
- Check if Weather API is available in your region
- Verify the API endpoint URL is correct

#### 3. Maps Not Loading

**Solutions**:
- Check browser console for JavaScript errors
- Verify `VITE_GOOGLE_MAPS_API_KEY` is set correctly
- Ensure Maps JavaScript API is enabled
- Check for CORS issues

#### 4. Markers Not Appearing

**Solutions**:
- Verify `VITE_GOOGLE_MAPS_MAP_ID` is set (required for Advanced Markers)
- Check that coordinates are valid numbers
- Ensure marker libraries are loaded correctly

### Debug Mode

Enable debug logging by adding to your component:

```javascript
// Add to setup() function
onMounted(() => {
  console.log('API Key:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.substring(0, 10) + '...')
  console.log('Map ID:', import.meta.env.VITE_GOOGLE_MAPS_MAP_ID)
})
```

---

## 📚 Additional Resources

### Google APIs Documentation
- [Google Weather API](https://developers.google.com/maps/documentation/weather)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Advanced Markers](https://developers.google.com/maps/documentation/javascript/advanced-markers)

### Vue 3 Resources
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Vue Router 4](https://router.vuejs.org/)
- [Vite](https://vitejs.dev/)

### Best Practices
- Always use environment variables for API keys
- Implement proper error handling
- Use composables for reusable logic
- Follow Vue 3 reactive patterns
- Implement responsive design
- Add loading states for better UX

---

## 🚀 Deployment

### Environment Variables for Production

```env
# Production environment
VITE_GOOGLE_MAPS_API_KEY=your_production_api_key
VITE_GOOGLE_MAPS_MAP_ID=your_production_map_id
```

### Build for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

### Deployment Checklist

- [ ] Set production API keys
- [ ] Configure API key restrictions for production domain
- [ ] Test all features in production environment
- [ ] Set up proper HTTPS
- [ ] Configure CDN if needed
- [ ] Monitor API usage and quotas

---

## 📝 License

This project is for educational purposes. Make sure to comply with Google Maps Platform Terms of Service and Weather API usage policies.

---

## 🤝 Contributing

Feel free to submit issues and enhancement requests. This guide serves as a foundation for building weather-based applications with Vue 3 and Google APIs. 