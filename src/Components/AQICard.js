// src/components/WeatherAQICard.js

import React, { useEffect, useState } from "react";
// Giả định các import này đã đúng đường dẫn trong project của bạn
import { getWeather, getAirQuality } from "../services/api";
import { trainAQIModel, predictAQI } from "../ml/aqiModel";
import { getAQIDescription } from "../utils/aqiUtils";
import { getWeatherIconAndVN } from "../utils/weatherIcons";
import * as tf from "@tensorflow/tfjs";

const CITIES = [
  { name: "Hanoi", display: "Hà Nội" },
  { name: "Da Nang", display: "Đà Nẵng" },
  { name: "Ho Chi Minh", display: "TP. Hồ Chí Minh" },
];

const WeatherAQICard = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [model, setModel] = useState(null);

  // Logic training model (giữ nguyên)
  useEffect(() => {
    const loadModel = async () => {
      const trainedModel = await trainAQIModel();
      setModel(trainedModel);
    };
    tf.ready().then(loadModel);
  }, []);

  useEffect(() => {
    if (!model) return;

    const fetchDataAndPredict = async () => {
      setLoading(true);
      const results = {};

      for (const city of CITIES) {

        const weatherData = await getWeather(city.name);
        const description = weatherData?.weather?.[0]?.description;
        const iconData = getWeatherIconAndVN(description);

        if (!weatherData || !weatherData.coord) {
          results[city.name] = { error: "Không tìm thấy dữ liệu thời tiết." };
          continue;
        }

        const { lat, lon } = weatherData.coord;
        const aqiData = await getAirQuality(lat, lon);

        if (!aqiData || !aqiData.components) {
          results[city.name] = { error: "Không tìm thấy dữ liệu ô nhiễm." };
          continue;
        }

        const pollutants = {
          co: aqiData.components.co,
          no2: aqiData.components.no2,
          pm10: aqiData.components.pm10,
          pm2_5: aqiData.components.pm2_5,
        };
        const predictedAqiLevel = predictAQI(model, pollutants);
        const predictedAdvice = getAQIDescription(predictedAqiLevel);
        const currentAdvice = getAQIDescription(aqiData.main.aqi);

        results[city.name] = {
          temp: Math.round(weatherData.main.temp),
          humidity: weatherData.main.humidity,
          windSpeed: weatherData.wind.speed,
          weatherMain: iconData.vn,
          weatherIcon: iconData.icon,
          currentAqi: aqiData.main.aqi,
          currentAdvice: currentAdvice, // Lời khuyên cho HIỆN TẠI
          predictedAqiLevel: predictedAqiLevel,
          predictedAdvice: predictedAdvice, // Lời khuyên cho NGÀY MAI
        };
      }

      setData(results);
      setLoading(false);
    };

    fetchDataAndPredict();
    const interval = setInterval(fetchDataAndPredict, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [model]);

  if (!model) {
    return (
      <div style={{ padding: 20, textAlign: "center", color: "white" }}>
        Đang khởi tạo mô hình AI... Vui lòng chờ.
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>HỆ THỐNG HỖ TRỢ RA QUYẾT ĐỊNH CẢNH BÁO AQI</h1>
      <div style={styles.cardContainer}>
        {CITIES.map((city) => {
          const cityData = data[city.name];
          const isLoading = loading || !cityData;

          return (
            <div key={city.name} style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cityTitle}>{city.display}</h2>
                <span style={styles.weatherIcon}>
                  {cityData?.weatherIcon || "..."}
                </span>
              </div>

              {isLoading ? (
                <p style={{ textAlign: "center", marginTop: 30 }}>
                  Đang tải dữ liệu...
                </p>
              ) : cityData.error ? (
                <p style={{ color: "red" }}>Lỗi: {cityData.error}</p>
              ) : (
                <>
                  {/* --- KHỐI THỜI TIẾT & AQI HIỆN TẠI --- */}
                  <div style={styles.weatherBlock}>
                    <p style={styles.temp}>{cityData.temp}°C</p>
                    <p style={styles.weatherDesc}>{cityData.weatherMain}</p>

                    <div style={styles.infoRow}>
                      <p style={styles.label}>
                        Độ ẩm: <strong>{cityData.humidity}%</strong>
                      </p>
                      <p style={styles.label}>
                        Gió: <strong>{cityData.windSpeed} m/s</strong>
                      </p>
                    </div>

                    {/* LỜI KHUYÊN VÀ AQI HIỆN TẠI */}
                    <div style={styles.currentAqiBox}>
                      <div style={styles.currentAqiHeader}>
                        <p style={styles.currentAqiLabel}>
                          Chất lượng KK Hiện tại:
                        </p>
                        <div
                          style={{
                            ...styles.aqiBadgeCurrent,
                            backgroundColor: cityData.currentAdvice.color,
                            color: "#000",
                          }}
                        >
                          {cityData.currentAdvice.text}
                        </div>
                      </div>
                      <p style={styles.currentAdviceText}>
                        {cityData.currentAdvice.advise}
                      </p>
                    </div>
                  </div>

                  {/* --- KHỐI DỰ BÁO NGÀY MAI (ML & DSS) --- */}
                  <div style={styles.predictedAqiContainer}>
                    <p style={styles.predictedLabel}>
                      DỰ BÁO AQI NGÀY MAI (AI):
                    </p>
                    <div
                      style={{
                        ...styles.aqiBadgePredicted,
                        backgroundColor: cityData.predictedAdvice.color,
                      }}
                    >
                      {cityData.predictedAdvice.text}
                    </div>
                  </div>

                  {/* QUYẾT ĐỊNH CHO TƯƠNG LAI (DSS OUTPUT) */}
                  <div style={styles.adviceBox}>
                    <h3 style={styles.adviceTitle}>QUYẾT ĐỊNH DỰ BÁO:</h3>
                    <p style={styles.adviceText}>
                      {cityData.predictedAdvice.advise}
                    </p>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Định nghĩa Styles (Đã tối ưu hóa bố cục, dùng Flex cho các hàng)
const styles = {
  container: {
    padding: "40px 20px",
    fontFamily: "Roboto, Arial, sans-serif",
    backgroundColor: "#1f2937",
    minHeight: "100vh",
    color: "#fff",
  },
  header: {
    textAlign: "center",
    marginBottom: 40,
    fontSize: "2.8rem",
    fontWeight: "900",
    color: "#38bdf8",
    textShadow: "0 0 10px rgba(56, 189, 248, 0.5)",
  },
  cardContainer: {
    display: "flex",
    justifyContent: "center",
    gap: 30,
    flexWrap: "wrap",
  },
  card: {
    backgroundColor: "rgba(30, 41, 59, 0.95)",
    padding: 30,
    borderRadius: 20,
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
    maxWidth: 380,
    minWidth: 320,
    border: "1px solid rgba(255, 255, 255, 0.15)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  cityTitle: {
    fontSize: "1.8rem",
    fontWeight: "700",
    color: "#e2e8f0",
  },
  weatherIcon: {
    fontSize: "3rem",
    lineHeight: 1,
    filter: "drop-shadow(0 0 5px rgba(255, 255, 255, 0.5))",
  },
  temp: {
    fontSize: "4rem",
    fontWeight: "800",
    color: "#fbbf24",
    lineHeight: 1,
    marginBottom: 5,
  },
  weatherDesc: {
    fontSize: "1.1rem",
    color: "#94a3b8",
    marginBottom: 15,
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    borderTop: "1px solid rgba(255, 255, 255, 0.15)",
    paddingTop: 10,
    marginBottom: 15,
    fontSize: "0.9rem",
  },
  label: {
    color: "#ccc",
    fontSize: "0.9rem",
    margin: 0,
  },
  // --- HIỆN TẠI BOX ---
  currentAqiBox: {
    border: "1px solid rgba(255, 255, 255, 0.3)",
    padding: 15,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 20,
  },
  currentAqiHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  currentAqiLabel: {
    color: "#a5f3fc",
    fontWeight: "bold",
    fontSize: "1rem",
    margin: 0,
  },
  aqiBadgeCurrent: {
    fontSize: "0.9rem",
    fontWeight: "bold",
    padding: "4px 8px",
    borderRadius: 4,
    boxShadow: "0 0 3px rgba(0,0,0,0.3)",
  },
  currentAdviceText: {
    fontSize: "0.9rem",
    color: "#e2e8f0",
    marginTop: 10,
    borderTop: "1px dashed rgba(255, 255, 255, 0.2)",
    paddingTop: 10,
  },
  // --- DỰ BÁO BOX ---
  predictedAqiContainer: {
    padding: 15,
    borderRadius: 10,
    textAlign: "center",
    backgroundColor: "rgba(56, 189, 248, 0.1)",
    marginBottom: 20,
    border: "1px dashed #38bdf8",
  },
  predictedLabel: {
    fontSize: "0.9rem",
    fontWeight: "bold",
    marginBottom: 10,
    color: "#a5f3fc",
  },
  aqiBadgePredicted: {
    fontSize: "1.6rem",
    fontWeight: "900",
    color: "#000",
    padding: "10px 15px",
    borderRadius: 8,
    display: "inline-block",
    minWidth: "150px",
    boxShadow: "0 0 15px rgba(255,255,255,0.2)",
    textTransform: "uppercase",
  },
  adviceBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 8,
    borderLeft: "5px solid #86efac",
  },
  adviceTitle: {
    fontSize: "1rem",
    color: "#86efac",
    marginBottom: 8,
    fontWeight: "bold",
  },
  adviceText: {
    fontSize: "1.1rem",
    fontWeight: "500",
    lineHeight: 1.4,
  },
};

export default WeatherAQICard;
