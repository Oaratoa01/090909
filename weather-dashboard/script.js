// OpenWeatherMap API Configuration
const API_KEY = 'YOUR_API_KEY_HERE'; // Get from https://openweathermap.org/api
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const themeToggle = document.getElementById('themeToggle');
const errorMessage = document.getElementById('errorMessage');
const loading = document.getElementById('loading');
const currentWeatherSection = document.getElementById('currentWeather');
const forecastSection = document.getElementById('forecastSection');
const hourlySection = document.getElementById('hourlySection');
const savedCitiesContainer = document.getElementById('savedCitiesContainer');
const noCitiesMessage = document.getElementById('noCitiesMessage');

// State
let savedCities = JSON.parse(localStorage.getItem('savedCities')) || [];
let currentUnit = 'metric'; // 'metric' for Celsius, 'imperial' for Fahrenheit

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    displaySavedCities();
    searchInput.addEventListener('keypress', (e) => e.key === 'Enter' && searchWeather());
    searchBtn.addEventListener('click', searchWeather);
    themeToggle.addEventListener('click', toggleTheme);

    // Load weather for default city
    if (savedCities.length > 0) {
        getWeatherByCity(savedCities[0]);
    } else {
        getWeatherByCoords(40.7128, -74.0060); // New York default
    }
});

// Search Weather
function searchWeather() {
    const city = searchInput.value.trim();
    if (city) {
        getWeatherByCity(city);
        searchInput.value = '';
    }
}

// Get Weather by City Name
async function getWeatherByCity(city) {
    try {
        showLoading(true);
        clearError();

        const response = await fetch(
            `${BASE_URL}/weather?q=${city}&units=${currentUnit}&appid=${API_KEY}`
        );

        if (!response.ok) {
            if (response.status === 404) {
                showError('City not found. Please try another search.');
            } else {
                showError('Unable to fetch weather data. Please try again.');
            }
            showLoading(false);
            return;
        }

        const data = await response.json();
        displayCurrentWeather(data);
        getForecast(data.coord.lat, data.coord.lon);
        getHourlyForecast(data.coord.lat, data.coord.lon);
        addSavedCity(data);
        showLoading(false);
    } catch (error) {
        console.error('Error:', error);
        showError('Network error. Please check your connection.');
        showLoading(false);
    }
}

// Get Weather by Coordinates
async function getWeatherByCoords(lat, lon) {
    try {
        showLoading(true);
        clearError();

        const response = await fetch(
            `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${API_KEY}`
        );

        if (!response.ok) {
            showError('Unable to fetch weather data.');
            showLoading(false);
            return;
        }

        const data = await response.json();
        displayCurrentWeather(data);
        getForecast(lat, lon);
        getHourlyForecast(lat, lon);
        addSavedCity(data);
        showLoading(false);
    } catch (error) {
        console.error('Error:', error);
        showError('Network error. Please check your connection.');
        showLoading(false);
    }
}

// Display Current Weather
function displayCurrentWeather(data) {
    const { name, sys, main, weather, wind, clouds, visibility } = data;
    const iconUrl = `https://openweathermap.org/img/wn/${weather[0].icon}@4x.png`;
    const unitSymbol = currentUnit === 'metric' ? '°C' : '°F';
    const windUnit = currentUnit === 'metric' ? 'm/s' : 'mph';
    const visibilityUnit = currentUnit === 'metric' ? 'km' : 'mi';

    // Update DOM
    document.getElementById('cityName').textContent = `${name}, ${sys.country}`;
    document.getElementById('dateTime').textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    document.getElementById('weatherIcon').src = iconUrl;
    document.getElementById('temperature').textContent = `${Math.round(main.temp)}${unitSymbol}`;
    document.getElementById('weatherDescription').textContent = weather[0].description;

    document.getElementById('humidity').textContent = `${main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${wind.speed} ${windUnit}`;
    document.getElementById('pressure').textContent = `${main.pressure} hPa`;
    document.getElementById('visibility').textContent = `${(visibility / 1000).toFixed(1)} ${visibilityUnit}`;
    document.getElementById('cloudCover').textContent = `${clouds.all}%`;
    document.getElementById('feelsLike').textContent = `${Math.round(main.feels_like)}${unitSymbol}`;

    // Sunrise and Sunset
    const sunrise = new Date(sys.sunrise * 1000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    const sunset = new Date(sys.sunset * 1000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    document.getElementById('sunrise').textContent = sunrise;
    document.getElementById('sunset').textContent = sunset;

    currentWeatherSection.classList.remove('hidden');
}

// Get 5-Day Forecast
async function getForecast(lat, lon) {
    try {
        const response = await fetch(
            `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${API_KEY}`
        );

        if (!response.ok) throw new Error('Forecast fetch failed');

        const data = await response.json();
        displayForecast(data.list);
    } catch (error) {
        console.error('Error fetching forecast:', error);
    }
}

// Display 5-Day Forecast
function displayForecast(forecastData) {
    const forecastContainer = document.getElementById('forecastContainer');
    forecastContainer.innerHTML = '';

    // Get one forecast per day (every 8 forecasts = 1 day)
    const dailyForecasts = [];
    for (let i = 0; i < forecastData.length; i += 8) {
        dailyForecasts.push(forecastData[i]);
    }

    const unitSymbol = currentUnit === 'metric' ? '°C' : '°F';

    dailyForecasts.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const iconUrl = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`;

        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <p class="forecast-date">${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
            <img src="${iconUrl}" alt="Weather" class="forecast-icon">
            <p class="forecast-temp">${Math.round(forecast.main.temp)}${unitSymbol}</p>
            <p class="forecast-desc">${forecast.weather[0].description}</p>
            <p style="font-size: 0.85em; color: #999; margin-top: 8px;">
                💧 ${forecast.main.humidity}% | 💨 ${forecast.wind.speed}
            </p>
        `;

        forecastContainer.appendChild(forecastItem);
    });

    forecastSection.classList.remove('hidden');
}

