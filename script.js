// ===== GLOBAL VARIABLES =====
let currentCity = null; // Will be set when user searches
let weatherData = null;
let airQualityData = null;
let map = null; // Google Maps instance
let marker = null; // Map marker
let autocomplete = null; // Google Places Autocomplete
let googleMapsReady = false; // Flag to track if Google Maps is loaded
let tempChart = null; // Chart.js instance for temperature
let aqiChart = null; // Chart.js instance for air quality
let weatherChart = null; // Chart.js instance for weather metrics

// ===== API CONFIGURATION =====
// API keys are loaded from config.js file (not committed to git)
// If config.js doesn't exist, show error
if (typeof API_CONFIG === 'undefined') {
    console.error('❌ ERROR: config.js file not found!');
    console.error('Please create config.js with your API keys.');
    alert('Configuration file missing! Please create config.js with your API keys.');
    
    // Fallback empty config to prevent errors
    window.API_CONFIG = {
        openWeather: { 
            key: '', 
            baseUrl: 'https://api.openweathermap.org/data/2.5',
            endpoints: { weather: '/weather', airPollution: '/air_pollution' }
        },
        googleMaps: { 
            key: '', 
            libraries: ['places'],
            baseUrl: 'https://maps.googleapis.com/maps/api'
        }
    };
    
    // Also set API_KEYS for backward compatibility
    window.API_KEYS = {
        openWeather: '',
        googleMaps: ''
    };
}

// ===== GOOGLE MAPS CALLBACK =====
// This is called when Google Maps API finishes loading
function initGoogleMaps() {
    googleMapsReady = true;
    console.log("✅ Google Maps API loaded successfully");
    
    // Initialize map
    initializeGoogleMap();
    
    // Initialize autocomplete for search
    initializeAutocomplete();
}

// ===== INITIALIZATION =====
// This function runs when the page loads
function init() {
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000); // Update time every second
    
    // Load Google Maps API dynamically
    loadGoogleMapsAPI();
    
    // Show welcome message
    console.log("Smart City Dashboard Loaded!");
    console.log("APIs: OpenWeatherMap + Google Maps");
    console.log("Search for a city to see real-time data!");
}

