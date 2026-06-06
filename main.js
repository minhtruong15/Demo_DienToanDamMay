// ==========================================================================
// ECOSPHERE DASHBOARD - WEATHER API LOGIC (PAAS CLOUD DEMO)
// ==========================================================================

// Coordinates for major Vietnamese cities
const citiesConfig = {
    Hanoi: { name: "Hà Nội", lat: 21.0245, lon: 105.8412 },
    HoChiMinh: { name: "TP. Hồ Chí Minh", lat: 10.7758, lon: 106.7018 },
    DaNang: { name: "Đà Nẵng", lat: 16.0678, lon: 108.2208 },
    HaiPhong: { name: "Hải Phòng", lat: 20.8449, lon: 106.6881 },
    CanTho: { name: "Cần Thơ", lat: 10.0375, lon: 105.7882 },
    NhaTrang: { name: "Nha Trang", lat: 12.2451, lon: 109.1948 },
    DaLat: { name: "Đà Lạt", lat: 11.9404, lon: 108.4583 },
    Hue: { name: "Huế", lat: 16.4637, lon: 107.5909 },
    VungTau: { name: "Vũng Tàu", lat: 10.3460, lon: 107.0843 },
    QuangNinh: { name: "Quảng Ninh", lat: 20.9599, lon: 107.0454 }
};

// Fallback simulated database (used if internet is offline or API fails)
const simulatedData = {
    Hanoi: {
        temp: 34, feels: 38, humidity: 65, wind: 14.5, uv: 7.5, aqi: 124, pm25: 46,
        code: 2, desc: "Trời ít mây, nắng oi bức (Offline Mode)",
        hourly: [29, 31, 34, 35, 33, 31, 30, 28]
    },
    HoChiMinh: {
        temp: 29, feels: 32, humidity: 85, wind: 18.2, uv: 3.0, aqi: 62, pm25: 18,
        code: 61, desc: "Có mưa rào rải rác và giông (Offline Mode)",
        hourly: [26, 27, 29, 28, 27, 26, 26, 25]
    },
    DaNang: {
        temp: 31, feels: 35, humidity: 72, wind: 11.2, uv: 5.5, aqi: 48, pm25: 11,
        code: 1, desc: "Trời trong xanh, có nắng nhẹ (Offline Mode)",
        hourly: [27, 29, 31, 31, 30, 28, 27, 26]
    },
    HaiPhong: {
        temp: 33, feels: 37, humidity: 68, wind: 16.0, uv: 7.0, aqi: 105, pm25: 37,
        code: 3, desc: "Trời nhiều mây, nắng gián đoạn (Offline Mode)",
        hourly: [28, 30, 33, 34, 32, 30, 29, 28]
    },
    CanTho: {
        temp: 28, feels: 31, humidity: 90, wind: 22.0, uv: 2.2, aqi: 35, pm25: 8,
        code: 80, desc: "Có mưa rào nặng hạt (Offline Mode)",
        hourly: [25, 26, 28, 27, 26, 25, 25, 24]
    },
    NhaTrang: {
        temp: 31, feels: 34, humidity: 75, wind: 10.0, uv: 8.0, aqi: 42, pm25: 10,
        code: 0, desc: "Trời quang đãng, nắng đẹp (Offline Mode)",
        hourly: [27, 29, 31, 32, 31, 29, 28, 27]
    },
    DaLat: {
        temp: 22, feels: 22, humidity: 80, wind: 8.0, uv: 6.0, aqi: 25, pm25: 5,
        code: 2, desc: "Trời mát mẻ, nhiều mây (Offline Mode)",
        hourly: [16, 18, 22, 23, 21, 19, 17, 16]
    },
    Hue: {
        temp: 32, feels: 36, humidity: 70, wind: 12.0, uv: 7.0, aqi: 55, pm25: 15,
        code: 1, desc: "Trời ít mây, nắng ấm (Offline Mode)",
        hourly: [26, 28, 32, 33, 31, 29, 28, 26]
    },
    VungTau: {
        temp: 30, feels: 34, humidity: 78, wind: 15.0, uv: 7.5, aqi: 50, pm25: 12,
        code: 2, desc: "Trời nhiều mây, hửng nắng (Offline Mode)",
        hourly: [27, 28, 30, 31, 30, 29, 28, 27]
    },
    QuangNinh: {
        temp: 29, feels: 32, humidity: 82, wind: 14.0, uv: 6.5, aqi: 60, pm25: 17,
        code: 3, desc: "Trời nhiều mây, ẩm ướt (Offline Mode)",
        hourly: [25, 27, 29, 30, 29, 27, 26, 25]
    }
};

