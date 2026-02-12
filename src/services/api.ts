// src/services/api.ts
export const API_URL = "https://smartstock-backend-kevj.onrender.com";

export const ENDPOINTS = {
  // Exemplo de estrutura – ajuste conforme sua API
  auth: {
    login: `${API_URL}/auth/login`,
    register: `${API_URL}/auth/register`,
    logout: `${API_URL}/auth/logout`,
  },
  products: `${API_URL}/products`,
  categories: `${API_URL}/categories`,
  stock: `${API_URL}/stock`,
  // ...
};
