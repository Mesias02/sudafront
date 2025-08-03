import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  sub: string; // es el email en nuestro caso
  exp: number;
  iat: number;
}

export const getEmailFromToken = (token: string): string | null => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.sub;
  } catch (e) {
    console.error("Error decodificando token:", e);
    return null;
  }
};

export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const now = Date.now() / 1000;
    return !!decoded.exp && decoded.exp > now;
  } catch (e) {
    return false;
  }
};