// ===== LOAD GOOGLE MAPS API DYNAMICALLY =====
function loadGoogleMapsAPI() {
    const script = document.getElementById('google-maps-script');
    if (script) {
        const libraries = API_CONFIG.googleMaps.libraries.join(',');
        const callback = 'initGoogleMaps';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_CONFIG.googleMaps.key}&libraries=${libraries}&callback=${callback}`;
    }
}

// ===== UPDATE CURRENT TIME =====
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    const dateString = now.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });
    
    document.getElementById('currentTime').textContent = `${dateString} - ${timeString}`;
}

// ===== NAVIGATION BETWEEN SECTIONS =====
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update active menu item
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.classList.remove('active');
    });
    
    event.currentTarget.classList.add('active');
    
    console.log(`Switched to ${sectionName} section`);
}

// ===== SEARCH CITY =====
function searchCity() {
    const searchInput = document.getElementById('citySearch');
    let cityName = searchInput.value.trim();
    
    if (cityName === "") {
        alert("Please enter a city name!");
        return;
    }
    
    // If using Google Places autocomplete, extract just the city name
    // Remove country and other details if present
    const cityParts = cityName.split(',');
    cityName = cityParts[0].trim(); // Take first part (city name)
    
    currentCity = cityName;
    document.getElementById('selectedCity').textContent = cityName;
    
    console.log(`🔍 Fetching data for city: ${cityName}`);
    
    // PRIMARY: Get coordinates from Google Geocoding FIRST (most accurate)
    if (googleMapsReady) {
        geocodeCityForData(cityName);
    } else {
        // Fallback: Use OpenWeather to get coordinates
        fetchWeatherData(cityName);
    }
}

// ===== FETCH WEATHER DATA FROM OPENWEATHERMAP =====
async function fetchWeatherData(city) {
    try {
        // Show loading state
        document.getElementById('temperature').textContent = "...";
        document.getElementById('weatherDesc').textContent = "Loading...";
        
        // Build API URL from config
        const baseUrl = API_CONFIG.openWeather.baseUrl;
        const endpoint = API_CONFIG.openWeather.endpoints.weather;
        const url = `${baseUrl}${endpoint}?q=${encodeURIComponent(city)}&appid=${API_CONFIG.openWeather.key}&units=metric`;
        
        console.log(`🌤️ Fetching weather for: ${city}`);
        const startTime = performance.now();
        
        // Fetch data from API
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(0);
        
        if (data.cod === 200) {
            weatherData = data;
            updateWeatherDisplay(data);
            updateRawDataTables(data, 'weather');
            console.log(`✅ Weather data fetched successfully in ${duration}ms`, data);
            
            // Trigger air quality fetch after weather data is loaded (has coordinates)
            fetchAirQualityData(city, data.coord);
            
            // Update charts with real API data
            updateCharts();
            
            return data;
        } else {
            console.error("❌ Weather API Error:", data.message);
            alert(`Error: ${data.message}. Try another city name.`);
            document.getElementById('weatherDesc').textContent = "City not found";
            return null;
        }
    } catch (error) {
        console.error("❌ Error fetching weather data:", error);
        alert("Failed to fetch weather data. Check your internet connection.");
        document.getElementById('weatherDesc').textContent = "Failed to load";
        return null;
    }
}

// ===== FETCH AIR QUALITY DATA FROM GOOGLE AIR QUALITY API =====
async function fetchAirQualityData(city, coordinates = null) {
    try {
        // Get coordinates from parameter or existing weather data
        let lat, lon;
        if (coordinates) {
            lat = coordinates.lat;
            lon = coordinates.lon;
        } else if (weatherData && weatherData.coord) {
            lat = weatherData.coord.lat;
            lon = weatherData.coord.lon;
        } else {
            console.log("⏳ Waiting for weather data to get coordinates...");
            // If weather data not available yet, fetch it first
            const weatherInfo = await fetchWeatherData(city);
            if (!weatherInfo || !weatherInfo.coord) {
                console.error("❌ Cannot get coordinates for air quality");
                return;
            }
            lat = weatherInfo.coord.lat;
            lon = weatherInfo.coord.lon;
        }
        
        // Show loading state
        document.getElementById('aqiValue').textContent = "...";
        document.getElementById('aqiStatus').textContent = "Loading...";
        
        // Build Google Air Quality API URL
        const baseUrl = API_CONFIG.googleAirQuality.baseUrl;
        const url = `${baseUrl}/currentConditions:lookup?key=${API_CONFIG.googleAirQuality.key}`;
        
        console.log(`🌬️ Fetching Google Air Quality for coordinates: ${lat}, ${lon}`);
        const startTime = performance.now();
        
        // Prepare request payload for Google API
        const payload = {
            location: {
                latitude: lat,
                longitude: lon
            }
        };
        
        // Fetch data from Google Air Quality API
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            console.warn(`⚠️ Google Air Quality API error: ${response.status}, falling back to OpenWeather`);
            // Fallback to OpenWeatherMap
            return fetchAirQualityDataOpenWeather(lat, lon, city);
        }
        
        const data = await response.json();
        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(0);
        
        if (data && data.indexes) {
            airQualityData = data;
            updateAirQualityDisplayGoogle(data);
            updateRawDataTables(data, 'aqi_google');
            console.log(`✅ Google Air Quality data fetched successfully in ${duration}ms`, data);
            
            // Update JSON display with all available data
            updateJSONDisplay();
            
            // Update charts with air quality data
            updateCharts();
        } else {
            console.warn("⚠️ No Google AQI data, trying OpenWeather fallback");
            return fetchAirQualityDataOpenWeather(lat, lon, city);
        }
    } catch (error) {
        console.error("❌ Error fetching Google Air Quality data:", error);
        console.log("🔄 Falling back to OpenWeather Air Quality");
        // Fallback to OpenWeatherMap
        return fetchAirQualityDataOpenWeather(lat, lon, city);
    }
}

// ===== FALLBACK: FETCH AIR QUALITY FROM OPENWEATHERMAP =====
async function fetchAirQualityDataOpenWeather(lat, lon, city) {
    try {
        const baseUrl = API_CONFIG.openWeather.baseUrl;
        const endpoint = API_CONFIG.openWeather.endpoints.airPollution;
        const url = `${baseUrl}${endpoint}?lat=${lat}&lon=${lon}&appid=${API_CONFIG.openWeather.key}`;
        
        console.log(`🌬️ Fetching OpenWeather Air Quality (fallback) for: ${city}`);
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.list && data.list.length > 0) {
            airQualityData = data.list[0];
            updateAirQualityDisplay(airQualityData);
            updateRawDataTables(airQualityData, 'aqi');
            console.log(`✅ OpenWeather Air Quality data fetched (fallback)`, airQualityData);
            updateJSONDisplay();
            
            // Update charts with air quality data
            updateCharts();
        } else {
            document.getElementById('aqiStatus').textContent = "Data not available";
        }
    } catch (error) {
        console.error("❌ Error fetching OpenWeather Air Quality:", error);
        document.getElementById('aqiStatus').textContent = "Failed to load";
    }
}

// ===== UPDATE WEATHER DISPLAY =====
function updateWeatherDisplay(data) {
    // Temperature
    document.getElementById('temperature').textContent = Math.round(data.main.temp);
    document.getElementById('feelsLike').textContent = Math.round(data.main.feels_like);
    
    // Weather description
    document.getElementById('weatherDesc').textContent = data.weather[0].description.toUpperCase();
    
    // Other weather info
    document.getElementById('windSpeed').textContent = `${data.wind.speed} km/h`;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('visibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
    
    // Sunrise and Sunset
    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    document.getElementById('sunrise').textContent = sunrise;
    document.getElementById('sunset').textContent = sunset;
    
    // Last update time
    const lastUpdate = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    document.getElementById('lastUpdate').textContent = lastUpdate;
    
    // Map location data
    document.getElementById('mapCity').textContent = data.name;
    document.getElementById('coordinates').textContent = `${data.coord.lat.toFixed(2)}, ${data.coord.lon.toFixed(2)}`;
    document.getElementById('timezone').textContent = `UTC ${data.timezone / 3600 > 0 ? '+' : ''}${(data.timezone / 3600).toFixed(1)}`;
    
    // Update Google Map with city location
    updateGoogleMap(data.coord.lat, data.coord.lon, data.name);
    
    // Fetch city details from Google Places API
    fetchCityDetails(data.name, data.coord.lat, data.coord.lon);
    
    // Generate AI city description
    generateCityDescription(data.name, data);
}

// ===== UPDATE AIR QUALITY DISPLAY (GOOGLE API) =====
function updateAirQualityDisplayGoogle(data) {
    // Google Air Quality API returns indexes array
    // Find the US AQI or universal AQI
    let aqiIndex = data.indexes.find(idx => idx.code === 'uaqi') || data.indexes[0];
    
    if (!aqiIndex) {
        console.error("No AQI index found in Google data");
        return;
    }
    
    const aqiValue = aqiIndex.aqi;
    const dominantPollutant = aqiIndex.dominantPollutant || "N/A";
    
    // Log full data to see what Google is sending
    console.log(`📊 Full Google AQI Data:`, aqiIndex);
    
    // Determine status and color based on AQI value (IGNORE Google's category - use our own logic)
    let aqiStatus, aqiClass, healthMessage;
    
    if (aqiValue <= 50) {
        aqiStatus = "Good";
        healthMessage = "Air quality is excellent";
        aqiClass = "aqi-good";
    } else if (aqiValue <= 100) {
        aqiStatus = "Moderate";
        healthMessage = "Air quality is acceptable";
        aqiClass = "aqi-moderate";
    } else if (aqiValue <= 150) {
        aqiStatus = "Unhealthy for Sensitive";
        healthMessage = "May affect sensitive people";
        aqiClass = "aqi-moderate";
    } else if (aqiValue <= 200) {
        aqiStatus = "Unhealthy";
        healthMessage = "Everyone may experience health effects";
        aqiClass = "aqi-unhealthy";
    } else if (aqiValue <= 300) {
        aqiStatus = "Very Unhealthy";
        healthMessage = "Health alert - everyone may be affected";
        aqiClass = "aqi-unhealthy";
    } else {
        aqiStatus = "Hazardous";
        healthMessage = "Health warning of emergency conditions";
        aqiClass = "aqi-unhealthy";
    }
    
    const aqiValueElement = document.getElementById('aqiValue');
    const aqiStatusElement = document.getElementById('aqiStatus');
    
    // Update AQI value
    aqiValueElement.textContent = aqiValue;
    
    // Remove all AQI classes
    aqiValueElement.classList.remove('aqi-good', 'aqi-moderate', 'aqi-unhealthy');
    
    // Add appropriate class
    aqiValueElement.classList.add(aqiClass);
    
    // Set proper status text
    aqiStatusElement.textContent = `${aqiStatus} - ${healthMessage}`;
    
    console.log(`📊 Google AQI: ${aqiValue} | Status: ${aqiStatus} | Dominant: ${dominantPollutant}`);
}

// ===== UPDATE AIR QUALITY DISPLAY (OPENWEATHER - FALLBACK) =====
function updateAirQualityDisplay(data) {
    // OpenWeatherMap returns AQI in data.main.aqi (1-5 scale)
    // 1 = Good, 2 = Fair, 3 = Moderate, 4 = Poor, 5 = Very Poor
    const aqi = data.main.aqi;
    
    // Convert to US AQI scale (0-500) for display
    // This is an approximation
    let aqiValue, aqiStatus, aqiClass;
    
    switch(aqi) {
        case 1:
            aqiValue = 25;
            aqiStatus = "Good - Air quality is excellent (OpenWeather)";
            aqiClass = "aqi-good";
            break;
        case 2:
            aqiValue = 60;
            aqiStatus = "Fair - Air quality is acceptable (OpenWeather)";
            aqiClass = "aqi-good";
            break;
        case 3:
            aqiValue = 100;
            aqiStatus = "Moderate - May affect sensitive people (OpenWeather)";
            aqiClass = "aqi-moderate";
            break;
        case 4:
            aqiValue = 150;
            aqiStatus = "Poor - Health effects for everyone (OpenWeather)";
            aqiClass = "aqi-unhealthy";
            break;
        case 5:
            aqiValue = 250;
            aqiStatus = "Very Poor - Serious health effects (OpenWeather)";
            aqiClass = "aqi-unhealthy";
            break;
        default:
            aqiValue = "--";
            aqiStatus = "Unknown";
            aqiClass = "aqi-good";
    }
    
    const aqiValueElement = document.getElementById('aqiValue');
    const aqiStatusElement = document.getElementById('aqiStatus');
    
    // Update AQI value
    aqiValueElement.textContent = aqiValue;
    
    // Remove all AQI classes
    aqiValueElement.classList.remove('aqi-good', 'aqi-moderate', 'aqi-unhealthy');
    
    // Add appropriate class
    aqiValueElement.classList.add(aqiClass);
    aqiStatusElement.textContent = aqiStatus;
}

// ===== UPDATE RAW DATA TABLES =====
function updateRawDataTables(data, type) {
    if (type === 'weather') {
        const tableBody = document.getElementById('weatherDataTable');
        tableBody.innerHTML = `
            <tr>
                <td>Temperature</td>
                <td>${Math.round(data.main.temp)}</td>
                <td>°C</td>
            </tr>
            <tr>
                <td>Feels Like</td>
                <td>${Math.round(data.main.feels_like)}</td>
                <td>°C</td>
            </tr>
            <tr>
                <td>Min Temperature</td>
                <td>${Math.round(data.main.temp_min)}</td>
                <td>°C</td>
            </tr>
            <tr>
                <td>Max Temperature</td>
                <td>${Math.round(data.main.temp_max)}</td>
                <td>°C</td>
            </tr>
            <tr>
                <td>Humidity</td>
                <td>${data.main.humidity}</td>
                <td>%</td>
            </tr>
            <tr>
                <td>Pressure</td>
                <td>${data.main.pressure}</td>
                <td>hPa</td>
            </tr>
            <tr>
                <td>Wind Speed</td>
                <td>${data.wind.speed}</td>
                <td>m/s</td>
            </tr>
            <tr>
                <td>Wind Direction</td>
                <td>${data.wind.deg || 'N/A'}</td>
                <td>degrees</td>
            </tr>
            <tr>
                <td>Visibility</td>
                <td>${(data.visibility / 1000).toFixed(1)}</td>
                <td>km</td>
            </tr>
            <tr>
                <td>Cloudiness</td>
                <td>${data.clouds.all}</td>
                <td>%</td>
            </tr>
        `;
    }
    
    if (type === 'aqi_google') {
        const tableBody = document.getElementById('aqiDataTable');
        let tableHTML = '';
        
        // Google Air Quality data structure
        if (data.indexes && data.indexes.length > 0) {
            data.indexes.forEach(index => {
                tableHTML += `
                    <tr>
                        <td>${index.displayName || index.code}</td>
                        <td>AQI: ${index.aqi}</td>
                        <td>${index.category || 'N/A'}</td>
                    </tr>
                `;
            });
        }
        
        // Add pollutant data if available
        if (data.pollutants && data.pollutants.length > 0) {
            data.pollutants.forEach(pollutant => {
                const concentration = pollutant.concentration?.value || 'N/A';
                const unit = pollutant.concentration?.units || '';
                tableHTML += `
                    <tr>
                        <td>${pollutant.displayName || pollutant.code}</td>
                        <td>${concentration} ${unit}</td>
                        <td>Google Data</td>
                    </tr>
                `;
            });
        }
        
        tableBody.innerHTML = tableHTML || '<tr><td colspan="3" class="no-data">No air quality data available</td></tr>';
    }
    
    if (type === 'aqi') {
        const tableBody = document.getElementById('aqiDataTable');
        const components = data.components;
        
        let tableHTML = '';
        
        // Define pollutant names and their units
        const pollutants = {
            'co': { name: 'Carbon Monoxide (CO)', unit: 'μg/m³' },
            'no': { name: 'Nitrogen Monoxide (NO)', unit: 'μg/m³' },
            'no2': { name: 'Nitrogen Dioxide (NO2)', unit: 'μg/m³' },
            'o3': { name: 'Ozone (O3)', unit: 'μg/m³' },
            'so2': { name: 'Sulphur Dioxide (SO2)', unit: 'μg/m³' },
            'pm2_5': { name: 'PM2.5', unit: 'μg/m³' },
            'pm10': { name: 'PM10', unit: 'μg/m³' },
            'nh3': { name: 'Ammonia (NH3)', unit: 'μg/m³' }
        };
        
        for (let pollutant in components) {
            const value = components[pollutant];
            const pollutantInfo = pollutants[pollutant] || { name: pollutant.toUpperCase(), unit: 'μg/m³' };
            
            // Determine status based on value (simplified)
            let status = 'Good';
            if (value > 50) status = 'Moderate';
            if (value > 100) status = 'Unhealthy';
            
            tableHTML += `
                <tr>
                    <td>${pollutantInfo.name}</td>
                    <td>${value.toFixed(2)} ${pollutantInfo.unit}</td>
                    <td>${status} (Fallback)</td>
                </tr>
            `;
        }
        
        tableBody.innerHTML = tableHTML || '<tr><td colspan="3" class="no-data">No air quality data available</td></tr>';
    }
}

// ===== GOOGLE MAPS INTEGRATION =====
// Initialize Google Map (empty map on load)
function initializeGoogleMap() {
    // Check if Google Maps API is loaded
    if (typeof google === 'undefined' || !google.maps) {
        console.error("Google Maps API not loaded");
        return;
    }
    
    const mapContainer = document.getElementById('mapContainer');
    
    if (!mapContainer) {
        console.error("Map container not found");
        return;
    }
    
    // Default center (world view)
    const defaultCenter = { lat: 20.0, lng: 0.0 };
    
    try {
        // Initialize map
        map = new google.maps.Map(mapContainer, {
            center: defaultCenter,
            zoom: 2,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true
        });
        
        console.log("✅ Google Map initialized successfully");
    } catch (error) {
        console.error("Error initializing Google Map:", error);
    }
}

// Update map with city location
function updateGoogleMap(lat, lon, cityName) {
    // Check if Google Maps API is loaded
    if (typeof google === 'undefined' || !google.maps) {
        console.error("Google Maps API not loaded");
        return;
    }
    
    // If map not initialized, initialize it now
    if (!map) {
        initializeGoogleMap();
    }
    
    if (!map) {
        console.error("Map not initialized");
        return;
    }
    
    const location = { lat: lat, lng: lon };
    
    try {
        // Center map on city
        map.setCenter(location);
        map.setZoom(12);
        
        // Remove existing marker if any
        if (marker) {
            marker.setMap(null);
        }
        
        // Add new marker
        marker = new google.maps.Marker({
            position: location,
            map: map,
            title: cityName,
            animation: google.maps.Animation.DROP
        });
        
        // Add info window
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 10px;">
                    <h3 style="margin: 0 0 5px 0; color: #667eea;">${cityName}</h3>
                    <p style="margin: 0; color: #666;">Lat: ${lat.toFixed(4)}, Lng: ${lon.toFixed(4)}</p>
                </div>
            `
        });
        
        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
        
        console.log(`✅ Map updated for ${cityName} at ${lat}, ${lon}`);
    } catch (error) {
        console.error("Error updating map:", error);
    }
}