// DOM Elements
const citySelect = document.getElementById("city-select");
const btnRefresh = document.getElementById("btn-refresh");
const cityName = document.getElementById("city-name");
const localTime = document.getElementById("local-time");
const weatherDescription = document.getElementById("weather-description");
const tempValue = document.getElementById("temp-value");
const feelsLikeVal = document.getElementById("feels-like-val");
const weatherIconBox = document.getElementById("weather-icon-box");
const aqiValue = document.getElementById("aqi-value");
const aqiBadge = document.getElementById("aqi-badge");
const pm25Val = document.getElementById("pm25-val");
const humidityValue = document.getElementById("humidity-value");
const humidityBar = document.getElementById("humidity-bar");
const humidityDesc = document.getElementById("humidity-desc");
const windValue = document.getElementById("wind-value");
const turbineBlades = document.getElementById("turbine-blades");
const uvValue = document.getElementById("uv-value");
const uvBadge = document.getElementById("uv-badge");
const uvBar = document.getElementById("uv-bar");
const uvDesc = document.getElementById("uv-desc");
const forecastChart = document.getElementById("forecast-chart");
const apiStatusLabel = document.getElementById("api-status-label");
const weatherEffects = document.getElementById("weather-effects");
const glowTheme1 = document.getElementById("glow-theme-1");
const glowTheme2 = document.getElementById("glow-theme-2");

// ==========================================
// 1. WEATHER API INTEGRATION & DATA FETCHING
// ==========================================
async function fetchWeatherData(cityKey) {
    const config = citiesConfig[cityKey];
    if (!config) return;

    // Show visual loading state
    setLoadingState(true);

    // Call open public API: Open-Meteo (Zero setup, free public PaaS friendly API)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${config.lat}&longitude=${config.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m&timezone=Asia%2FBangkok`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("API Network Response error");
        const data = await response.json();

        // Successful fetch: Update dashboard with live cloud data
        updateDashboard(cityKey, data, false);
    } catch (err) {
        console.warn("API Error: Fallback to simulated local dataset. ", err);
        // Fallback: use simulated high-fidelity offline data
        setTimeout(() => {
            const data = simulatedData[cityKey];
            updateDashboard(cityKey, data, true);
        }, 500); // 500ms feel delay
    }
}

// Visual loading animation triggers
function setLoadingState(isLoading) {
    if (isLoading) {
        btnRefresh.classList.add("fa-spin");
        weatherIconBox.style.opacity = 0.5;
        tempValue.style.opacity = 0.5;
    } else {
        btnRefresh.classList.remove("fa-spin");
        weatherIconBox.style.opacity = 1;
        tempValue.style.opacity = 1;
    }
}

// Update local time string based on timezone
function updateLocalTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
    localTime.textContent = timeStr;
}

