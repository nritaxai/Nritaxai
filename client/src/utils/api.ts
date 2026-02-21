import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL?.trim() || "http://localhost:5000";
const LOCAL_API_URL = "http://localhost:5000";
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const postWithLocalFallback = async (path: string, payload: unknown) => {
  try {
    const response = await axios.post(`${API_URL}${path}`, payload, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error: any) {
    const statusCode = Number(error?.response?.status || 0);
    const shouldFallbackToLocal =
      typeof window !== "undefined" &&
      window.location.hostname === "localhost" &&
      API_URL !== LOCAL_API_URL &&
      (error?.code === "ERR_NETWORK" || statusCode >= 400);

    if (!shouldFallbackToLocal) throw error;

    const fallbackResponse = await axios.post(`${LOCAL_API_URL}${path}`, payload, {
      headers: getAuthHeaders(),
    });
    return fallbackResponse.data;
  }
};

export const signupUser = async (signupData: any) => {
  const response = await axios.post(`${API_URL}/api/auth/register`, signupData);
  return response.data;
};

export const loginUser = async (loginData: any) => {
  const response = await axios.post(`${API_URL}/api/auth/login`, loginData);
  return response.data;
};

export const googleLoginUser = async (credential: string) => {
  const response = await axios.post(
    `${API_URL}/api/auth/google-login`,
    { credential }
  );
  return response.data;
};

export const calculateIncomeTax = async (payload: {
  income: string | number;
  country?: string;
  incomeType?: string;
}) => {
  return postWithLocalFallback("/api/calculator/income-tax", payload);
};

export const calculateCapitalGainsTax = async (payload: {
  purchasePrice: string | number;
  salePrice: string | number;
  period: string;
}) => {
  return postWithLocalFallback("/api/calculator/capital-gains-tax", payload);
};

export const calculateRentalIncomeTax = async (payload: {
  monthlyRent: string | number;
  expenses: string | number;
}) => {
  return postWithLocalFallback("/api/calculator/rental-income-tax", payload);
};
