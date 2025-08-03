// types/Team.ts
import { User } from "./User";

export type Team = {
  id: number;
  name: string;
  contactNumber: string;
  representative: User; // ahora es objeto, no solo ID
};

export type TeamDTO = {
  name: string;
  contactNumber: string;
  representativeId: number;
};