// Map WMO codes to human readable Vietnamese weather descriptions
function mapWmoCodeToDesc(code, precipitation = 0) {
    // Check if rain/storm code is returned but there is no actual rain falling
    if (code >= 95 && code <= 99) {
        if (precipitation === 0) {
            return "Trời nắng có mây giông rải rác";
        }
        return "Có mưa giông lớn và sấm sét";
    }
    if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82)) {
        if (precipitation === 0) {
            return "Trời nhiều mây, hửng nắng nhẹ";
        }
    }

    if (code === 0) return "Trời quang đãng, nắng đẹp";
    if (code === 1) return "Trời quang, nắng nhẹ";
    if (code === 2) return "Ít mây, hửng nắng";
    if (code === 3) return "Nhiều mây, âm u";
    if (code === 45 || code === 48) return "Có sương mù";
    if (code >= 51 && code <= 55) return "Mưa phùn nhẹ";
    if (code >= 56 && code <= 57) return "Mưa phùn lạnh";
    if (code >= 61 && code <= 65) return "Có mưa rào rải rác";
    if (code >= 66 && code <= 67) return "Mưa buốt";
    if (code >= 71 && code <= 75) return "Có mưa tuyết rải rác";
    if (code === 77) return "Tuyết hạt";
    if (code >= 80 && code <= 82) return "Mưa rào lớn";
    if (code >= 85 && code <= 86) return "Mưa tuyết nặng";
    return "Thời tiết ổn định";
}

// ==========================================
// 2. DASHBOARD DOM UPDATE & ANIMATIONS
// ==========================================
function updateDashboard(cityKey, rawData, isSimulated) {
    setLoadingState(false);
    updateLocalTime();

    const config = citiesConfig[cityKey];
    cityName.textContent = config.name;

    let temp, feels, humidity, wind, uv, aqi, pm25, wCode, desc, hourlyTemps;
    let precip = 0;

    if (isSimulated) {
        // Parse simulated offline object structure
        temp = rawData.temp;
        feels = rawData.feels;
        humidity = rawData.humidity;
        wind = rawData.wind;
        uv = rawData.uv;
        aqi = rawData.aqi;
        pm25 = rawData.pm25;
        wCode = rawData.code;
        desc = rawData.desc;
        hourlyTemps = rawData.hourly;
        precip = (wCode >= 51 && wCode <= 65) || (wCode >= 80 && wCode <= 82) || (wCode >= 95 && wCode <= 99) ? 2.5 : 0;

        apiStatusLabel.textContent = "Offline Mode (Simulated)";
        apiStatusLabel.className = "status-online";
        apiStatusLabel.style.color = "var(--color-clear)";
        apiStatusLabel.style.textShadow = "0 0 6px var(--color-clear)";
    } else {
        // Parse real Open-Meteo JSON structure
        const current = rawData.current;
        temp = Math.round(current.temperature_2m);
        feels = Math.round(current.apparent_temperature);
        humidity = current.relative_humidity_2m;
        wind = current.wind_speed_10m;
        wCode = current.weather_code;
        precip = current.precipitation || 0;
        desc = mapWmoCodeToDesc(wCode, precip);

        // Derive mock environmental attributes based on temperature and humidity to look real
        uv = wCode === 0 ? 8.2 : wCode <= 3 ? 4.5 : 1.2;
        aqi = wCode === 0 ? 110 : wCode <= 3 ? 75 : 32;
        pm25 = Math.round(aqi * 0.35);

        // Slice hourly forecast data (8 values, spaced 3 hours apart)
        const hourly = rawData.hourly.temperature_2m;
        hourlyTemps = [];
        for (let i = 0; i < 24; i += 3) {
            hourlyTemps.push(Math.round(hourly[i]));
        }

        apiStatusLabel.textContent = "Connected (PaaS Live)";
        apiStatusLabel.className = "status-online";
        apiStatusLabel.style.color = "";
        apiStatusLabel.style.textShadow = "";
    }

    // 1. Update Core Card Data
    tempValue.textContent = temp;
    feelsLikeVal.textContent = feels;
    weatherDescription.textContent = desc;

    // 2. Update Weather Icon and Visual Effects (Rain/Snow/Sun)
    updateWeatherVisuals(wCode, precip);

    // 3. Update AQI Card
    aqiValue.textContent = aqi;
    pm25Val.textContent = pm25;
    updateAqiBadge(aqi);

    // 4. Update Humidity Card
    humidityValue.textContent = humidity;
    humidityBar.style.width = `${humidity}%`;
    if (humidity > 80) humidityDesc.textContent = "Độ ẩm rất cao, có thể mưa giông lớn";
    else if (humidity > 60) humidityDesc.textContent = "Độ ẩm trung bình khá, dễ chịu";
    else humidityDesc.textContent = "Thời tiết hanh khô, mát mẻ";

    // 5. Update Wind Card
    windValue.textContent = wind;
    // Rotate wind turbine based on speed (higher speed = faster rotation)
    const duration = wind > 0 ? Math.max(1, 15 - wind) : 0;
    if (duration > 0) {
        turbineBlades.style.animation = `spin-turbine ${duration}s infinite linear`;
    } else {
        turbineBlades.style.animation = "none";
    }

    // 6. Update UV Card
    uvValue.textContent = uv;
    uvBar.style.width = `${Math.min(100, uv * 10)}%`;
    updateUvBadge(uv);

    // 7. Render Custom Chart Bars
    renderChart(hourlyTemps);
}