// Initialize Google Places Autocomplete for search input
function initializeAutocomplete() {
    if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
        console.warn("Google Places API not available - search will work without autocomplete");
        return;
    }
    
    const searchInput = document.getElementById('citySearch');
    if (!searchInput) {
        console.error("Search input not found");
        return;
    }
    
    try {
        // Create autocomplete object with options that don't interfere with typing
        autocomplete = new google.maps.places.Autocomplete(searchInput, {
            types: ['(cities)'], // Restrict to cities only
            fields: ['name', 'geometry', 'formatted_address']
        });
        
        // Allow normal typing by not preventing default behavior
        searchInput.setAttribute('autocomplete', 'off');
        
        // When user selects a place from autocomplete
        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            
            if (!place.geometry) {
                console.warn("No geometry found for place");
                return;
            }
            
            // Extract city name
            const cityName = place.name || place.formatted_address.split(',')[0];
            
            // Update search input
            searchInput.value = cityName;
            
            // Get coordinates
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            
            console.log(`📍 Place selected: ${cityName} at ${lat}, ${lng}`);
            
            // Update map immediately with Google coordinates
            updateGoogleMap(lat, lng, cityName);
            
            // Fetch weather data (which will trigger air quality and energy automatically)
            currentCity = cityName;
            document.getElementById('selectedCity').textContent = cityName;
            fetchWeatherData(cityName);
        });
        
        console.log("✅ Google Places Autocomplete initialized");
    } catch (error) {
        console.error("Error initializing autocomplete:", error);
    }
}

