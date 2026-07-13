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
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(search)}&count=1&language=en&format=json`
        );
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
          throw new Error("City not found. Please try another city name.");
        }

        const { latitude, longitude, name, country } = geoData.results[0];
        setCity(`${name}, ${country}`);

        // UPDATED: Using the modern 'current' parameter for more accurate live data
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
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

  const getWeatherDescription = (code) => {
    if (code === 0) return "Clear Sky";
    if ([1, 2, 3].includes(code)) return "Cloudy";
    if ([45, 48].includes(code)) return "Foggy";
    if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
    if ([61, 63, 65, 66, 67].includes(code)) return "Rainy";
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snowy";
    if ([80, 81, 82].includes(code)) return "Rain Showers";
    if ([95, 96, 99].includes(code)) return "Thunderstorm";
    return "Variable";
  };

  const getWeatherImage = (code) => {
    if (code === 0) return "https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?w=300&auto=format&fit=crop&q=60";
    if ([1, 2, 3].includes(code)) return "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=300&auto=format&fit=crop&q=60";
    if (code >= 51 && code <= 82) return "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=300&auto=format&fit=crop&q=60";
    return "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=300&auto=format&fit=crop&q=60";
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${weatherData ? getWeatherImage(weatherData.current.weather_code) : 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=1200&q=80'})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", padding: "20px", transition: "background-image 0.5s ease-in-out" }}>
      <div style={{ width: "100%", maxWidth: "450px", padding: "25px", fontFamily: "sans-serif", background: "linear-gradient(to bottom, #74b9ff, #0984e3)", color: "white", borderRadius: "15px", boxShadow: "0 8px 16px rgba(0,0,0,0.15)" }}>
        <h2 style={{ textAlign: "center", margin: "0 0 20px 0" }}>Weather Forecast</h2>

        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <input name="cityInput" type="text" placeholder="Enter city name..." style={{ flex: 1, padding: "10px 15px", borderRadius: "20px", border: "none", outline: "none", fontSize: "14px", color: "#000000", backgroundColor: "#ffffff" }} required />
        <button 
  type="submit" 
  style={{ 
    padding: "10px 20px", 
    border: "none", 
    borderRadius: "20px", 
    backgroundColor: "#ffffff", 
    color: "#0984e3", 
    fontWeight: "bold", 
    cursor: "pointer" 
  }}
>
  Search
</button>