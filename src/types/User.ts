export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role: string;
}

export type TeamDTO = {
  name: string;
  contactNumber: string;
  representativeId: number;
};