// ===== PRIMARY: GEOCODE CITY USING GOOGLE (GET ACCURATE COORDINATES FIRST) =====
async function geocodeCityForData(cityName) {
    if (!googleMapsReady) {
        console.warn("Google Maps not ready, falling back to OpenWeather");
        fetchWeatherData(cityName);
        return;
    }
    
    try {
        console.log(`📍 [PRIMARY] Getting coordinates from Google Geocoding for: ${cityName}`);
        const geocoder = new google.maps.Geocoder();
        
        geocoder.geocode({ address: cityName }, async (results, status) => {
            if (status === 'OK' && results[0]) {
                const location = results[0].geometry.location;
                const lat = location.lat();
                const lng = location.lng();
                
                console.log(`✅ [PRIMARY] Google coordinates for ${cityName}: ${lat}, ${lng}`);
                
                // Update map immediately with Google coordinates
                    updateGoogleMap(lat, lng, cityName);
                
                // Update location details
                document.getElementById('coordinates').textContent = `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
                
                // Fetch city details from Google
                fetchCityDetails(cityName, lat, lng);
                
                // NOW use Google coordinates for all APIs (more accurate!)
                // Fetch weather using coordinates (more accurate than city name)
                await fetchWeatherDataByCoordinates(lat, lng, cityName);
                
                // Fetch air quality using Google coordinates
                await fetchAirQualityData(cityName, { lat, lon: lng });
                
        } else {
                console.warn(`⚠️ Google Geocoding failed for ${cityName}: ${status}, using OpenWeather fallback`);
                // Fallback to OpenWeather
                fetchWeatherData(cityName);
        }
        });
    } catch (error) {
        console.error("❌ Error in Google geocoding:", error);
        // Fallback to OpenWeather
        fetchWeatherData(cityName);
    }
}

// ===== FETCH WEATHER BY COORDINATES (MORE ACCURATE) =====
async function fetchWeatherDataByCoordinates(lat, lon, cityName) {
    try {
        // Show loading state
        document.getElementById('temperature').textContent = "...";
        document.getElementById('weatherDesc').textContent = "Loading...";
        
        // Use coordinates instead of city name (more accurate!)
        const baseUrl = API_CONFIG.openWeather.baseUrl;
        const endpoint = API_CONFIG.openWeather.endpoints.weather;
        const url = `${baseUrl}${endpoint}?lat=${lat}&lon=${lon}&appid=${API_CONFIG.openWeather.key}&units=metric`;
        
        console.log(`🌤️ [PRIMARY] Fetching weather using Google coordinates: ${lat}, ${lon}`);
        const startTime = performance.now();
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(0);
        
        if (data.cod === 200) {
            weatherData = data;
            updateWeatherDisplay(data);
            updateRawDataTables(data, 'weather');
            console.log(`✅ Weather data fetched using Google coordinates in ${duration}ms`);
            
            // Update charts with real API data
            updateCharts();
            
            return data;
        } else {
            console.error("❌ Weather API Error:", data.message);
            document.getElementById('weatherDesc').textContent = "City not found";
            return null;
        }
    } catch (error) {
        console.error("❌ Error fetching weather data:", error);
        document.getElementById('weatherDesc').textContent = "Failed to load";
        return null;
    }
}

// Geocode city name to get coordinates (backup method)
async function geocodeCity(cityName) {
    if (!googleMapsReady) {
        return;
    }
    
    try {
        const geocoder = new google.maps.Geocoder();
        
        geocoder.geocode({ address: cityName }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const location = results[0].geometry.location;
                const lat = location.lat();
                const lng = location.lng();
                
                console.log(`✅ Geocoded ${cityName}: ${lat}, ${lng}`);
                
                // Update map if not already updated
                if (map && (!marker || marker.getPosition().lat() !== lat)) {
                    updateGoogleMap(lat, lng, cityName);
                }
                
                // Update location details
                document.getElementById('coordinates').textContent = `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
                
                // Fetch city details
                fetchCityPopulation(cityName, lat, lng);
            } else {
                console.warn(`Geocoding failed for ${cityName}: ${status}`);
            }
        });
    } catch (error) {
        console.error("Error geocoding city:", error);
    }
}

