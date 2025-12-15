// src/ml/aqiModel.js

import * as tf from "@tensorflow/tfjs";

// Các chất ô nhiễm mà mô hình sẽ dùng làm input
const INPUT_FEATURES = 4; 

/**
 * Hàm huấn luyện mô hình AQI (Đơn giản hóa: Mạng Neural Hồi quy)
 * Model này sẽ học mối quan hệ giữa [CO, NO2, PM10, PM2.5] hiện tại và AQI tương lai.
 * NOTE: Đây là mô hình demo, huấn luyện bằng dữ liệu giả lập (dummy data).
 */
export const trainAQIModel = async () => {
  // Dữ liệu giả lập cho 5 điểm: 4 input (nồng độ ô nhiễm) -> 1 output (AQI Level)
  const inputs = tf.tensor2d([
    [200, 10, 5, 10], // Ô nhiễm thấp -> AQI 1
    [500, 20, 15, 30], // Ô nhiễm vừa -> AQI 3
    [800, 50, 25, 60], // Ô nhiễm cao -> AQI 4
    [1200, 80, 40, 100], // Ô nhiễm rất cao -> AQI 5
    [300, 15, 10, 20], // Ô nhiễm trung bình -> AQI 2
  ]);
  // AQI Level (đã được chuẩn hóa từ 1-5 về 0-1)
  const labels = tf.tensor2d([[0], [0.5], [0.75], [1.0], [0.25]]); 

  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 10, activation: "relu", inputShape: [INPUT_FEATURES] }));
  model.add(tf.layers.dense({ units: 1, activation: "sigmoid" })); // Output 0-1

  model.compile({ optimizer: "adam", loss: "meanSquaredError" });

  await model.fit(inputs, labels, { epochs: 100, shuffle: true });

  return model;
};

/**
 * Dự đoán mức AQI (1-5) dựa trên nồng độ các chất ô nhiễm hiện tại.
 * @param {tf.Model} model Mô hình TensorFlow.js đã huấn luyện
 * @param {Object} pollutants Nồng độ các chất từ API
 * @returns {number} Mức AQI dự đoán (1 đến 5)
 */
export const predictAQI = (model, pollutants) => {
  const { co, no2, pm10, pm2_5 } = pollutants;

  // Chuẩn hóa và tạo tensor đầu vào (ĐƠN GIẢN HÓA BẰNG CÁCH CHUẨN HÓA TƯƠNG ĐỐI)
  const normalizedInput = [
    co / 1500, // CO (ug/m3)
    no2 / 100, // NO2
    pm10 / 50, // PM10
    pm2_5 / 30, // PM2.5
  ];

  const inputTensor = tf.tensor2d([normalizedInput]);
  
  // Dự đoán và lấy kết quả (giá trị từ 0 đến 1)
  const prediction = model.predict(inputTensor).dataSync()[0];

  // Khôi phục giá trị về thang 1-5
  // AQI_final = (prediction * 4) + 1 
  let aqiLevel = Math.round(prediction * 4) + 1; 

  // Kẹp giá trị trong khoảng 1-5 (đảm bảo luật DSS hoạt động)
  if (aqiLevel < 1) aqiLevel = 1;
  if (aqiLevel > 5) aqiLevel = 5;

  return aqiLevel;
};