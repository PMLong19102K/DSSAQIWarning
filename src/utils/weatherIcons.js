// src/utils/weatherIcons.js

export const getWeatherIconAndVN = (description) => {
  const desc = (description || '').toLowerCase();

  // Dựa trên mô tả (OpenWeatherMap)
  if (desc.includes("clear sky")) return { icon: "☀️", vn: "Trời quang đãng" };
  if (desc.includes("few clouds")) return { icon: "🌤️", vn: "Ít mây" };
  if (desc.includes("scattered clouds")) return { icon: "☁️", vn: "Mây rải rác" };
  if (desc.includes("broken clouds") || desc.includes("overcast clouds")) return { icon: "🌥️", vn: "Mây nhiều" };
  if (desc.includes("shower rain")) return { icon: "🌧️", vn: "Mưa rào nhẹ" };
  if (desc.includes("rain") || desc.includes("light rain")) return { icon: "☔", vn: "Mưa" };
  if (desc.includes("thunderstorm")) return { icon: "⛈️", vn: "Giông bão" };
  if (desc.includes("snow")) return { icon: "❄️", vn: "Tuyết" };
  if (desc.includes("mist") || desc.includes("fog") || desc.includes("haze")) return { icon: "🌫️", vn: "Sương mù/Khói mù" };

  return { icon: "🌡️", vn: description }; // Mặc định
};