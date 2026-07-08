import React, { useState, useEffect } from "react";

export default function App() {
  const [city, setCity] = useState("London");
  const [search, setSearch] = useState("London");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCoordinatesAndWeather = async () => {
      if (!search) return;
      setLoading(true);
      setError("");
      try {
        // Step 1: Convert City Name to Lat/Lon via Geocoding API
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(search)}&count=1&language=en&format=json`
        );
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
          throw new Error("City not found. Please try another city name.");
        }

        const { latitude, longitude, name, country } = geoData.results[0];
        setCity(`${name}, ${country}`);

        // Step 2: Fetch Weather Data using the coordinates
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
        );
        if (!weatherRes.ok) throw new Error("Failed to fetch weather metrics.");
        
        const weatherJson = await weatherRes.json();
        setWeatherData(weatherJson);
      } catch (err) {
        setError(err.message || "Something went wrong.");
        setWeatherData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCoordinatesAndWeather();
  }, [search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const cityInput = formData.get("cityInput");
    if (cityInput.trim()) setSearch(cityInput.trim());
    e.target.reset();
  };

  const getWeatherImage = (code) => {
    // 0 means Clear/Sunny
    if (code === 0) return "https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?w=300&auto=format&fit=crop&q=60"; 
    // 1, 2, 3 means Partly Cloudy / Overcast
    if ([1, 2, 3].includes(code)) return "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=300&auto=format&fit=crop&q=60"; 
    // 51 to 82 are different types of Rain and Drizzle
    if (code >= 51 && code <= 82) return "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=300&auto=format&fit=crop&q=60"; 
    // Default fallback picture
    return "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=300&auto=format&fit=crop&q=60"; 
  };

  return (
    <div style={{ 
  display: "flex", 
  justifyContent: "center", 
  alignItems: "center", 
  minHeight: "100vh", 
  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${weatherData ? getWeatherImage(weatherData.current_weather.weathercode) : 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=1200&q=80'})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  padding: "20px",
  transition: "background-image 0.5s ease-in-out" // Makes the image change smoothly
}}>
      <div style={{ width: "100%", maxWidth: "450px", padding: "25px", fontFamily: "sans-serif", background: "linear-gradient(to bottom, #74b9ff, #0984e3)", color: "white", borderRadius: "15px", boxShadow: "0 8px 16px rgba(0,0,0,0.15)" }}>
        <h2 style={{ textAlign: "center", margin: "0 0 20px 0" }}>Weather Forecast</h2>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <input
            name="cityInput"
            type="text"
            placeholder="Enter city name..."
            style={{ flex: 1, padding: "10px 15px", borderRadius: "20px", border: "none", outline: "none", fontSize: "14px", color: "#000000", backgroundColor: "#ffffff" }}
            required
          />
          <button type="submit" style={{ padding: "10px 20px", border: "none", borderRadius: "20px", backgroundColor: "#ffffff", color: "#0984e3", fontWeight: "bold", cursor: "pointer" }}>
            Search
          </button>
        </form>

        {loading && <div style={{ textAlign: "center", margin: "20px", fontWeight: "bold" }}>Updating skies...</div>}
        
        {error && <div style={{ textAlign: "center", background: "rgba(255,0,0,0.2)", padding: "10px", borderRadius: "5px", marginBottom: "15px", border: "1px solid rgba(255,0,0,0.3)" }}>⚠️ {error}</div>}

        {weatherData && !loading && (
          <div>
            <div style={{ textAlign: "center", marginBottom: "25px" }}>
              <h1 style={{ margin: "0 0 5px 0", fontSize: "28px" }}>{city}</h1>
              
              {/* Dynamic weather image using the helper function */}
              <img 
                src={getWeatherImage(weatherData.current_weather.weathercode)} 
                alt="Weather Status" 
                style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", margin: "15px auto", display: "block", boxShadow: "0 4px 8px rgba(0,0,0,0.2)" }} 
              />

              <h2 style={{ fontSize: "54px", margin: "10px 0", fontWeight: "300" }}>{weatherData.current_weather.temperature}°C</h2>
              <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "1px", opacity: 0.9, fontSize: "14px" }}>
                Wind Speed: {weatherData.current_weather.windspeed} km/h
              </p>
            </div>

            <hr style={{ border: "0", borderTop: "1px solid rgba(255,255,255,0.3)", margin: "20px 0" }} />

            <h4 style={{ margin: "0 0 12px 0", fontSize: "16px", letterSpacing: "0.5px" }}>3-Day High/Low Forecast</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {weatherData.daily.time.slice(0, 3).map((time, idx) => (
                <div key={time} style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.15)", padding: "12px 15px", borderRadius: "8px", fontSize: "14px" }}>
                  <span>{new Date(time).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                  <span style={{ fontWeight: "bold" }}>
                    {weatherData.daily.temperature_2m_max[idx]}°C / {weatherData.daily.temperature_2m_min[idx]}°C
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}