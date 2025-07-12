# Vue 3 Weather Dashboard - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Prerequisites
- Node.js (v16+)
- Google Cloud Platform account
- Google Maps Platform API key

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create `.env` file in root:
```env
VITE_GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key_here
VITE_GOOGLE_MAPS_MAP_ID=your_map_id_here
```

### 3. Google Cloud Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable these APIs:
   - Maps JavaScript API
   - Geocoding API  
   - Weather API
3. Create API key and add to `.env`

### 4. Start Development
```bash
npm run dev
```

### 5. Test Your Setup
```bash
npm run test-api
```

## 🌟 Key Features Demo

### Weather Popup
1. Go to Dashboard → "Open Weather Tool"
2. Enter coordinates: `40.7128, -74.0060` (NYC)
3. Click "Get Weather"

### Project with Map
1. Go to Projects → "Create New Project" 
2. Fill in project details + coordinates
3. Save to see interactive map with red marker
4. Click weather button on map

## 🏗️ Vue 3 Implementation Highlights

### Weather Composable
```javascript
// src/composables/useWeather.js
export function useWeather() {
  const weatherData = ref(null)
  const loading = ref(false)
  
  const fetchWeatherData = async (lat, lng) => {
    // Google Weather API call
    const response = await axios.get(
      `https://weather.googleapis.com/v1/currentConditions:lookup?key=${API_KEY}&location.latitude=${lat}&location.longitude=${lng}`
    )
    weatherData.value = transformWeatherData(response.data)
  }
  
  return { weatherData, loading, fetchWeatherData }
}
```

### Google Maps Integration
```javascript
// src/views/ProjectDetails.vue
const initializeMap = async () => {
  const loader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places', 'marker']
  })
  
  const google = await loader.load()
  const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker")
  
  // Create map with red marker
  const pin = new PinElement({
    background: "#FF0000",
    scale: 1.2
  })
  
  const marker = new AdvancedMarkerElement({
    map: map.value,
    position: { lat, lng },
    content: pin.element,
    gmpDraggable: true
  })
}
```

## 🔧 Troubleshooting

### API Key Issues (403 Error)
- Check if Weather API is enabled in Google Cloud Console
- Ensure billing is enabled
- Verify API key is correct in `.env`

### Map Not Loading
- Check if Maps JavaScript API is enabled
- Verify VITE_GOOGLE_MAPS_API_KEY in console
- Check for browser console errors

### Weather Data Not Showing
- Run `npm run test-api` to debug
- Check if coordinates are valid numbers
- Verify internet connection

## 📁 Project Structure
```
src/
├── components/
│   ├── AppHeader.vue       # Navigation with weather access
│   └── WeatherModal.vue    # Weather popup component
├── composables/
│   ├── useWeather.js       # Weather API logic
│   └── useProjects.js      # Project management
├── views/
│   ├── Dashboard.vue       # Main dashboard
│   ├── ProjectsList.vue    # Projects table
│   └── ProjectDetails.vue  # Project form + map
└── router/index.js         # Vue Router config
```

## 🎯 Next Steps
- Read full documentation in `WEATHER_DASHBOARD_GUIDE.md`
- Customize styling in component `<style scoped>` sections
- Add more weather data fields in `useWeather.js`
- Implement project filtering/search
- Add weather history tracking
- Deploy to production platform

---

**Need Help?** Check the complete guide in `WEATHER_DASHBOARD_GUIDE.md` for detailed explanations, API setup instructions, and troubleshooting tips. 