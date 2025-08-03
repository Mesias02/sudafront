import axios from "axios";
const API = process.env.REACT_APP_API_URL || "/api";


interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export const getUsers = async (token: string) => {
  const res = await axios.get(`${API}/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const deleteUser = async (id: number, token: string) => {
  await axios.delete(`${API}/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateUser = async (id: number, user: Partial<User>, token: string) => {
  await axios.put(`${API}/users/${id}`, user, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getPlayers = async (token: string): Promise<User[]> => {
  const res = await axios.get(`${API}/users/players`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
export const disableUser = async (id: number, token: string) => {
  return await axios.put(`${API}/users/${id}/disable`, {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
