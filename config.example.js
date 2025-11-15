// ===== API CONFIGURATION TEMPLATE =====
// Copy this file to config.js and add your actual API keys
// config.js is ignored by git for security

const API_CONFIG = {
    // PRIMARY: Google APIs
    googleMaps: {
        key: "YOUR_GOOGLE_MAPS_API_KEY_HERE",
        libraries: ["places"],
        baseUrl: "https://maps.googleapis.com/maps/api"
    },
    googleAirQuality: {
        key: "YOUR_GOOGLE_MAPS_API_KEY_HERE", // Same key as Maps API
        baseUrl: "https://airquality.googleapis.com/v1"
    },
    gemini: {
        key: "YOUR_GEMINI_API_KEY_HERE",
        baseUrl: "https://generativelanguage.googleapis.com/v1",
        model: "gemini-1.5-flash" // Most reliable model
    },
    // FALLBACK: OpenWeatherMap (for weather data)
    openWeather: {
        key: "YOUR_OPENWEATHER_API_KEY_HERE",
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