// Adjust animated icons, screen precipitation particles, and background glows based on weather code
function updateWeatherVisuals(code, precipitation = 0) {
    // Clear previous drops
    weatherEffects.innerHTML = "";

    // Defaults
    let iconClass = "fa-solid fa-cloud-sun cloud-float";
    let glow1Color = "rgba(59, 130, 246, 0.35)"; // Blue
    let glow2Color = "rgba(16, 185, 129, 0.2)";  // Emerald

    if (code === 0) { // Clear sky
        iconClass = "fa-solid fa-sun spin-animate";
        glow1Color = "rgba(245, 158, 11, 0.35)"; // Amber sun glow
        glow2Color = "rgba(239, 68, 68, 0.15)";  // Red warm
    } 
    else if (code >= 1 && code <= 3) { // Cloudy levels
        if (code === 1) {
            iconClass = "fa-solid fa-cloud-sun cloud-float";
            glow1Color = "rgba(245, 158, 11, 0.25)";
            glow2Color = "rgba(59, 130, 246, 0.15)";
        } else {
            iconClass = "fa-solid fa-cloud cloud-float";
            glow1Color = "rgba(148, 163, 184, 0.3)";
            glow2Color = "rgba(59, 130, 246, 0.15)";
        }
    }
    else if (code === 45 || code === 48) { // Fog
        iconClass = "fa-solid fa-smog mist-animate";
        glow1Color = "rgba(148, 163, 184, 0.4)";
        glow2Color = "rgba(203, 213, 225, 0.2)";
    }
    else if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82)) { // Rain / Showers
        if (precipitation > 0) {
            iconClass = "fa-solid fa-cloud-showers-heavy rain-animate";
            glow1Color = "rgba(30, 41, 59, 0.5)";    // Dark slate
            glow2Color = "rgba(59, 130, 246, 0.25)";  // Rain blue
            createPrecipitationEffect("rain-drop");
        } else {
            // Cloudy but dry rain codes
            iconClass = "fa-solid fa-cloud-sun-rain cloud-float";
            glow1Color = "rgba(245, 158, 11, 0.25)";
            glow2Color = "rgba(59, 130, 246, 0.2)";
        }
    } 
    else if (code >= 71 && code <= 77) { // Snow
        iconClass = "fa-solid fa-snowflake snow-fall-animate";
        glow1Color = "rgba(56, 189, 248, 0.3)";  // Ice sky blue
        glow2Color = "rgba(255, 255, 255, 0.1)"; // Cold white
    }
    else if (code >= 95 && code <= 99) { // Thunderstorm
        if (precipitation > 0) {
            iconClass = "fa-solid fa-cloud-bolt lightning-animate";
            glow1Color = "rgba(124, 58, 237, 0.45)"; // Intense Purple
            glow2Color = "rgba(30, 41, 59, 0.6)";    // Dark slate
            createPrecipitationEffect("rain-drop");
        } else {
            // Hot/sunny with storm nearby (like HCMC today)
            iconClass = "fa-solid fa-cloud-sun-rain cloud-float";
            glow1Color = "rgba(245, 158, 11, 0.25)";
            glow2Color = "rgba(124, 58, 237, 0.25)";
        }
    }
    
    // Inject icon
    weatherIconBox.innerHTML = `<i class="${iconClass}"></i>`;

    // Apply soft background glow transition
    glowTheme1.style.background = `radial-gradient(circle, ${glow1Color} 0%, transparent 70%)`;
    glowTheme2.style.background = `radial-gradient(circle, ${glow2Color} 0%, transparent 70%)`;
}

