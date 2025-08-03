import axios from "axios";
import { RegisterDTO } from "../types/User";

const API = process.env.REACT_APP_API_URL || "/api";


export const login = async (email: string, password: string) => {
  const response = await axios.post(`${API}/auth/login`, {
    email,
    password,
  });
  return response.data.token;
};

export const registerUser = async (form: RegisterDTO, token: string) => {
  const response = await axios.post(`${API}/auth/register`, form, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
export const forgotPassword = async (email: string) => {
  const response = await axios.post(`${API}/auth/forgot-password`, { email });
  return response.data;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const response = await axios.post(`${API}/auth/reset-password`, {
    token,
    newPassword
  });
  return response.data;
};