// Get Hourly Forecast
async function getHourlyForecast(lat, lon) {
    try {
        const response = await fetch(
            `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${API_KEY}`
        );

        if (!response.ok) throw new Error('Hourly forecast fetch failed');

        const data = await response.json();
        displayHourlyForecast(data.list.slice(0, 24)); // First 24 forecasts (8 days worth of 3-hour intervals)
    } catch (error) {
        console.error('Error fetching hourly forecast:', error);
    }
}

// Display Hourly Forecast
function displayHourlyForecast(hourlyData) {
    const hourlyContainer = document.getElementById('hourlyContainer');
    hourlyContainer.innerHTML = '';

    const unitSymbol = currentUnit === 'metric' ? '°C' : '°F';

    hourlyData.forEach(hourly => {
        const time = new Date(hourly.dt * 1000);
        const hour = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        const iconUrl = `https://openweathermap.org/img/wn/${hourly.weather[0].icon}@2x.png`;

        const hourlyItem = document.createElement('div');
        hourlyItem.className = 'hourly-item';
        hourlyItem.innerHTML = `
            <p class="hour">${hour}</p>
            <img src="${iconUrl}" alt="Weather" class="hourly-icon">
            <p class="hourly-temp">${Math.round(hourly.main.temp)}${unitSymbol}</p>
            <p style="font-size: 0.8em; color: #999;">💧${hourly.main.humidity}%</p>
        `;

        hourlyContainer.appendChild(hourlyItem);
    });

    hourlySection.classList.remove('hidden');
}

// Add Saved City
function addSavedCity(weatherData) {
    const city = weatherData.name;
    const country = weatherData.sys.country;
    const cityKey = `${city}, ${country}`;

    if (!savedCities.find(c => c.name === cityKey)) {
        savedCities.unshift({
            name: cityKey,
            lat: weatherData.coord.lat,
            lon: weatherData.coord.lon
        });

        if (savedCities.length > 10) savedCities.pop();
        localStorage.setItem('savedCities', JSON.stringify(savedCities));
        displaySavedCities();
    }
}

// Display Saved Cities
function displaySavedCities() {
    savedCitiesContainer.innerHTML = '';

    if (savedCities.length === 0) {
        noCitiesMessage.style.display = 'block';
        return;
    }

    noCitiesMessage.style.display = 'none';

    savedCities.forEach((city, index) => {
        const card = document.createElement('div');
        card.className = 'saved-city-card';
        card.innerHTML = `
            <div class="saved-city-info" style="cursor: pointer;" onclick="getWeatherByCoords(${city.lat}, ${city.lon})">
                <div class="saved-city-name">${city.name}</div>
                <div class="saved-city-temp">Click to view</div>
            </div>
            <button class="delete-btn" onclick="removeSavedCity(${index})">Delete</button>
        `;
        savedCitiesContainer.appendChild(card);
    });
}

// Remove Saved City
function removeSavedCity(index) {
    savedCities.splice(index, 1);
    localStorage.setItem('savedCities', JSON.stringify(savedCities));
    displaySavedCities();
}

// Toggle Theme
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    updateThemeToggleIcon();
}

// Apply Saved Theme
function applyTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
    updateThemeToggleIcon();
}

// Update Theme Toggle Icon
function updateThemeToggleIcon() {
    const isDark = document.body.classList.contains('dark-mode');
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

// Show/Hide Loading
function showLoading(show) {
    loading.classList.toggle('hidden', !show);
}

// Show Error
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 5000);
}

// Clear Error
function clearError() {
    errorMessage.classList.remove('show');
}

// Handle Geolocation
function getLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                getWeatherByCoords(latitude, longitude);
            },
            error => {
                console.log('Geolocation error:', error);
            }
        );
    }
}

// Temperature Unit Toggle (Optional Feature)
function toggleUnit() {
    currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
    // Re-fetch weather with new unit
    if (savedCities.length > 0) {
        getWeatherByCoords(savedCities[0].lat, savedCities[0].lon);
    }
}

// Auto-refresh weather every 10 minutes
setInterval(() => {
    if (savedCities.length > 0) {
        getWeatherByCoords(savedCities[0].lat, savedCities[0].lon);
    }
}, 600000);
