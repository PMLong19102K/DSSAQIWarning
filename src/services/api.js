import axios from "axios";

const apiKey = process.env.REACT_APP_API_KEY_GET_WEATHER;

export const getWeather = async (city) => {
  try {
    console.log(apiKey);
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    return response.data;
  } catch (err) {
    console.error("Weather fetch error:", err);
    return null;
  }
};


export const getAirQuality = async (lat, lon) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
    );
    return response.data.list[0];
  } catch (err) {
    console.error("AQI fetch error:", err);
    return null;
  }
};