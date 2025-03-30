import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:9000/api",
  timeout: 5000,
});

export default apiClient;
