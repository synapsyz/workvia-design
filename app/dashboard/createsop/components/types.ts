// app/dashboard/createsop/components/types.ts

export type SOPStatus = "Draft" | "Pending Approval" | "Approved" | "Rejected";

export interface SOPVersion {
  version: number;
  updatedAt: string;
  updatedBy: string;
  note?: string;
}

export interface Step {
  id: number;
  title: string;
  description: string;
  media: string[];
  condition?: string;
}

export interface SOP {
  id: number;
  title: string;
  description: string;
  thumbnail?: string;
  headerMedia: string[];
  steps: Step[];
  version: number;
  status: SOPStatus;
  approver?: string;
  versions?: SOPVersion[];
}

export interface Category {
  id: number;
  name: string;
  thumbnail?: string;
  manager?: string;
  users?: string[];
  createdBy: string;
  createdAt: string;
  lastEditedBy: string;
  lastEditedAt: string;
  isActive: boolean;

  // ✅ Make these required arrays (never undefined)
  subcategories: Category[];
  sops: SOP[];
}
