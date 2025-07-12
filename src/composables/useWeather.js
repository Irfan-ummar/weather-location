import { ref, reactive } from 'vue'
import axios from 'axios'

export function useWeather() {
  const loading = ref(false)
  const error = ref(null)
  const weatherData = ref(null)

  // You'll need to get your Google Maps Platform API key
  // and enable the Weather API in your Google Cloud Console
  // You can either set this directly or use environment variables
  const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY'

  const locationInfo = reactive({
    latitude: '',
    longitude: '',
    address: ''
  })

  const fetchWeatherData = async (lat, lng) => {
    loading.value = true
    error.value = null
    
    try {
      // First, get location details from Google Geocoding API
      const geocodeResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`
      )
      
      if (geocodeResponse.data.results.length > 0) {
        locationInfo.address = geocodeResponse.data.results[0].formatted_address
        locationInfo.latitude = lat
        locationInfo.longitude = lng
      }

      // Now fetch weather data from Google Weather API
      const weatherResponse = await axios.get(
        `https://weather.googleapis.com/v1/currentConditions:lookup?key=${GOOGLE_API_KEY}&location.latitude=${lat}&location.longitude=${lng}`
      )

      const weatherApiData = weatherResponse.data
      
      // Transform Google Weather API response to our format
      const transformedWeatherData = {
        location: locationInfo.address || `${lat}, ${lng}`,
        temperature: Math.round(weatherApiData.temperature?.degrees || 0),
        feelsLike: Math.round(weatherApiData.feelsLikeTemperature?.degrees || 0),
        humidity: weatherApiData.relativeHumidity || 0,
        pressure: Math.round(weatherApiData.airPressure?.meanSeaLevelMillibars || 0),
        windSpeed: convertWindSpeed(weatherApiData.wind?.speed),
        windDirection: weatherApiData.wind?.direction?.cardinal || 'N/A',
        cloudCover: weatherApiData.cloudCover || 0,
        rainfall: weatherApiData.precipitation?.qpf?.quantity || 0,
        condition: weatherApiData.weatherCondition?.description?.text || 'Unknown',
        conditionType: weatherApiData.weatherCondition?.type || 'UNKNOWN',
        icon: getWeatherIcon(weatherApiData.weatherCondition?.type),
        uvIndex: weatherApiData.uvIndex || 0,
        visibility: weatherApiData.visibility?.distance || 0,
        dewPoint: Math.round(weatherApiData.dewPoint?.degrees || 0),
        isDaytime: weatherApiData.isDaytime || true,
        currentTime: weatherApiData.currentTime,
        timeZone: weatherApiData.timeZone?.id
      }

      weatherData.value = transformedWeatherData
      
    } catch (err) {
      let errorMessage = 'Failed to fetch weather data'
      
      if (err.response?.status === 403) {
        errorMessage = 'API key is invalid or Weather API is not enabled. Please check your Google Cloud Console settings.'
      } else if (err.response?.status === 404) {
        errorMessage = 'Weather API endpoint not found. Please ensure the Weather API is enabled in your Google Cloud Console.'
      } else if (err.response?.data?.error?.message) {
        errorMessage = err.response.data.error.message
      } else if (err.response?.data?.error_message) {
        errorMessage = err.response.data.error_message
      } else if (err.message) {
        errorMessage = err.message
      }
      
      error.value = errorMessage
      console.error('Weather API Error:', err)
      console.error('Response data:', err.response?.data)
    } finally {
      loading.value = false
    }
  }

  const convertWindSpeed = (windData) => {
    if (!windData) return 0
    
    // Google Weather API returns wind speed in different units
    // Convert to m/s for display
    if (windData.speedKilometersPerHour) {
      return Math.round(windData.speedKilometersPerHour / 3.6 * 100) / 100
    } else if (windData.speedMilesPerHour) {
      return Math.round(windData.speedMilesPerHour * 0.44704 * 100) / 100
    } else if (windData.speedKnots) {
      return Math.round(windData.speedKnots * 0.51444 * 100) / 100
    } else if (windData.speedMetersPerSecond) {
      return Math.round(windData.speedMetersPerSecond * 100) / 100
    }
    return 0
  }

  const getWeatherIcon = (conditionType) => {
    const iconMap = {
      'CLEAR': '☀️',
      'PARTLY_CLOUDY': '⛅',
      'CLOUDY': '☁️',
      'OVERCAST': '☁️',
      'RAIN': '🌧️',
      'LIGHT_RAIN': '🌦️',
      'HEAVY_RAIN': '🌧️',
      'SNOW': '❄️',
      'SLEET': '🌨️',
      'THUNDERSTORM': '⛈️',
      'FOG': '🌫️',
      'MIST': '🌫️',
      'HAZE': '🌫️',
      'WINDY': '💨',
      'TORNADO': '🌪️',
      'HURRICANE': '🌀',
      'UNKNOWN': '🌤️'
    }
    
    return iconMap[conditionType] || '🌤️'
  }

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          reject(new Error('Unable to retrieve your location'))
        }
      )
    })
  }

  const resetWeatherData = () => {
    weatherData.value = null
    error.value = null
    locationInfo.latitude = ''
    locationInfo.longitude = ''
    locationInfo.address = ''
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