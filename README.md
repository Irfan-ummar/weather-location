# Weather Location App

A modern Vue 3 weather application built with the Composition API that integrates with Google Maps Platform services to display weather information for any location.

## Features

- 🌤️ **Weather Dashboard**: Clean, modern interface for weather data
- 📍 **Location Input**: Manual latitude/longitude entry or automatic geolocation
- 🗺️ **Google Maps Integration**: Uses Google Maps Platform for location services
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ⚡ **Vue 3 Composition API**: Modern Vue.js architecture
- 🎨 **Beautiful UI**: Gradient backgrounds and smooth animations

## Screenshots

The app displays weather information similar to the provided design, showing:
- Temperature, pressure, humidity
- Wind speed, cloud cover, rainfall
- Weather conditions with icons
- Location-based data fetching

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Maps Platform API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd weather-location
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   - Copy the example environment file:
     ```bash
     cp .env.example .env
     ```
   - Edit the `.env` file with your actual values

4. **Set up Google Maps API**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the following APIs:
     - **Weather API** (Essential for weather data)
     - **Geocoding API** (For location name resolution)
     - Maps JavaScript API (optional for future map integration)
   - Create an API key
   - Add your API key to the `.env` file:
     ```
     VITE_GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key_here
     ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Navigate to `http://localhost:3000`

## Project Structure

```
weather-location/
├── src/
│   ├── components/
│   │   ├── AppHeader.vue      # Navigation header with weather button
│   │   └── WeatherModal.vue   # Weather display modal
│   ├── composables/
│   │   └── useWeather.js      # Weather API logic
│   ├── App.vue                # Main application component
│   ├── main.js                # Vue app entry point
│   └── style.css              # Global styles
├── package.json
├── vite.config.js
└── index.html
```

## Usage

1. **Open the Application**: Launch the app in your browser
2. **Click Weather Button**: Click the "Check Weather" button in the header
3. **Enter Location**: 
   - Manually enter latitude and longitude coordinates, OR
   - Click "Use Current Location" to auto-detect your position
4. **View Weather**: Click "Get Weather" to fetch and display weather information
5. **Update Location**: Use "Update Site Location" to change coordinates

## API Integration

### Google Weather API

The app uses the official Google Weather API from Google Maps Platform to fetch real-time weather data:

1. **Current Implementation**: Google Weather API for live weather data
2. **Geocoding API**: Converts coordinates to human-readable location names
3. **Real-time Data**: Fetches current weather conditions including:
   - Temperature and feels-like temperature
   - Humidity, pressure, and dew point
   - Wind speed and direction
   - Cloud cover and precipitation
   - UV index and visibility

### Weather Data Structure

The app transforms Google Weather API response to this format:

```javascript
{
  location: "City, Country",
  temperature: 25,          // Celsius
  feelsLike: 27,           // Feels like temperature
  humidity: 65,            // Percentage
  pressure: 1013,          // hPa
  windSpeed: 3.5,          // m/s
  windDirection: "NW",     // Wind direction
  cloudCover: 20,          // Percentage
  rainfall: 0,             // mm
  condition: "PARTLY CLOUDY",
  conditionType: "PARTLY_CLOUDY",
  icon: "⛅",
  uvIndex: 5,              // UV index
  visibility: 10,          // km
  dewPoint: 18,            // Celsius
  isDaytime: true,         // Boolean
  currentTime: "2024-01-01T12:00:00Z",
  timeZone: "America/New_York"
}
```

## Google Cloud Console Setup

### Step-by-Step API Setup

1. **Create/Select a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Make sure billing is enabled for your project

2. **Enable Required APIs**
   - Navigate to "APIs & Services" > "Library"
   - Search for and enable:
     - **"Weather API"** (Essential for weather data)
     - **"Geocoding API"** (For location names)
     - **"Maps JavaScript API"** (Essential for map display)

3. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key
   - **Important**: Restrict your API key for security

4. **Configure API Key Restrictions (Recommended)**
   - Click on your API key to edit
   - Under "API restrictions", select "Restrict key"
   - Choose "Weather API", "Geocoding API", and "Maps JavaScript API"
   - Under "Website restrictions", add your domain

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `403 Forbidden` | API key invalid or APIs not enabled | Check API key and enable all required APIs |
| `404 Not Found` | API endpoint not found | Ensure all APIs are enabled in Google Cloud Console |
| **Map not showing** | Maps JavaScript API not enabled | Enable "Maps JavaScript API" in Google Cloud Console |
| `CORS Error` | Cross-origin request blocked | Run app from `http://localhost:3000` (not file://) |
| `Billing Error` | Billing not enabled | Enable billing in Google Cloud Console |
| `Quota Exceeded` | API quota limit reached | Check quotas in Google Cloud Console |

### API Quotas and Pricing

- **Weather API**: Check current pricing at [Google Cloud Pricing](https://cloud.google.com/maps-platform/pricing)
- **Geocoding API**: Usually includes free tier
- **Maps JavaScript API**: Usually includes free tier with monthly credits
- **Rate Limits**: Respect API rate limits to avoid quota errors

### Troubleshooting Map Issues

If the map is not showing:

1. **Check Browser Console** for error messages
2. **Verify API Key** is correctly set in `.env` file
3. **Ensure Maps JavaScript API is enabled** in Google Cloud Console
4. **Check API Key Restrictions** - make sure Maps JavaScript API is allowed
5. **Verify Billing** is enabled for your Google Cloud project
6. **Test with simple coordinates** like `40.7128, -74.0060` (New York)

To debug map loading:
```bash
# Check the browser console for error messages
# Look for messages starting with "Map initialization"
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test-api` - Test Google Weather API connectivity

### Troubleshooting API Issues

If you encounter errors, run the API test script:

```bash
npm run test-api
```

This will help diagnose common issues:
- API key configuration
- Weather API enablement
- Geocoding API access
- Network connectivity
- Error codes and solutions

### Customization

1. **Styling**: Modify `src/style.css` for global styles
2. **Weather Sources**: Update `src/composables/useWeather.js` to integrate real weather APIs
3. **Components**: Extend components in `src/components/` for additional features

## Technologies Used

- **Vue 3** - Progressive JavaScript framework
- **Composition API** - Vue 3's modern composition-based API
- **Vite** - Next generation frontend build tool
- **Axios** - HTTP client for API requests
- **Google Maps Platform** - Location and mapping services

## Features to Add

- 🗺️ Interactive map integration
- 📊 Weather charts and graphs
- 🔄 Auto-refresh weather data
- 💾 Save favorite locations
- 🌙 Dark/light theme toggle
- 📅 Weather forecast (7-day)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Open an issue in the repository
- Check the Google Maps Platform documentation
- Review Vue 3 Composition API guides

---

**Note**: Remember to keep your API keys secure and never commit them to version control. Consider using environment variables for production deployments. 