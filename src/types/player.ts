import { Team } from "./team";

export type Player = {
  id: number;
  name: string;
  cedula: string;
  dorsal: number;
  carrera: string;
  team: Team; // ✅ no teamName: string
};
