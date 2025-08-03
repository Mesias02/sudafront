import axios from "axios";

const API = process.env.REACT_APP_API_URL || "/api";


export const getGlobalStats = async () => {
  const res = await axios.get(`${API}/global`);
  return res.data;
};

export const getStandings = async () => {
  const res = await axios.get(`${API}/global/standings`);
  return res.data;
};