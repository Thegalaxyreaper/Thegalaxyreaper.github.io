// Map weather codes to descriptions
function mapWeatherCodeToDescription(code) {
    const descriptions = {
        0: 'clear sky', 1: 'mainly clear', 2: 'partly cloudy', 3: 'overcast',
        45: 'fog', 48: 'rime fog', 51: 'light drizzle', 53: 'moderate drizzle',
        55: 'dense drizzle', 61: 'light rain', 63: 'moderate rain',
        65: 'heavy rain', 71: 'light snow', 73: 'moderate snow', 75: 'heavy snow',
        80: 'rain showers', 81: 'moderate showers', 82: 'violent showers'
    };
    return descriptions[code] || 'unknown';
}

// Fetch weather from Open-Meteo
async function fetchWeather() {
    try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=42.3314&longitude=-83.0458&current_weather=true');
        const data = await response.json();
        return mapWeatherCodeToDescription(data.current_weather.weathercode);
    } catch (error) {
        console.error('Weather fetch failed:', error);
        return 'unavailable';
    }
}

// Get formatted time/date in EST
function getCurrentDateTime() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: true });
    const date = now.toLocaleDateString('en-US', { timeZone: 'America/New_York' });
    const hour = parseInt(now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: false }).split(':')[0]);
    return { time, date, hour };
}

// Return greeting based on time
function getGreeting(hour) {
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
}

// Show last visit message
function displayLastVisit() {
    const lastVisit = localStorage.getItem('lastVisit');
    if (lastVisit) {
        const date = new Date(lastVisit);
        const formattedDate = date.toLocaleDateString('en-US', { timeZone: 'America/New_York' });
        const formattedTime = date.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: true });
        document.getElementById('lastVisitMessage').textContent = `Btw, you last visited on ${formattedDate} at ${formattedTime} EST.`;
    }
}

// Show full greeting
async function displayWelcomeMessage() {
    const name = localStorage.getItem('userName');
    if (!name) return;

    const { time, date, hour } = getCurrentDateTime();
    const greeting = getGreeting(hour);
    const weather = await fetchWeather();

    document.getElementById('welcomeMessage').textContent =
        `${greeting} ${name}! It's ${time} EST on ${date}, and it's ${weather} right now.`;

    displayLastVisit();
}

// Handle form submission
document.getElementById('nameForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = document.getElementById('nameInput').value.trim();
    if (name) {
        localStorage.setItem('userName', name);
        localStorage.setItem('lastVisit', new Date().toISOString());
        await displayWelcomeMessage();
        startClock(); // start interval updates
    }
});

// Start live clock
function startClock() {
    clearInterval(window._welcomeInterval); // avoid stacking intervals
    window._welcomeInterval = setInterval(displayWelcomeMessage, 1000);
}

// On load: if name exists, greet automatically
window.addEventListener('DOMContentLoaded', () => {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
        document.getElementById('nameInput').value = storedName;
        startClock();
    }
});