<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="weather-modal" @click.stop>
      <!-- Header -->
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
              :disabled="loading"
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
              :disabled="loading"
            />
          </div>
        </div>

        <div class="form-actions">
          <button 
            class="btn btn-secondary"
            @click="useCurrentLocation"
            :disabled="loading"
          >
            <span v-if="!loading">📍 Use Current Location</span>
            <span v-else class="loading"></span>
          </button>
          
          <button 
            class="btn btn-primary"
            @click="fetchWeather"
            :disabled="loading || !isFormValid"
          >
            <span v-if="!loading">🌤️ Get Weather</span>
            <span v-else class="loading"></span>
          </button>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>

      <!-- Weather Display -->
      <div class="weather-display" v-if="weatherData">
        <div class="location-name">
          {{ weatherData.location || `${locationInfo.latitude}, ${locationInfo.longitude}` }}
        </div>

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

          <div class="detail-row">
            <div class="detail-item">
              <span class="label">Humidity</span>
              <span class="value">{{ weatherData.humidity }}%</span>
            </div>
            <div class="detail-item">
              <span class="label">Pressure</span>
              <span class="value">{{ weatherData.pressure }} hPa</span>
            </div>
          </div>

          <div class="detail-row">
            <div class="detail-item">
              <span class="label">Wind</span>
              <span class="value">{{ weatherData.windSpeed }} m/s {{ weatherData.windDirection }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Cloud</span>
              <span class="value">{{ weatherData.cloudCover }}%</span>
            </div>
          </div>

          <div class="detail-row">
            <div class="detail-item">
              <span class="label">UV Index</span>
              <span class="value">{{ weatherData.uvIndex }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Visibility</span>
              <span class="value">{{ weatherData.visibility }} km</span>
            </div>
          </div>

          <div class="detail-row">
            <div class="detail-item">
              <span class="label">Dew Point</span>
              <span class="value">{{ weatherData.dewPoint }}°C</span>
            </div>
            <div class="detail-item">
              <span class="label">Rain</span>
              <span class="value">{{ weatherData.rainfall }} mm</span>
            </div>
          </div>
        </div>

        <div class="api-note">
          Data is accessed through Google Weather API via Google Maps Platform service. Real-time weather data is fetched based on the exact latitude and longitude coordinates.
        </div>

        <button class="btn btn-secondary update-btn" @click="resetForm">
          Update Site Location
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
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
    const {
      loading,
      error,
      weatherData,
      locationInfo,
      fetchWeatherData,
      getCurrentLocation,
      resetWeatherData
    } = useWeather()

    const locationForm = reactive({
      latitude: '',
      longitude: ''
    })

    const isFormValid = computed(() => {
      return locationForm.latitude !== '' && locationForm.longitude !== ''
    })

    const closeModal = () => {
      emit('close')
    }

    const handleOverlayClick = () => {
      closeModal()
    }

    const fetchWeather = async () => {
      if (!isFormValid.value) return
      
      await fetchWeatherData(
        parseFloat(locationForm.latitude),
        parseFloat(locationForm.longitude)
      )
    }

    const useCurrentLocation = async () => {
      try {
        const location = await getCurrentLocation()
        locationForm.latitude = location.latitude.toString()
        locationForm.longitude = location.longitude.toString()
        await fetchWeatherData(location.latitude, location.longitude)
      } catch (err) {
        error.value = err.message
      }
    }

    const resetForm = () => {
      resetWeatherData()
      locationForm.latitude = ''
      locationForm.longitude = ''
    }

    // Auto-populate and fetch weather if preset coordinates are provided
    const initializeWithPresetCoordinates = () => {
      if (props.presetCoordinates) {
        locationForm.latitude = props.presetCoordinates.latitude.toString()
        locationForm.longitude = props.presetCoordinates.longitude.toString()
        
        // Automatically fetch weather data
        fetchWeatherData(props.presetCoordinates.latitude, props.presetCoordinates.longitude)
      }
    }

    // Initialize with preset coordinates when component mounts
    onMounted(() => {
      initializeWithPresetCoordinates()
    })

    return {
      loading,
      error,
      weatherData,
      locationInfo,
      locationForm,
      isFormValid,
      closeModal,
      handleOverlayClick,
      fetchWeather,
      useCurrentLocation,
      resetForm
    }
  }
}
</script>

<style scoped>
.weather-modal {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #dee2e6;
}

.modal-header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3436;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #636e72;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #e17055;
  color: white;
}

.location-form {
  padding: 30px;
}

.input-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.form-actions .btn {
  flex: 1;
  min-width: 150px;
}

.error-message {
  margin-top: 15px;
  padding: 12px;
  background: #ff7675;
  color: white;
  border-radius: 8px;
  font-weight: 500;
}

.weather-display {
  padding: 30px;
}

.location-name {
  text-align: center;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3436;
  margin-bottom: 30px;
}

.weather-main {
  text-align: center;
  margin-bottom: 30px;
}

.weather-condition {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.weather-icon-large {
  font-size: 4rem;
}

.condition-text {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3436;
  text-transform: uppercase;
  letter-spacing: 2px;
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

.detail-item .label {
  font-weight: 600;
  color: #636e72;
}

.detail-item .value {
  font-weight: 700;
  color: #2d3436;
  font-size: 1.1rem;
}

.api-note {
  font-size: 0.9rem;
  color: #636e72;
  text-align: center;
  margin-bottom: 20px;
  line-height: 1.5;
  padding: 15px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
}

.update-btn {
  width: 100%;
  font-size: 1.1rem;
  padding: 15px;
}

@media (max-width: 600px) {
  .weather-modal {
    width: 95%;
    margin: 10px;
  }

  .input-row {
    grid-template-columns: 1fr;
  }

  .detail-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .condition-text {
    font-size: 1.5rem;
  }
}
</style> 