// Fetch city details using Google Geocoding API
async function fetchCityDetails(cityName, lat, lon) {
    try {
        // Using Google Geocoding API to get place details
        const baseUrl = API_CONFIG.googleMaps.baseUrl;
        const geocodeUrl = `${baseUrl}/geocode/json?latlng=${lat},${lon}&key=${API_CONFIG.googleMaps.key}`;
        
        const response = await fetch(geocodeUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'OK' && data.results.length > 0) {
            // Get formatted address
            const result = data.results[0];
            const formattedAddress = result.formatted_address;
            
            // Update population field with formatted address
            document.getElementById('population').textContent = formattedAddress || cityName;
            console.log(`✅ City details fetched: ${formattedAddress}`);
        } else {
            document.getElementById('population').textContent = cityName;
        }
    } catch (error) {
        console.error("❌ Error fetching city details:", error);
        document.getElementById('population').textContent = cityName;
    }
}

// ===== UPDATE JSON DISPLAY =====
function updateJSONDisplay() {
    const jsonElement = document.getElementById('jsonData');
    if (jsonElement) {
        const allData = {
            weather: weatherData || null,
            airQuality: airQualityData || null
        };
        jsonElement.textContent = JSON.stringify(allData, null, 2);
    }
}

// ===== GENERATE AI CITY DESCRIPTION WITH GEMINI =====
async function generateCityDescription(cityName, weatherData) {
    try {
        const descriptionElement = document.getElementById('cityDescription');
        if (!descriptionElement) return;
        
        // Show loading state
        descriptionElement.innerHTML = '<p class="loading-text ai-generating">🤖 AI is analyzing the city... Generating insights...</p>';
        
        // Get AQI value if available
        let aqiInfo = "Air quality data loading...";
        if (airQualityData) {
            if (airQualityData.indexes) {
                // Google AQI
                const aqiIndex = airQualityData.indexes.find(idx => idx.code === 'uaqi') || airQualityData.indexes[0];
                aqiInfo = `Current AQI: ${aqiIndex.aqi} (${aqiIndex.aqi <= 50 ? 'Good' : aqiIndex.aqi <= 100 ? 'Moderate' : 'Unhealthy'} air quality)`;
            } else if (airQualityData.main) {
                // OpenWeather AQI
                const aqiMap = {1: "Excellent", 2: "Good", 3: "Moderate", 4: "Poor", 5: "Very Poor"};
                aqiInfo = `Air quality: ${aqiMap[airQualityData.main.aqi]}`;
            }
        }
        
        // Get location details from Google (if available)
        const coordinates = `${weatherData.coord.lat.toFixed(4)}, ${weatherData.coord.lon.toFixed(4)}`;
        const country = weatherData.sys.country || '';
        
        // Create prompt for Gemini using Google Maps data
        const prompt = `You are a smart city advisor helping people decide where to live, work, or study.

Analyze ${cityName}${country ? `, ${country}` : ''} and provide a comprehensive, engaging description (200-250 words) covering:

Current Real-Time Data:
- Temperature: ${Math.round(weatherData.main.temp)}°C
- Weather Condition: ${weatherData.weather[0].description}
- ${aqiInfo}
- Location Coordinates: ${coordinates}
- Humidity: ${weatherData.main.humidity}%
- Wind Speed: ${(weatherData.wind.speed * 3.6).toFixed(1)} km/h

Please provide:
1. **Smart City Rating**: How technologically advanced and smart is this city? (infrastructure, connectivity, innovation, digital services)
2. **For Students**: Education opportunities, universities, cost of living, student life, safety
3. **For Professionals**: Job market, industries, work culture, career growth, business opportunities
4. **Quality of Life**: Safety, healthcare, transportation, entertainment, culture, climate
5. **Why Choose This City**: Top 3 compelling reasons to move here based on current data

Write in an enthusiastic, informative tone. Be specific and practical. Make it engaging and helpful for someone considering relocation. Use the real-time weather and air quality data to make your description current and relevant.`;

        console.log(`🤖 Generating AI description for: ${cityName}`);
        const startTime = performance.now();
        
        // Call Gemini API - Use correct model name
        const apiKey = API_CONFIG.gemini.key;
        if (!apiKey || apiKey === '') {
            throw new Error('Gemini API key is missing');
        }
        
        // Try multiple API versions and models (trying more common models first)
        const apiVersions = ['v1', 'v1beta'];
        const modelsToTry = [
            'gemini-1.5-flash',  // Most common and reliable
            'gemini-1.5-pro',
            'gemini-2.0-flash-exp',
            'gemini-2.5-flash',
            'gemini-pro',
            'gemini-1.0-pro'
        ];
        
        console.log('🤖 Calling Gemini API...');
        console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'Missing');
        console.log('Will try:', apiVersions.length * modelsToTry.length, 'combinations');
        
        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 800,
                topP: 0.8,
                topK: 40
            }
        };
        
        let lastError = null;
        
        // Try each API version and model combination until one works
        for (const apiVersion of apiVersions) {
            const baseUrl = `https://generativelanguage.googleapis.com/${apiVersion}`;
            
            for (const model of modelsToTry) {
                const url = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;
                console.log(`\n🔄 Trying: ${apiVersion} / ${model}`);
                console.log('URL:', url.substring(0, 100) + '...');
                
                try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
                        body: JSON.stringify(requestBody)
        });
        
                    console.log(`Response status for ${apiVersion}/${model}:`, response.status);
        
                    if (response.ok) {
                        const data = await response.json();
                        const endTime = performance.now();
                        const duration = (endTime - startTime).toFixed(0);
        
                        console.log(`✅ ${apiVersion}/${model} worked!`);
                        console.log('✅ Full Gemini response:', JSON.stringify(data, null, 2));
                    
                    // Check for prompt feedback or safety blocks first
                    if (data.promptFeedback && data.promptFeedback.blockReason) {
                        console.warn(`⚠️ Prompt blocked: ${data.promptFeedback.blockReason}`);
                        lastError = new Error(`Content blocked by safety filters: ${data.promptFeedback.blockReason}`);
                        continue;
                    }
                    
                    // Extract AI-generated text - handle multiple response formats
                    let aiText = null;
                    let candidate = null;
                    
                    if (data.candidates && data.candidates.length > 0) {
                        candidate = data.candidates[0];
                        
                        // Check if candidate was blocked
                        if (candidate.finishReason) {
                            if (candidate.finishReason !== 'STOP' && candidate.finishReason !== 'MAX_TOKENS') {
                                console.warn(`⚠️ Candidate finished with reason: ${candidate.finishReason}`);
                                if (candidate.finishReason === 'SAFETY') {
                                    lastError = new Error('Response blocked by safety filters');
                                    continue;
                                }
                            }
                        }
                        
                        // Try different paths to get text
                        if (candidate.content && candidate.content.parts) {
                            if (candidate.content.parts.length > 0 && candidate.content.parts[0].text) {
                                aiText = candidate.content.parts[0].text;
                            }
                        } else if (candidate.text) {
                            aiText = candidate.text;
                        } else if (candidate.parts && candidate.parts[0] && candidate.parts[0].text) {
                            aiText = candidate.parts[0].text;
                        }
                    } else if (data.text) {
                        aiText = data.text;
                    } else if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
                        aiText = data.choices[0].message.content;
                    }
                    
                    // If still no text, log the structure for debugging
                    if (!aiText) {
                        console.error('❌ Could not extract text from response. Response structure:', JSON.stringify(data, null, 2));
                        lastError = new Error(`Invalid response format from Gemini API - no text found. Response keys: ${Object.keys(data).join(', ')}`);
                        continue; // Try next model
                    }
                    
                    console.log('✅ Extracted AI text:', aiText.substring(0, 100) + '...');
                    
                    // Format and display the description
                    const formattedText = aiText
                        .split('\n')
                        .map(line => line.trim())
                        .filter(line => line.length > 0)
                        .map(line => {
                            if (line.startsWith('**') && line.endsWith('**')) {
                                return `<h4 style="margin-top: 1rem; margin-bottom: 0.5rem; font-weight: bold; color: rgba(255, 255, 255, 1);">${line.replace(/\*\*/g, '')}</h4>`;
                            }
                            if (/^\d+\./.test(line)) {
                                return `<p style="margin-left: 1rem;">${line}</p>`;
                            }
                            return `<p>${line}</p>`;
                        })
                        .join('');
                    
                    descriptionElement.innerHTML = formattedText;
                    console.log(`✅ AI description generated successfully in ${duration}ms using ${apiVersion}/${model}`);
                    return; // Success! Exit the function
                    
        } else {
                    // This combination didn't work, try next one
                    const errorText = await response.text();
                    console.warn(`⚠️ ${apiVersion}/${model} failed (${response.status}):`, errorText.substring(0, 200));
                    lastError = new Error(`${apiVersion}/${model} failed: ${errorText}`);
                    continue; // Try next combination
                }
            } catch (fetchError) {
                console.warn(`⚠️ ${apiVersion}/${model} fetch error:`, fetchError.message);
                lastError = fetchError;
                continue; // Try next combination
            }
            }
        }
        
        // If we get here, all models failed
        console.error('❌ All models failed');
        throw lastError || new Error('All Gemini models failed. Check API key and enable Generative AI API in Google Cloud Console.');
        
    } catch (error) {
        console.error("❌ Error generating AI description:", error);
        console.error("Full error stack:", error.stack);
        const descriptionElement = document.getElementById('cityDescription');
        if (descriptionElement) {
            // Show detailed error for debugging
            const errorMessage = error.message || 'Unknown error';
            descriptionElement.innerHTML = `
                <p class="loading-text" style="color: rgba(255, 200, 200, 1);">
                    <strong>⚠️ AI Description Error:</strong><br>
                    ${errorMessage}<br><br>
                    <small style="opacity: 0.8;">
                        ${cityName} is a great city with ${Math.round(weatherData.main.temp)}°C weather and ${weatherData.weather[0].description}.<br>
                        Check the browser console (F12) for more details.
                    </small>
                </p>
            `;
        }
    }
}

