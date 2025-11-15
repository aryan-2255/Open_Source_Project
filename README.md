# Smart City Data Dashboard

A modern, interactive web dashboard that displays real-time weather conditions, air quality data, and AI-powered city insights for cities worldwide. Built with vanilla JavaScript, HTML5, and CSS3.

![Dashboard Preview](https://img.shields.io/badge/Status-Live-success)
![License](https://img.shields.io/badge/License-MIT-blue)

##  Project Overview

The Smart City Dashboard is a comprehensive data visualization tool that fetches live environmental data from multiple APIs and presents it in an intuitive, user-friendly interface. Users can search for any city globally and instantly view detailed information including weather conditions, air quality metrics, interactive maps, and AI-generated city descriptions.

### Key Highlights

- ⚡ **Real-time Data**: Live weather and air quality updates
- 🤖 **AI-Powered Insights**: Gemini AI generates comprehensive city descriptions
- 📊 **Interactive Charts**: Three different chart types using Chart.js
- 🗺️ **Google Maps Integration**: Interactive maps with markers and autocomplete
- 🎨 **Modern UI/UX**: Responsive design with smooth animations
- 🔄 **Smart Fallbacks**: Automatic fallback to secondary APIs if primary fails

##  Features

###  Weather Information
- Real-time temperature and "feels like" temperature
- Current weather conditions and descriptions
- Wind speed and direction
- Humidity and atmospheric pressure
- Visibility range
- Sunrise and sunset times
- Last update timestamp

###  Air Quality Monitoring
- **Primary**: Google Air Quality API with Universal AQI (0-500 scale)
- **Fallback**: OpenWeatherMap Air Pollution API
- Color-coded AQI status (Good/Moderate/Unhealthy)
- Detailed pollutant breakdown:
  - PM2.5 and PM10 (Particulate Matter)
  - CO (Carbon Monoxide)
  - NO2 (Nitrogen Dioxide)
  - O3 (Ozone)
  - SO2 (Sulphur Dioxide)
  - NH3 (Ammonia)

###  AI City Insights
- Powered by Google Gemini API
- Comprehensive city analysis covering:
  - Smart City Rating (infrastructure, connectivity, innovation)
  - Information for Students (education, cost of living, safety)
  - Information for Professionals (job market, career growth)
  - Quality of Life metrics
  - Top 3 reasons to choose the city
- Real-time data integration with weather and AQI information

### Data Visualization (Chart.js)
1. **Temperature Bar Chart**: Current, feels like, min, and max temperatures
2. **Air Quality Bar Chart**: Visual breakdown of pollutants and AQI indexes
3. **Weather Metrics Radar Chart**: Multi-dimensional view of humidity, cloudiness, wind, visibility, and pressure

### Map Integration
- Interactive Google Maps with city location markers
- Google Places Autocomplete for intelligent city search
- Geocoding for accurate coordinate mapping
- Location details (coordinates, timezone, formatted address)
- Clickable markers with info windows

###  Additional Features
- **Multi-Section Dashboard**: Navigate between Dashboard, Charts, Map View, and Raw Data
- **Live Clock**: Real-time date and time display
- **JSON Viewer**: View complete API responses for debugging
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Error Handling**: Graceful fallbacks and user-friendly error messages

## 🛠️ Technologies Used

### Frontend
- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling with Grid, Flexbox, animations, and gradients
- **JavaScript (ES6+)** - Async/await, Fetch API, DOM manipulation

### Third-Party Libraries
- **Chart.js v4.4.0** - Data visualization and charting
- **Google Maps JavaScript API** - Interactive maps and geocoding
- **Google Places API** - Autocomplete search functionality

### APIs
#### Primary APIs
- **Google Maps Platform**
  - Maps JavaScript API - Interactive maps
  - Geocoding API - City name to coordinates conversion
  - Places API (Autocomplete) - Intelligent search suggestions
  - Air Quality API - Real-time AQI data with multiple indexes

- **Google Gemini API**
  - Generative AI for city descriptions
  - Multiple model fallbacks (gemini-1.5-flash, gemini-1.5-pro, etc.)

#### Fallback APIs
- **OpenWeatherMap**
  - Current Weather API - Temperature, humidity, wind, etc.
  - Air Pollution API - Backup AQI data

## 📁 Project Structure

```
Project_Source/
│
├── index.html              # Main HTML structure
├── style.css               # All styling and responsive design
├── script.js               # JavaScript logic and API integration (1687 lines)
├── config.js               # API keys configuration (DO NOT COMMIT - in .gitignore)
├── config.example.js       # Template for config.js (safe to commit)
├── build-config.js         # Netlify build script (generates config.js from env vars)
├── .gitignore              # Git ignore rules (protects sensitive files)
├── DEPLOYMENT.md           # Detailed deployment guide
└── README.md               # This file
```

##  Quick Start

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- API keys for:
  - Google Maps Platform (for Maps, Geocoding, Places, and Air Quality APIs)
  - Google Gemini API (for AI descriptions)
  - OpenWeatherMap API (as fallback)

### Local Setup

1. **Clone or download the repository**
   ```bash
   git clone <your-repo-url>
   cd Project_Source
   ```

2. **Set up API configuration**
   ```bash
   cp config.example.js config.js
   ```

3. **Add your API keys to `config.js`**
   ```javascript
   const API_CONFIG = {
       googleMaps: {
           key: "YOUR_GOOGLE_MAPS_API_KEY_HERE",
           // ...
       },
       googleAirQuality: {
           key: "YOUR_GOOGLE_MAPS_API_KEY_HERE", // Same as Maps
           // ...
       },
       gemini: {
           key: "YOUR_GEMINI_API_KEY_HERE",
           // ...
       },
       openWeather: {
           key: "YOUR_OPENWEATHER_API_KEY_HERE",
           // ...
       }
   };
   ```

4. **Open the application**
   - **Option 1**: Simply open `index.html` in your browser
   - **Option 2**: Use a local server:
     ```bash
     # Python 3
     python -m http.server 8000
     
     # Node.js (if you have http-server installed)
     npx http-server
     
     # Then navigate to http://localhost:8000
     ```

5. **Start using the dashboard**
   - Type a city name in the search bar (e.g., "New York", "London", "Tokyo")
   - Click "Search" or press Enter
   - Explore the Dashboard, Charts, Map View, and Raw Data sections

##  Getting API Keys

### Google Maps Platform
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API
   - Air Quality API
4. Create credentials (API Key)
5. Restrict the API key to specific APIs and domains for security

### Google Gemini API
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### OpenWeatherMap API
1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to API keys section
4. Copy your default key or create a new one

##  How It Works

### 1. User Search Flow
```
User types city name
    ↓
Google Places Autocomplete (suggests cities)
    ↓
User selects or enters city
    ↓
Google Geocoding API (gets accurate coordinates)
    ↓
Multiple APIs called in parallel/sequence
```

### 2. Data Fetching Flow
```
Primary Path:
1. Google Geocoding → Get coordinates
2. OpenWeatherMap → Get weather data (using coordinates)
3. Google Air Quality → Get AQI data
4. Google Gemini → Generate AI city description
5. Google Maps → Display map with marker

Fallback Path (if Google APIs fail):
1. OpenWeatherMap → Get weather (using city name)
2. OpenWeatherMap Air Pollution → Get AQI backup
3. Google Maps still attempts to load
```

### 3. Display Updates
```
API Response Received
    ↓
Parse JSON data
    ↓
Update DOM elements (temperature, AQI, etc.)
    ↓
Update Chart.js charts
    ↓
Update Google Map marker
    ↓
Generate and display AI description
```

##  API Endpoints Used

### Google APIs

**Maps JavaScript API:**
```
https://maps.googleapis.com/maps/api/js?key={KEY}&libraries=places
```

**Geocoding API:**
```
https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lng}&key={KEY}
```

**Air Quality API:**
```
POST https://airquality.googleapis.com/v1/currentConditions:lookup?key={KEY}
Body: { "location": { "latitude": lat, "longitude": lon } }
```

**Gemini API:**
```
POST https://generativelanguage.googleapis.com/v1/models/{MODEL}:generateContent?key={KEY}
Body: {
  "contents": [{ "parts": [{ "text": "prompt" }] }],
  "generationConfig": { ... }
}
```

### OpenWeatherMap APIs

**Current Weather:**
```
GET https://api.openweathermap.org/data/2.5/weather?q={city}&appid={KEY}&units=metric
GET https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={KEY}&units=metric
```

**Air Pollution:**
```
GET https://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={KEY}
```

##  Design Features

- **Modern Gradient Background**: Purple to blue gradient for visual appeal
- **Card-Based Layout**: Clean, organized sections with shadows and rounded corners
- **Color-Coded AQI**: 
  - Green (0-50): Good air quality
  - Orange (51-150): Moderate/Unhealthy for sensitive
  - Red (151+): Unhealthy/Hazardous
- **Smooth Animations**: Chart animations, section transitions, fade effects
- **Responsive Grid**: Adapts to different screen sizes
- **Professional Typography**: Clear hierarchy and readable fonts

##  Chart Types

1. **Temperature Bar Chart** (`tempChart`)
   - Type: Bar chart
   - Data: Current, Feels Like, Min, Max temperatures
   - Colors: Purple/blue gradient
   - Animation: 1.5s ease-in-out

2. **Air Quality Bar Chart** (`aqiChart`)
   - Type: Bar chart
   - Data: Pollutant concentrations or AQI indexes
   - Colors: Dynamic based on values (green/orange/red)
   - Animation: 1.5s ease-in-out

3. **Weather Metrics Radar Chart** (`weatherChart`)
   - Type: Radar/Spider chart
   - Data: Normalized values for humidity, cloudiness, wind, visibility, pressure
   - Colors: Purple theme
   - Animation: 2s ease-in-out

##  Security & Privacy

### API Key Protection
- ✅ `config.js` is in `.gitignore` - **never commit your API keys**
- ✅ Use `config.example.js` as a template for others
- ✅ For production, use environment variables (see DEPLOYMENT.md)
- ✅ Restrict API keys in Google Cloud Console:
  - Limit to specific APIs
  - Add HTTP referrer restrictions
  - Set usage quotas

### Best Practices
- Never expose API keys in client-side code for production apps (consider a backend proxy)
- Regularly rotate API keys
- Monitor API usage in Google Cloud Console
- Use separate API keys for development and production

##  Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Netlify
1. Push code to GitHub (config.js is already ignored)
2. Connect repository to Netlify
3. Add environment variables in Netlify dashboard:
   - `GOOGLE_MAPS_KEY`
   - `GEMINI_KEY`
   - `OPENWEATHER_KEY`
4. Netlify will auto-generate `config.js` during build using `build-config.js`

##  Troubleshooting

### Common Issues

**"Configuration file missing" error**
- Solution: Create `config.js` from `config.example.js` and add your API keys

**City not found**
- Check spelling of city name
- Try adding country code (e.g., "London, UK")
- Use major city names for better results

**Maps not loading**
- Verify Google Maps API key is correct
- Ensure Maps JavaScript API is enabled in Google Cloud Console
- Check browser console for specific error messages

**AI description not generating**
- Verify Gemini API key is correct
- Check if Generative AI API is enabled
- Review browser console for API errors
- Ensure API quota hasn't been exceeded

**Charts not displaying**
- Check if Chart.js CDN is loading (inspect Network tab)
- Verify data is being fetched (check Raw Data section)
- Open browser console for JavaScript errors

**401/403 API Errors**
- API key may need 1-2 hours to activate after creation
- Verify API key restrictions allow your domain
- Check if required APIs are enabled in Google Cloud Console

**Rate Limit Errors**
- Free tier has usage limits
- Wait a few minutes before retrying
- Consider upgrading API quotas if needed

##  Code Architecture

### Key Functions

**Initialization:**
- `init()` - Page load initialization
- `initGoogleMaps()` - Google Maps API callback
- `loadGoogleMapsAPI()` - Dynamic script loading

**Data Fetching:**
- `searchCity()` - Entry point for city search
- `geocodeCityForData()` - Get coordinates from Google
- `fetchWeatherData()` - Fetch weather from OpenWeatherMap
- `fetchWeatherDataByCoordinates()` - Weather fetch using coordinates
- `fetchAirQualityData()` - Primary Google Air Quality API
- `fetchAirQualityDataOpenWeather()` - Fallback AQI
- `generateCityDescription()` - AI-powered descriptions

**Display Updates:**
- `updateWeatherDisplay()` - Update weather UI elements
- `updateAirQualityDisplay()` - Update AQI display
- `updateAirQualityDisplayGoogle()` - Google AQI display
- `updateCharts()` - Update all Chart.js visualizations
- `updateGoogleMap()` - Update map location and marker

**Chart Functions:**
- `updateTemperatureChart()` - Bar chart for temperatures
- `updateAirQualityChart()` - Bar chart for air quality
- `updateWeatherMetricsChart()` - Radar chart for weather metrics

### Global Variables
- `currentCity` - Currently selected city name
- `weatherData` - Current weather data object
- `airQualityData` - Current AQI data object
- `map` - Google Maps instance
- `marker` - Current map marker
- `autocomplete` - Google Places Autocomplete instance
- `tempChart`, `aqiChart`, `weatherChart` - Chart.js instances

##  Learning Resources

### API Documentation
- [Google Maps Platform](https://developers.google.com/maps)
- [Google Gemini API](https://ai.google.dev/docs)
- [OpenWeatherMap API](https://openweathermap.org/api)
- [Chart.js Documentation](https://www.chartjs.org/docs/)

### Web Development
- [MDN Web Docs - Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [MDN Web Docs - Async/Await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [MDN Web Docs - DOM Manipulation](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)

##  Future Enhancements

### Planned Features
- [ ] 7-day weather forecast
- [ ] Historical data trends
- [ ] Multiple city comparison
- [ ] Export data as CSV/JSON
- [ ] Dark mode theme toggle
- [ ] Geolocation auto-detect
- [ ] Weather alerts and notifications
- [ ] Favorite cities bookmark
- [ ] Share city data via URL
- [ ] Multi-language support

### Technical Improvements
- [ ] Add backend API proxy for enhanced security
- [ ] Implement caching for API responses
- [ ] Add unit tests
- [ ] Optimize bundle size
- [ ] Add service worker for offline support
- [ ] Implement Progressive Web App (PWA) features

##  License

This project is created for educational purposes.

##  Credits

- **Weather Data**: OpenWeatherMap API (fallback)
- **Maps & Air Quality**: Google Maps Platform
- **AI Descriptions**: Google Gemini API
- **Data Visualization**: Chart.js library
- **Design Inspiration**: Modern dashboard UI/UX patterns


**Built with for Smart City Data Visualization**

**Last Updated**: December 2024
