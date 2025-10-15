// types/issuess.ts

export interface Issue {
  id: number;
  title: string;
  description: string;
  status: "open" | "in-progress" | "closed";
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string
}