// ===== UPDATE CHARTS WITH REAL API DATA =====
function updateCharts() {
    // Only update if we have weather data
    if (!weatherData) {
        return;
    }
    
    // Update Temperature Chart
    updateTemperatureChart();
    
    // Update Air Quality Chart
    if (airQualityData) {
        updateAirQualityChart();
    }
    
    // Update Weather Metrics Chart
    updateWeatherMetricsChart();
}

// ===== TEMPERATURE CHART =====
function updateTemperatureChart() {
    const ctx = document.getElementById('tempChart');
    if (!ctx) return;
    
    const currentTemp = Math.round(weatherData.main.temp);
    const feelsLike = Math.round(weatherData.main.feels_like);
    const minTemp = Math.round(weatherData.main.temp_min);
    const maxTemp = Math.round(weatherData.main.temp_max);
    
    // Create gradient for bars
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(102, 126, 234, 0.9)');
    gradient.addColorStop(1, 'rgba(118, 75, 162, 0.9)');
    
    const tempData = {
        labels: ['Current', 'Feels Like', 'Min', 'Max'],
        datasets: [{
            label: 'Temperature (°C)',
            data: [currentTemp, feelsLike, minTemp, maxTemp],
            backgroundColor: [
                'rgba(102, 126, 234, 0.9)',
                'rgba(118, 75, 162, 0.9)',
                'rgba(102, 126, 234, 0.6)',
                'rgba(118, 75, 162, 0.6)'
            ],
            borderColor: [
                'rgba(102, 126, 234, 1)',
                'rgba(118, 75, 162, 1)',
                'rgba(102, 126, 234, 1)',
                'rgba(118, 75, 162, 1)'
            ],
            borderWidth: 3,
            borderRadius: 8,
            borderSkipped: false,
        }]
    };
    
    if (tempChart) {
        tempChart.destroy();
    }
    
    tempChart = new Chart(ctx, {
        type: 'bar',
        data: tempData,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            animation: {
                duration: 1500,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 16,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 14
                    },
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y}°C`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 12,
                            weight: 'bold'
                        },
                        color: '#666',
                        callback: function(value) {
                            return value + '°C';
                        }
                    },
                    title: {
                        display: true,
                        text: 'Temperature (°C)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#667eea'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 12,
                            weight: 'bold'
                        },
                        color: '#666'
                    }
                }
            }
        }
    });
}

// ===== AIR QUALITY CHART =====
function updateAirQualityChart() {
    const ctx = document.getElementById('aqiChart');
    if (!ctx) return;
    
    let labels = [];
    let data = [];
    let colors = [];
    let borderColors = [];
    
    if (airQualityData.indexes) {
        // Google Air Quality API format
        airQualityData.indexes.forEach((index, i) => {
            labels.push(index.displayName || index.code);
            data.push(index.aqi);
            // Color based on AQI value
            if (index.aqi <= 50) {
                colors.push('rgba(76, 175, 80, 0.85)');
                borderColors.push('rgba(76, 175, 80, 1)');
            } else if (index.aqi <= 100) {
                colors.push('rgba(255, 152, 0, 0.85)');
                borderColors.push('rgba(255, 152, 0, 1)');
        } else {
                colors.push('rgba(244, 67, 54, 0.85)');
                borderColors.push('rgba(244, 67, 54, 1)');
            }
        });
    } else if (airQualityData.components) {
        // OpenWeather API format
        const pollutants = {
            'co': 'CO',
            'no': 'NO',
            'no2': 'NO₂',
            'o3': 'O₃',
            'so2': 'SO₂',
            'pm2_5': 'PM2.5',
            'pm10': 'PM10',
            'nh3': 'NH₃'
        };
        
        Object.keys(airQualityData.components).forEach(key => {
            labels.push(pollutants[key] || key.toUpperCase());
            const value = airQualityData.components[key];
            data.push(value);
            // Color based on pollutant level
            if (value < 50) {
                colors.push('rgba(76, 175, 80, 0.85)');
                borderColors.push('rgba(76, 175, 80, 1)');
            } else if (value < 100) {
                colors.push('rgba(255, 152, 0, 0.85)');
                borderColors.push('rgba(255, 152, 0, 1)');
        } else {
                colors.push('rgba(244, 67, 54, 0.85)');
                borderColors.push('rgba(244, 67, 54, 1)');
            }
        });
    }
    
    if (labels.length === 0) return;
    
    const aqiData = {
        labels: labels,
        datasets: [{
            label: 'Air Quality Levels',
            data: data,
            backgroundColor: colors,
            borderColor: borderColors,
            borderWidth: 3,
            borderRadius: 8,
            borderSkipped: false,
        }]
    };
    
    if (aqiChart) {
        aqiChart.destroy();
    }
    
    aqiChart = new Chart(ctx, {
        type: 'bar',
        data: aqiData,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            animation: {
                duration: 1500,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 16,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 14
                    },
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            let status = '';
                            if (value <= 50) status = ' (Good)';
                            else if (value <= 100) status = ' (Moderate)';
                            else status = ' (Unhealthy)';
                            return `Value: ${value.toFixed(2)}${status}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 12,
                            weight: 'bold'
                        },
                        color: '#666'
                    },
                    title: {
                        display: true,
                        text: 'Concentration (μg/m³)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#667eea'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11,
                            weight: 'bold'
                        },
                        color: '#666'
                    }
                }
            }
        }
    });
}

