import axios from "axios";

const defaultBaseURL = "http://localhost:9000/api";

const apiClient = axios.create({
  baseURL: defaultBaseURL,
  timeout: 5000,
  withCredentials: true,
});

// 動態載入 API URL
async function setApiBaseUrl() {
  try {
    const response = await axios.get("/config.json");
    const apiUrl = response.data.API_URL;

    if (apiUrl) {
      apiClient.defaults.baseURL = apiUrl;
      console.log("API baseURL 設定為:", apiUrl);
    } else {
      apiClient.defaults.baseURL = defaultBaseURL;
      console.warn("config.json 未定義 API_URL，使用預設 URL");
    }
  } catch (error) {
    apiClient.defaults.baseURL = defaultBaseURL;
    console.error("載入 API_URL 失敗:", error);
  }
}

// 啟動應用時載入 API URL
setApiBaseUrl().then((r) => {});

export default apiClient;