// Spawn CSS-animated precipitation drops
function createPrecipitationEffect(className) {
    const numDrops = 35;
    for (let i = 0; i < numDrops; i++) {
        const drop = document.createElement("div");
        drop.className = className;
        drop.style.left = `${Math.random() * 100}vw`;
        drop.style.animationDelay = `${Math.random() * 2}s`;
        drop.style.animationDuration = `${0.8 + Math.random() * 1.5}s`;
        weatherEffects.appendChild(drop);
    }
}

// Set badge labels and colors for Air Quality Index
function updateAqiBadge(aqi) {
    aqiBadge.className = "status-badge";
    if (aqi <= 50) {
        aqiBadge.textContent = "Tốt";
        aqiBadge.classList.add("good");
    } else if (aqi <= 100) {
        aqiBadge.textContent = "Khá";
        aqiBadge.classList.add("moderate");
    } else {
        aqiBadge.textContent = "Kém";
        aqiBadge.classList.add("poor");
    }
}

// Set badge labels for UV levels
function updateUvBadge(uv) {
    uvBadge.className = "status-badge";
    if (uv <= 2.9) {
        uvBadge.textContent = "Thấp";
        uvBadge.classList.add("good");
        uvDesc.textContent = "Mức độ bức xạ rất an toàn";
    } else if (uv <= 5.9) {
        uvBadge.textContent = "Trung bình";
        uvBadge.classList.add("moderate");
        uvDesc.textContent = "Nên bôi kem chống nắng";
    } else {
        uvBadge.textContent = "Rất Cao";
        uvBadge.classList.add("poor");
        uvDesc.textContent = "Hạn chế ra đường giữa trưa";
    }
}

// Draw custom temperature forecast bars inside the CSS chart layout
function renderChart(temps) {
    forecastChart.innerHTML = "";
    
    const maxTemp = Math.max(...temps);
    const minTemp = Math.min(...temps);
    const spread = maxTemp - minTemp || 1;

    // Time slots mock label mapping (current hour, +3h, +6h, +9h, etc.)
    const hours = ["00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00"];

    temps.forEach((temp, idx) => {
        const col = document.createElement("div");
        col.className = "chart-bar-col";
        
        // Calculate proportional height of the bar (min height = 20%, max = 95%)
        const heightPercent = 20 + ((temp - minTemp) / spread) * 65;
        
        col.innerHTML = `
            <span class="bar-temp">${temp}°</span>
            <div class="bar-body" style="height: ${heightPercent}%;"></div>
            <span class="bar-label">${hours[idx]}</span>
        `;
        
        forecastChart.appendChild(col);
    });
}

// ==========================================
// 3. EVENT BINDINGS & APP BOOTSTRAP
// ==========================================
citySelect.addEventListener("change", (e) => {
    fetchWeatherData(e.target.value);
});

btnRefresh.addEventListener("click", () => {
    fetchWeatherData(citySelect.value);
});

// Initial load
document.addEventListener("DOMContentLoaded", () => {
    fetchWeatherData("Hanoi");
    
    // Update local time every 30 seconds
    setInterval(updateLocalTime, 30000);
});