// ===== WEATHER METRICS CHART =====
function updateWeatherMetricsChart() {
    const ctx = document.getElementById('weatherChart');
    if (!ctx) return;
    
    const humidity = weatherData.main.humidity;
    const pressure = weatherData.main.pressure;
    const windSpeed = weatherData.wind.speed * 3.6; // Convert m/s to km/h
    const visibility = weatherData.visibility / 1000; // Convert to km
    const cloudiness = weatherData.clouds.all;
    
    // Normalize values to 0-100 scale for better visualization
    const normalizedData = {
        labels: ['Humidity', 'Cloudiness', 'Wind Speed', 'Visibility', 'Pressure'],
        values: [
            humidity, // Already 0-100
            cloudiness, // Already 0-100
            Math.min((windSpeed / 50) * 100, 100), // Normalize wind (0-50 km/h = 0-100%)
            Math.min((visibility / 10) * 100, 100), // Normalize visibility (0-10 km = 0-100%)
            Math.min(((pressure - 950) / 100) * 100, 100) // Normalize pressure (950-1050 hPa = 0-100%)
        ],
        actualValues: [
            humidity + '%',
            cloudiness + '%',
            windSpeed.toFixed(1) + ' km/h',
            visibility.toFixed(1) + ' km',
            pressure + ' hPa'
        ]
    };
    
    const metricsData = {
        labels: normalizedData.labels,
        datasets: [{
            label: 'Weather Metrics',
            data: normalizedData.values,
            backgroundColor: 'rgba(102, 126, 234, 0.2)',
            borderColor: 'rgba(102, 126, 234, 1)',
            pointBackgroundColor: 'rgba(102, 126, 234, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(102, 126, 234, 1)',
            borderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 8
        }]
    };
    
    if (weatherChart) {
        weatherChart.destroy();
    }
    
    weatherChart = new Chart(ctx, {
        type: 'radar',
        data: metricsData,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 16,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 14
                    },
                    callbacks: {
                        label: function(context) {
                            const index = context.dataIndex;
                            return normalizedData.actualValues[index];
                        }
                    }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    pointLabels: {
                        font: {
                            size: 13,
                            weight: 'bold'
                        },
                        color: '#666'
                    },
                    ticks: {
                        display: false,
                        stepSize: 20
                    }
                }
            }
        }
    });
}

