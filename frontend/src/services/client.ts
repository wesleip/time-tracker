import axios from "axios";

function camelToSnake(key: string): string {
  return key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

function snakeToCamel(key: string): string {
  return key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function transformKeys(obj: unknown, transform: (k: string) => string): unknown {
  if (Array.isArray(obj)) return obj.map((v) => transformKeys(v, transform));
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [transform(k), transformKeys(v, transform)])
    );
  }
  return obj;
}

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (config.data && config.headers["Content-Type"] === "application/json") {
    config.data = transformKeys(config.data, camelToSnake);
  }
  return config;
});

api.interceptors.response.use((response) => {
  if (response.data && response.config.responseType !== "blob") {
    response.data = transformKeys(response.data, snakeToCamel);
  }
  return response;
});

export default api;
