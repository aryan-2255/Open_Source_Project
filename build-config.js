// Build script for Netlify - Creates config.js from environment variables
// This allows you to use Netlify environment variables instead of committing keys

const fs = require('fs');

// Get API keys from environment variables (Netlify) or use placeholders
const config = `// ===== API CONFIGURATION - Auto-generated from Environment Variables =====
// This file is generated during Netlify build
// For local development, create config.js manually from config.example.js

const API_CONFIG = {
    // PRIMARY: Google APIs
    googleMaps: {
        key: "${process.env.GOOGLE_MAPS_KEY || 'YOUR_GOOGLE_MAPS_API_KEY_HERE'}",
        libraries: ["places"],
        baseUrl: "https://maps.googleapis.com/maps/api"
    },
    googleAirQuality: {
        key: "${process.env.GOOGLE_MAPS_KEY || 'YOUR_GOOGLE_MAPS_API_KEY_HERE'}",
        baseUrl: "https://airquality.googleapis.com/v1"
    },
    gemini: {
        key: "${process.env.GEMINI_KEY || 'YOUR_GEMINI_API_KEY_HERE'}",
        baseUrl: "https://generativelanguage.googleapis.com/v1",
        model: "gemini-1.5-flash"
    },
    // FALLBACK: OpenWeatherMap (for weather data)
    openWeather: {
        key: "${process.env.OPENWEATHER_KEY || 'YOUR_OPENWEATHER_API_KEY_HERE'}",
        baseUrl: "https://api.openweathermap.org/data/2.5",
        endpoints: {
            weather: "/weather",
            airPollution: "/air_pollution"
        }
    }
};

// Backward compatibility
const API_KEYS = {
    openWeather: API_CONFIG.openWeather.key,
    googleMaps: API_CONFIG.googleMaps.key
};
`;

fs.writeFileSync('config.js', config);
console.log('✅ config.js generated from environment variables');

