export interface Task {
  id: number;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  status: "open" | "completed";
}