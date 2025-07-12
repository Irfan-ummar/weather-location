#!/usr/bin/env node

/**
 * Google Weather API Test Script
 * 
 * This script tests the Google Weather API to help diagnose issues
 * Run with: node test-api.js
 */

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Test coordinates (New York City)
const TEST_LAT = 40.7128;
const TEST_LNG = -74.0060;

// Replace with your actual API key
const API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';

async function testWeatherAPI() {
  console.log('🌤️  Testing Google Weather API...\n');
  
  if (API_KEY === 'YOUR_API_KEY_HERE') {
    console.log('❌ ERROR: Please set your API key in .env file or as environment variable');
    console.log('   Set VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key\n');
    return;
  }

  try {
    console.log(`📍 Testing coordinates: ${TEST_LAT}, ${TEST_LNG}`);
    console.log(`🔑 API Key: ${API_KEY.substring(0, 10)}...${API_KEY.substring(API_KEY.length - 4)}`);
    
    // Test Geocoding API first
    console.log('\n1️⃣ Testing Geocoding API...');
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${TEST_LAT},${TEST_LNG}&key=${API_KEY}`;
    
    const geocodeResponse = await axios.get(geocodeUrl);
    
    if (geocodeResponse.data.status === 'OK') {
      console.log('✅ Geocoding API: SUCCESS');
      console.log(`   Location: ${geocodeResponse.data.results[0].formatted_address}`);
    } else {
      console.log('❌ Geocoding API: FAILED');
      console.log(`   Error: ${geocodeResponse.data.error_message || geocodeResponse.data.status}`);
    }

    // Test Weather API
    console.log('\n2️⃣ Testing Weather API...');
    const weatherUrl = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${API_KEY}&location.latitude=${TEST_LAT}&location.longitude=${TEST_LNG}`;
    
    const weatherResponse = await axios.get(weatherUrl);
    
    console.log('✅ Weather API: SUCCESS');
    console.log('   Weather Data:');
    console.log(`   - Temperature: ${weatherResponse.data.temperature?.degrees}°C`);
    console.log(`   - Humidity: ${weatherResponse.data.relativeHumidity}%`);
    console.log(`   - Condition: ${weatherResponse.data.weatherCondition?.description?.text}`);
    console.log(`   - Wind: ${weatherResponse.data.wind?.speed?.speedKilometersPerHour || 0} km/h`);
    
    console.log('\n🎉 All tests passed! Your API is working correctly.');
    
  } catch (error) {
    console.log('\n❌ API Test Failed:');
    console.log(`   Status: ${error.response?.status || 'Unknown'}`);
    console.log(`   Error: ${error.response?.data?.error?.message || error.message}`);
    
    if (error.response?.status === 403) {
      console.log('\n🔧 Troubleshooting 403 Error:');
      console.log('   1. Check if your API key is correct');
      console.log('   2. Ensure Weather API is enabled in Google Cloud Console');
      console.log('   3. Check if billing is enabled for your project');
      console.log('   4. Verify API key restrictions allow Weather API');
      
    } else if (error.response?.status === 404) {
      console.log('\n🔧 Troubleshooting 404 Error:');
      console.log('   1. Ensure Weather API is enabled in Google Cloud Console');
      console.log('   2. Check if the API endpoint URL is correct');
      console.log('   3. Verify you are using the correct API key');
      
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n🔧 Troubleshooting Network Error:');
      console.log('   1. Check your internet connection');
      console.log('   2. Verify the API endpoint URL is correct');
      console.log('   3. Check if there are any firewall restrictions');
    }
    
    console.log('\n📚 Resources:');
    console.log('   - Google Cloud Console: https://console.cloud.google.com/');
    console.log('   - Weather API Docs: https://developers.google.com/maps/documentation/weather');
    console.log('   - Enable APIs: https://console.cloud.google.com/apis/library');
  }
}

// Run the test
testWeatherAPI();

export default testWeatherAPI; 