// ===== HELPER FUNCTIONS =====

// Function to convert Unix timestamp to readable time
function unixToTime(unixTimestamp) {
    const date = new Date(unixTimestamp * 1000);
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// Function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// ===== EVENT LISTENERS =====

// Allow search on Enter key press (set up when DOM is ready)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupEventListeners);
} else {
    setupEventListeners();
}

function setupEventListeners() {
    const searchInput = document.getElementById('citySearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                searchCity();
            }
        });
    }
}

// ===== API DOCUMENTATION =====
/*
API INTEGRATION COMPLETE:

1. OPENWEATHERMAP API - Provides:
   - Current weather data (temperature, humidity, wind, etc.)
   - Air quality index (AQI) with pollutant breakdown (PM2.5, PM10, CO, NO2, O3, SO2, NH3)
   - Sunrise/sunset times
   - Coordinates for mapping
   - API Docs: https://openweathermap.org/api

2. GOOGLE MAPS API - Provides:
   - Interactive maps with markers
   - Geocoding services (address to coordinates)
   - Places autocomplete for search
   - City location details
   - API Docs: https://developers.google.com/maps

MENTOR Q&A:

Q: How does the fetch API work?
A: Fetch is a JavaScript function for making HTTP requests to APIs. It returns 
   a Promise that resolves to the response. We use async/await to handle the 
   asynchronous nature of network requests.

Q: What is JSON?
A: JSON (JavaScript Object Notation) is a lightweight data format that APIs 
   use to send data. We parse it using response.json() and access the data 
   like regular JavaScript objects.

Q: How do you update HTML dynamically?
A: We use document.getElementById() to select HTML elements by their ID, 
   then update their textContent or innerHTML properties with new data.

Q: What are template literals?
A: Template literals use backticks (``) instead of quotes and allow us to 
   embed variables directly in strings using ${variable} syntax, making 
   string concatenation easier.

Q: Why use async/await?
A: Async/await makes asynchronous code look synchronous and easier to read. 
   The 'await' keyword pauses execution until the Promise resolves, avoiding 
   callback hell and making error handling simpler with try-catch blocks.

Q: What's the difference between let, const, and var?
A: 'let' is block-scoped and can be reassigned. 'const' is block-scoped but 
   cannot be reassigned (though object properties can change). 'var' is 
   function-scoped and has hoisting issues - we avoid it in modern code.

Q: How does the API key work?
A: The API key is a unique identifier that authenticates our application with 
   the API service. It's included in the URL as a query parameter, allowing 
   the API server to track usage and apply rate limits.

Q: What happens if the API request fails?
A: We wrap API calls in try-catch blocks. If the network fails, the catch 
   block handles the error. We also check the response status code (cod === 200) 
   to ensure the API returned valid data before processing it.
*/

// Final log message
if (typeof API_CONFIG !== 'undefined' && API_CONFIG.googleMaps.key && API_CONFIG.openWeather.key) {
console.log("✅ Smart City Dashboard Loaded Successfully!");
    console.log("🌍 PRIMARY: Google APIs (Maps + Air Quality)");
    console.log("🔄 FALLBACK: OpenWeatherMap (Weather + AQI backup)");
console.log("🔍 Search for any city to see real-time data!");
} else {
    console.log("⚠️ Dashboard loaded but API keys not configured");
    console.log("📝 Please create config.js with your API keys to use the dashboard");
}

