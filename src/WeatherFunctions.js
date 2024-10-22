import React, { useState } from "react";
import axios from "axios";

export default function WeatherFunctions() {
  const [weatherData, setWeatherData] = useState(null);
  const [uvData, setUvData] = useState(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_KEY = "704bf997547d0f7ed616723a4499158b"; // Replace with your OpenWeatherMap API key

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch weather data
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );
      setWeatherData(weatherResponse.data);

      // Fetch UV data
      const uvResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/uvi?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
      );
      setUvData(uvResponse.data);
    } catch (err) {
      setError("Error fetching data. Please try again.");
    }

    setLoading(false);
  };

  const handleLatitudeChange = (e) => setLatitude(e.target.value);
  const handleLongitudeChange = (e) => setLongitude(e.target.value);

  return (
    <div>
      <h1>Weather and UV Data</h1>

      <div>
        <label>
          Latitude:
          <input type="text" value={latitude} onChange={handleLatitudeChange} />
        </label>
      </div>

      <div>
        <label>
          Longitude:
          <input type="text" value={longitude} onChange={handleLongitudeChange} />
        </label>
      </div>

      <button onClick={fetchWeatherData} disabled={loading}>
        Get Data
      </button>

      {loading && <p>Loading...</p>}

      {error && <p>{error}</p>}

      {weatherData && (
        <div>
          <h2>Weather Data</h2>
          <p>Temperature: {weatherData.main.temp} °C</p>
          <p>Weather: {weatherData.weather[0].description}</p>
        </div>
      )}

      {uvData && (
        <div>
          <h2>UV Index</h2>
          <p>UV Index: {uvData.value}</p>
        </div>
      )}
    </div>
  );
}
