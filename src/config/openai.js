const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
// Để xác thực với mô hình, bạn sẽ cần tạo một API Key trong Google AI Studio.
// Truy cập https://makersuite.google.com/app/apikey để tạo khóa của bạn.
const API_KEY = process.env.GOOGLE_AI_STUDIO_API_KEY;

async function getGeminiResponse(prompt) {
  if (!API_KEY) {
    console.error(
      "GOOGLE_AI_STUDIO_API_KEY is not set in environment variables.",
    );
    return "Error: API Key not configured.";
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    // Sử dụng model gemini-2.0-flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    });

    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Error getting response from Google AI Studio:", error);
    if (error.message.includes("404")) {
      return "Lỗi: Không tìm thấy model. Vui lòng kiểm tra lại cấu hình API.";
    } else if (error.message.includes("API key")) {
      return "Lỗi: API key không hợp lệ. Vui lòng kiểm tra lại API key.";
    } else {
      return `Lỗi: ${error.message}`;
    }
  }
}

module.exports = { getGeminiResponse };
