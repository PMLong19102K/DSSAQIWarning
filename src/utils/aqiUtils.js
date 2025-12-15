// src/utils/aqiUtils.js

/**
 * Chuyển đổi chỉ số AQI (1-5) sang mô tả, màu sắc và lời khuyên hành động (DSS).
 * Thang đo dựa trên chuẩn của OpenWeatherMap và khuyến nghị y tế.
 */
export const getAQIDescription = (aqiLevel) => {
  switch (aqiLevel) {
    case 1:
      return { 
        text: "TỐT", 
        color: "#4ade80",
        advise: "Không khí trong lành. Tự do hoạt động ngoài trời." 
      };
    case 2:
      return { 
        text: "KHÁ", 
        color: "#facc15",
        advise: "Chất lượng chấp nhận được. Người nhạy cảm giảm cường độ hoạt động." 
      };
    case 3:
      return { 
        text: "TRUNG BÌNH", 
        color: "#fb923c",
        advise: "Cảnh báo: Nên đeo khẩu trang nếu di chuyển lâu. Hạn chế giờ cao điểm." 
      };
    case 4:
      return { 
        text: "KÉM", 
        color: "#f87171",
        advise: "BẮT BUỘC đeo khẩu trang N95/FFP2. Tránh hoạt động mạnh ngoài trời." 
      };
    case 5:
      return { 
        text: "NGUY HẠI", 
        color: "#a855f7",
        advise: "BÁO ĐỘNG ĐỎ: Tránh mọi hoạt động ngoài trời. Sử dụng máy lọc không khí." 
      };
    default:
      return { 
        text: "Đang cập nhật", 
        color: "#94a3b8", 
        advise: "Không có dữ liệu dự báo. Vui lòng kiểm tra lại." 
      };
  }
};