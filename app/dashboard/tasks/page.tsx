"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  Bell,
  Users,
  Home,
  BarChart2,
  Box,
  Calendar,
  Database,
  Bot,
  Moon,
  Sun,
  Settings,
  List,
  Layout,
  X,
  Edit3,
  Trash2,
  PhoneCall,
  Mail,
  MessageSquareText,
  Smartphone,
  Filter as FilterIcon,
  PlusSquare,
  Pencil,
  Trash,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

/* ------------------ Types ------------------ */
type User = { name: string; avatar: string };
type TaskStatus = string; // 🔁 dynamic now
type NoteType = "Call" | "Email" | "Text" | "WhatsApp";

interface Note {
  id: number;
  type: NoteType;
  text: string;        // ISO
  time: string;        // ISO
  user: User;          // creator (and editor for now)
  edited?: boolean;
  updatedAt?: string;  // ISO
  deleted?: boolean;   // soft delete
  deletedBy?: User;
  deletedAt?: string;  // ISO
}

interface Task {
  id: number;
  title: string;
  description: string;
  assignedTo: User[];
  dueDate: string;
  status: TaskStatus;
  notes: Note[];
  /* ➕ for filtering */
  createdAt?: string;  // ISO
  createdBy?: User;
}

/* ------------------ Preset Users ------------------ */
const availableUsers: User[] = [
  { name: "Asha Raman", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
  { name: "John Doe", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
  { name: "Jane Smith", avatar: "https://randomuser.me/api/portraits/women/65.jpg" },
  { name: "Priya Patel", avatar: "https://randomuser.me/api/portraits/women/12.jpg" },
  { name: "Rahul Sharma", avatar: "https://randomuser.me/api/portraits/men/45.jpg" },
];

/* Simulated logged-in user for note logs & task creation */
const currentUser: User = {
  name: "Maria",
  avatar: "https://randomuser.me/api/portraits/women/44.jpg",
};

/* ------------------ Helpers ------------------ */
const iconForType = (t: NoteType) =>
  t === "Call" ? PhoneCall : t === "Email" ? Mail : t === "Text" ? MessageSquareText : Smartphone;

const timeAgo = (iso: string) => {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.max(0, now - then);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleString();
};

/* ✅ Overdue helper */
const getOverdueInfo = (dueDate: string) => {
  const due = new Date(dueDate).getTime();
  const now = Date.now();
  const diff = now - due;
  if (diff <= 0) return null; // not overdue
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 1) return "Overdue by 1 day";
  if (days < 7) return `Overdue by ${days} days`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `Overdue by ${weeks} week${weeks > 1 ? "s" : ""}`;
  const months = Math.floor(days / 30);
  return `Overdue by ${months} month${months > 1 ? "s" : ""}`;
};

/* Format util */
const formatDateTimeNice = (iso?: string) => {
  if (!iso) return "";
  return new Date(iso).toLocaleString();
};

/* ------------------ Seed Data ------------------ */
const nowISO = new Date().toISOString();
const initialTasks: Task[] = [
  {
    id: 1,
    title: "Design Homepage",
    description: "Create homepage design",
    assignedTo: [availableUsers[0], availableUsers[1]],
    dueDate: "2025-10-15",
    status: "pending",
    createdAt: "2025-10-07T12:00:00Z",
    createdBy: availableUsers[0],
    notes: [
      {
        id: 101,
        type: "Call",
        text: "Discussed design goals and layout priorities.",
        time: "2025-10-07T15:30:00Z",
        user: availableUsers[0],
      },
      {
        id: 102,
        type: "Email",
        text: "Sent first mockups for review.",
        time: "2025-10-07T18:00:00Z",
        user: availableUsers[1],
        edited: true,
        updatedAt: "2025-10-07T19:15:00Z",
      },
      {
        id: 103,
        type: "WhatsApp",
        text: "Client approved V1 layout.",
        time: "2025-10-08T08:00:00Z",
        user: availableUsers[2],
        deleted: true,
        deletedBy: currentUser,
        deletedAt: "2025-10-08T09:00:00Z",
      },
    ],
  },
  {
    id: 2,
    title: "Setup Database",
    description: "Configure MongoDB cluster",
    assignedTo: [availableUsers[2]],
    dueDate: "2025-10-12",
    status: "inprogress",
    createdAt: "2025-10-06T10:00:00Z",
    createdBy: availableUsers[2],
    notes: [
      {
        id: 201,
        type: "Text",
        text: "Provisioning cluster on Atlas.",
        time: "2025-10-06T14:00:00Z",
        user: availableUsers[2],
      },
    ],
  },
  {
    id: 3,
    title: "Write API Docs",
    description: "Document all REST APIs",
    assignedTo: [availableUsers[3], availableUsers[4]],
    dueDate: "2025-10-20",
    status: "completed",
    createdAt: "2025-10-05T09:00:00Z",
    createdBy: availableUsers[3],
    notes: [
      {
        id: 301,
        type: "Email",
        text: "Shared documentation template.",
        time: "2025-10-05T10:30:00Z",
        user: availableUsers[3],
      },
    ],
  },
];

/* ------------------ Notifications ------------------ */
interface Notification {
  id: number;
  text: string;
  time: string;
  read?: boolean;
}

/* ------------------ Filters ------------------ */
type Filters = {
  createdFrom?: string; // yyyy-mm-dd
  createdTo?: string;   // yyyy-mm-dd
  createdBy?: string;   // name
  assignedTo?: string;  // name
  overdueDaysMin?: string; // number as string for input
};

const FILTERS_KEY = "workvia_tasks_filters_v1";
const STATUSES_KEY = "workvia_task_statuses_v1";

export default function TasksPage() {
  /* Theme */
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    if (saved === "dark") setDarkMode(true);
  }, []);
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  /* Theme tokens */
  const cardBg = darkMode
    ? "bg-[#1E293B] border-[#334155] shadow-[0_8px_24px_rgba(2,6,23,0.35)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
    : "bg-white border-gray-100 shadow-sm";
  const softBg = darkMode ? "bg-[#273549]" : "bg-gray-50";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const textStrong = darkMode ? "text-gray-100" : "text-gray-800";
  const borderColor = darkMode ? "border-[#334155]" : "border-gray-200";
  const hoverBg = darkMode ? "hover:bg[#1E293B]/70" : "hover:bg-gray-50";
  const inputBg = darkMode
    ? "bg-[#0F172A] text-gray-100 placeholder:text-gray-500"
    : "bg-white text-gray-900 placeholder:text-gray-400";
  const ringBrand = darkMode
    ? "focus:ring-2 focus:ring-blue-500/40"
    : "focus:ring-2 focus:ring-[#0A236E]/30";

  /* Notifications */
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, text: "New task created", time: "2m ago", read: false },
    { id: 2, text: "Task 'Design Homepage' updated", time: "1h ago", read: false },
    { id: 3, text: "Task completed by John", time: "3h ago", read: true },
  ]);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const toggleNotifications = () => setShowNotifications((s) => !s);
  const markAsRead = (id: number) =>
    setNotifications((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAllAsRead = () => setNotifications((p) => p.map((n) => ({ ...n, read: true })));
  const clearAll = () => setNotifications([]);

  /* 🔁 Dynamic Statuses (persisted) */
  const defaultStatuses: TaskStatus[] = ["pending", "inprogress", "completed"];
  const [statuses, setStatuses] = useState<TaskStatus[]>(defaultStatuses);
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STATUSES_KEY) : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setStatuses(parsed);
      } catch {}
    }
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STATUSES_KEY, JSON.stringify(statuses));
    }
  }, [statuses]);

  const statusTitle = (s: string) =>
    s
      .replace(/[_\-]+/g, " ")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  /* Tasks / Search / Views */
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [view, setView] = useState<"kanban" | "list">("kanban"); // default Kanban
  const [search, setSearch] = useState("");

  /* Filters (persisted) */
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(FILTERS_KEY) : null;
    if (saved) {
      try {
        setFilters(JSON.parse(saved));
      } catch {}
    }
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
    }
  }, [filters]);

  const anyFilterActive = useMemo(() => {
    const { createdFrom, createdTo, createdBy, assignedTo, overdueDaysMin } = filters;
    return Boolean(
      (createdFrom && createdFrom.trim()) ||
      (createdTo && createdTo.trim()) ||
      (createdBy && createdBy.trim()) ||
      (assignedTo && assignedTo.trim()) ||
      (overdueDaysMin && overdueDaysMin.trim())
    );
  }, [filters]);

  const filteredTasks = useMemo(() => {
    let list = [...tasks];

    // Apply Filters
    if (filters.createdFrom) {
      const from = new Date(filters.createdFrom).getTime();
      list = list.filter((t) => t.createdAt ? new Date(t.createdAt).getTime() >= from : true);
    }
    if (filters.createdTo) {
      // include end date full day
      const to = new Date(filters.createdTo);
      to.setHours(23, 59, 59, 999);
      const toMs = to.getTime();
      list = list.filter((t) => t.createdAt ? new Date(t.createdAt).getTime() <= toMs : true);
    }
    if (filters.createdBy) {
      list = list.filter((t) => (t.createdBy?.name || "").toLowerCase() === filters.createdBy!.toLowerCase());
    }
    if (filters.assignedTo) {
      const name = filters.assignedTo.toLowerCase();
      list = list.filter((t) => t.assignedTo.some((a) => a.name.toLowerCase() === name));
    }
    if (filters.overdueDaysMin && filters.overdueDaysMin.trim() !== "") {
      const minDays = Math.max(0, Number(filters.overdueDaysMin));
      list = list.filter((t) => {
        if (t.status === "completed") return false; // only overdue when not completed
        const due = new Date(t.dueDate).getTime();
        const now = Date.now();
        const diffDays = Math.floor((now - due) / (1000 * 60 * 60 * 24));
        return diffDays >= minDays;
      });
    }

    // Search
    const q = search.toLowerCase().trim();
    if (!q) return list;
    return list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.assignedTo.some((a) => a.name.toLowerCase().includes(q))
    );
  }, [tasks, filters, search]);

  const columns = statuses.map((s) => ({ key: s as TaskStatus, title: statusTitle(s) }));
  const tasksByStatus = (status: TaskStatus) => filteredTasks.filter((t) => t.status === status);

  const onDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;
    const idNum = Number(draggableId);
    const destStatus = destination.droppableId as TaskStatus;
    setTasks((prev) => prev.map((t) => (t.id === idNum ? { ...t, status: destStatus } : t)));
  };

  /* Create/Edit modals state */
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [newTask, setNewTask] = useState<Omit<Task, "id">>({
    title: "",
    description: "",
    assignedTo: [],
    dueDate: "",
    status: statuses[0] || "pending",
    notes: [],
    createdAt: undefined, // will be set on create
    createdBy: undefined, // will be set on create
  });

  /* Notes modal state */
  const [notesTask, setNotesTask] = useState<Task | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [noteType, setNoteType] = useState<NoteType>("Text");
  const [noteText, setNoteText] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");

  /* Assignee tag inputs (create & edit) */
  const [createQuery, setCreateQuery] = useState("");
  const [editQuery, setEditQuery] = useState("");
  const createSuggestions = useMemo(() => {
    const q = createQuery.toLowerCase().trim();
    if (!q) return [];
    return availableUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) &&
        !newTask.assignedTo.some((a) => a.name === u.name)
    );
  }, [createQuery, newTask.assignedTo]);

  const editSuggestions = useMemo(() => {
    if (!editingTask) return [];
    const q = editQuery.toLowerCase().trim();
    if (!q) return [];
    return availableUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) &&
        !editingTask.assignedTo.some((a) => a.name === u.name)
    );
  }, [editQuery, editingTask]);

  /* Create/Save logic */
  const handleCreateTask = () => {
    if (!newTask.title || !newTask.description || !newTask.dueDate) return;
    const id = tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
    const createdAt = new Date().toISOString();
    const createdBy = currentUser;
    const defaultStatus = statuses[0] || "pending";
    setTasks([...tasks, { id, ...newTask, status: newTask.status || defaultStatus, createdAt, createdBy }]);
    setShowCreateModal(false);
    setNewTask({
      title: "",
      description: "",
      assignedTo: [],
      dueDate: "",
      status: statuses[0] || "pending",
      notes: [],
      createdAt: undefined,
      createdBy: undefined,
    });
    setCreateQuery("");
  };

  const handleSaveEdit = () => {
    if (!editingTask) return;
    setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? editingTask : t)));
    setEditingTask(null);
    setEditQuery("");
  };

  /* List view: mark as complete */
  const markComplete = (taskId: number) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: "completed" } : t)));
  };

  /* Notes handlers */
  const openNotes = (task: Task) => {
    setNotesTask(task);
    setShowNotesModal(true);
    setNoteText("");
    setNoteType("Text");
    setEditingNoteId(null);
    setEditingNoteText("");
  };

  const addNote = () => {
    if (!notesTask || !noteText.trim()) return;
    const n: Note = {
      id: Date.now(),
      type: noteType,
      text: noteText.trim(),
      time: new Date().toISOString(),
      user: currentUser,
    };
    setTasks((prev) =>
      prev.map((t) => (t.id === notesTask.id ? { ...t, notes: [n, ...t.notes] } : t))
    );
    setNotesTask({ ...notesTask, notes: [n, ...notesTask.notes] });
    setNoteText("");
  };

  const startEditNote = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingNoteText(note.text);
  };

  const saveEditNote = () => {
    if (!notesTask || editingNoteId === null) return;
    const updatedAt = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) =>
        t.id === notesTask.id
          ? {
              ...t,
              notes: t.notes.map((n) =>
                n.id === editingNoteId ? { ...n, text: editingNoteText, edited: true, updatedAt } : n
              ),
            }
          : t
      )
    );
    setNotesTask({
      ...notesTask,
      notes: notesTask.notes.map((n) =>
        n.id === editingNoteId ? { ...n, text: editingNoteText, edited: true, updatedAt } : n
      ),
    });
    setEditingNoteId(null);
    setEditingNoteText("");
  };

  const deleteNote = (noteId: number) => {
    if (!notesTask) return;
    const deletedAt = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) =>
        t.id === notesTask.id
          ? {
              ...t,
              notes: t.notes.map((n) =>
                n.id === noteId ? { ...n, deleted: true, deletedBy: currentUser, deletedAt } : n
              ),
            }
          : t
      )
    );
    setNotesTask({
      ...notesTask,
      notes: notesTask.notes.map((n) =>
        n.id === noteId ? { ...n, deleted: true, deletedBy: currentUser, deletedAt } : n
      ),
    });
  };

  /* ------------------ Manage Statuses Modal ------------------ */
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatusName, setNewStatusName] = useState("");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const addStatus = () => {
    const name = newStatusName.trim();
    if (!name) return;
    const exists = statuses.some((s) => s.toLowerCase() === name.toLowerCase());
    if (exists) return;
    setStatuses((prev) => [...prev, name]);
    setNewStatusName("");
  };

  const beginRename = (idx: number) => {
    setEditingIdx(idx);
    setEditingName(statuses[idx]);
  };

  const saveRename = () => {
    if (editingIdx === null) return;
    const oldName = statuses[editingIdx];
    const newName = editingName.trim();
    if (!newName) return;
    const duplicate =
      statuses.some((s, i) => i !== editingIdx && s.toLowerCase() === newName.toLowerCase());
    if (duplicate) return;

    setStatuses((prev) => {
      const copy = [...prev];
      copy[editingIdx] = newName;
      return copy;
    });

    // Remap tasks with old status to new status
    setTasks((prev) => prev.map((t) => (t.status === oldName ? { ...t, status: newName } : t)));

    setEditingIdx(null);
    setEditingName("");
  };

  const deleteStatus = (idx: number) => {
    if (statuses.length === 1) return; // don't allow removing the last status
    const toRemove = statuses[idx];
    const nextStatuses = statuses.filter((_, i) => i !== idx);
    const fallback = nextStatuses[0]; // reassign tasks to first remaining
    setStatuses(nextStatuses);
    setTasks((prev) =>
      prev.map((t) => (t.status === toRemove ? { ...t, status: fallback } : t))
    );
  };

  /* ------------------ Filter Modal Handlers ------------------ */
  const resetFilters = () => {
    setFilters({});
  };

  return (
    <>
      <Head>
        <title>Tasks — WorkVia</title>
      </Head>

      <div
        className={`min-h-screen ${
          darkMode ? "bg-[#0A0F1E] text-white" : "bg-gray-50 text-gray-900"
        } transition-colors`}
        style={{
          fontFamily:
            'Lexend, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
        }}
      >
        <div className="flex">
          {/* SIDEBAR (removed - handled globally) */}

          {/* MAIN */}
          <main className="flex-1 p-6" ref={notifRef}>
            {/* TOPBAR (removed - handled globally) */}

            {/* View Toggle + Create + Filter + Manage Statuses */}
            <div className="mb-4 flex justify-end gap-2 flex-wrap">
              {/* Filters active badge */}
              {anyFilterActive && (
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 border border-blue-200 self-center">
                  Filters active
                </span>
              )}

              <button
                onClick={() => setShowFilterModal(true)}
                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${cardBg} border ${borderColor}`}
              >
                <FilterIcon className="w-4 h-4" />
                Filter
              </button>

              <button
                onClick={() => setShowStatusModal(true)}
                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${cardBg} border ${borderColor}`}
              >
                <Settings className="w-4 h-4" />
                Manage Statuses
              </button>

              <button
                onClick={() => setView("kanban")}
                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  view === "kanban" ? "bg-[#0A236E] text-white" : `${cardBg} border ${borderColor}`
                }`}
              >
                <Layout className="w-4 h-4" /> Kanban
              </button>
              <button
                onClick={() => setView("list")}
                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  view === "list" ? "bg-[#0A236E] text-white" : `${cardBg} border ${borderColor}`
                }`}
              >
                <List className="w-4 h-4" /> List
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-[#0A236E] text-white rounded-lg"
              >
                + Create Task
              </button>
            </div>

            {/* Kanban */}
            {view === "kanban" && (
              <div className={`p-4 rounded-2xl ${cardBg} border`}>
                <DragDropContext onDragEnd={onDragEnd}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {columns.map((col) => (
                      <Droppable droppableId={col.key} key={col.key}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`rounded-xl border ${borderColor} ${
                              darkMode ? "bg-[#1E293B]" : "bg-white"
                            } p-4 min-h-[460px]`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold">{col.title}</h3>
                              <span className={`text-xs ${textMuted}`}>
                                {tasksByStatus(col.key).length}
                              </span>
                            </div>

                            <div className="space-y-3">
                              {tasksByStatus(col.key).map((task, index) => (
                                <Draggable draggableId={String(task.id)} index={index} key={task.id}>
                                  {(dragProvided) => (
                                    <div
                                      ref={dragProvided.innerRef}
                                      {...dragProvided.draggableProps}
                                      {...dragProvided.dragHandleProps}
                                      className={`rounded-xl border ${borderColor} ${
                                        darkMode ? "bg-[#0F172A]" : "bg-white"
                                      } p-4`}
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div>
                                          <div className="font-medium">{task.title}</div>
                                          <div className={`text-xs ${textMuted} mt-1`}>
                                            {task.description}
                                          </div>
                                          <div className="flex mt-2 gap-1 flex-wrap">
                                            {task.assignedTo.map((a, i) => (
                                              <img
                                                key={i}
                                                src={a.avatar}
                                                title={a.name}
                                                className="w-6 h-6 rounded-full border border-white/20"
                                              />
                                            ))}
                                          </div>

                                          {/* Created info */}
                                          {(task.createdBy || task.createdAt) && (
                                            <div className={`text-xs ${textMuted} mt-2`}>
                                              Created by{" "}
                                              <span className={darkMode ? "text-gray-200" : "text-gray-800"}>
                                                {task.createdBy?.name || "Unknown"}
                                              </span>{" "}
                                              on{" "}
                                              <span className={darkMode ? "text-gray-200" : "text-gray-800"}>
                                                {formatDateTimeNice(task.createdAt)}
                                              </span>
                                            </div>
                                          )}

                                          {/* Due date */}
                                          <div className={`text-xs ${textMuted} mt-1`}>
                                            Due: {task.dueDate}
                                          </div>

                                          {/* ✅ Overdue in Kanban */}
                                          {task.status !== "completed" && getOverdueInfo(task.dueDate) && (
                                            <div className="text-xs text-red-500 mt-1">
                                              {getOverdueInfo(task.dueDate)}
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                          <button
                                            onClick={() => openNotes(task)}
                                            className="px-2 py-1 bg-gray-500 text-white text-xs rounded"
                                          >
                                            Notes
                                          </button>
                                          <button
                                            onClick={() => setEditingTask(task)}
                                            className="px-2 py-1 bg-blue-600 text-white text-xs rounded"
                                          >
                                            Edit
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          </div>
                        )}
                      </Droppable>
                    ))}
                  </div>
                </DragDropContext>
              </div>
            )}

            {/* List */}
            {view === "list" && (
              <div className={`p-6 rounded-2xl ${cardBg} border`}>
                <div className="overflow-x-auto">
                  <table className="w-full table-auto text-sm">
                    <thead className={`text-xs ${textMuted} text-left`}>
                      <tr>
                        <th className="pb-3">Title</th>
                        <th className="pb-3">Description</th>
                        <th className="pb-3">Assignees</th>
                        <th className="pb-3">Created</th>
                        <th className="pb-3">Due Date</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`${darkMode ? "text-gray-200" : "text-gray-700"}`}>
                      {filteredTasks.map((task) => (
                        <tr key={task.id} className={`border-t ${borderColor}`}>
                          <td className="py-3 font-medium">{task.title}</td>
                          <td className="py-3">{task.description}</td>
                          <td className="py-3">
                            <div className="flex gap-1 flex-wrap">
                              {task.assignedTo.map((a, i) => (
                                <img
                                  key={i}
                                  src={a.avatar}
                                  title={a.name}
                                  className="w-6 h-6 rounded-full border border-white/20"
                                />
                              ))}
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="text-xs">
                              <div>
                                <span className={`${textMuted}`}>By:</span>{" "}
                                <span className={darkMode ? "text-gray-200" : "text-gray-800"}>
                                  {task.createdBy?.name || "Unknown"}
                                </span>
                              </div>
                              <div>
                                <span className={`${textMuted}`}>On:</span>{" "}
                                <span className={darkMode ? "text-gray-200" : "text-gray-800"}>
                                  {formatDateTimeNice(task.createdAt)}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            {task.dueDate}
                            {/* ✅ Overdue in List */}
                            {task.status !== "completed" && getOverdueInfo(task.dueDate) && (
                              <div className="text-xs text-red-500 mt-1">
                                {getOverdueInfo(task.dueDate)}
                              </div>
                            )}
                          </td>
                          <td className="py-3 capitalize">{statusTitle(task.status)}</td>
                          <td className="py-3 flex gap-2 flex-wrap">
                            {task.status !== "completed" && (
                              <button
                                onClick={() => markComplete(task.id)}
                                className="px-3 py-1 bg-green-600 text-white rounded text-xs"
                              >
                                Complete
                              </button>
                            )}
                            <button
                              onClick={() => openNotes(task)}
                              className="px-3 py-1 bg-gray-500 text-white rounded text-xs"
                            >
                              Notes
                            </button>
                            <button
                              onClick={() => setEditingTask(task)}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreateModal(false)} />
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative w-full max-w-lg mx-4 rounded-2xl border ${borderColor} ${cardBg} p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Create Task</h3>
              <button onClick={() => setShowCreateModal(false)} className={`text-sm ${textMuted}`}>
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <input
                placeholder="Title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className={`w-full border ${borderColor} rounded px-3 py-2 ${inputBg} ${ringBrand}`}
              />
              <textarea
                placeholder="Description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className={`w-full border ${borderColor} rounded px-3 py-2 ${inputBg} ${ringBrand}`}
              />
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className={`w-full border ${borderColor} rounded px-3 py-2 ${inputBg} ${ringBrand}`}
              />
              {/* Status select from dynamic statuses */}
              <div>
                <label className="text-sm block mb-1">Status</label>
                <select
                  value={newTask.status}
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                  className={`w-full border ${borderColor} rounded px-3 py-2 ${inputBg}`}
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {statusTitle(s)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assignees (Gmail-style tag input) */}
            <div className="mt-4">
              <label className="text-sm font-medium mb-1 block">Assign to</label>
              <div className={`flex flex-wrap items-center gap-2 border ${borderColor} rounded px-2 py-2 ${inputBg}`}>
                {newTask.assignedTo.map((a, i) => (
                  <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#0A236E] text-white text-xs">
                    <img src={a.avatar} className="w-5 h-5 rounded-full" />
                    {a.name}
                    <X
                      className="w-3 h-3 cursor-pointer ml-1"
                      onClick={() =>
                        setNewTask({ ...newTask, assignedTo: newTask.assignedTo.filter((u) => u.name !== a.name) })
                      }
                    />
                  </div>
                ))}
                <input
                  value={createQuery}
                  onChange={(e) => setCreateQuery(e.target.value)}
                  placeholder="Type a name..."
                  className="flex-1 border-0 outline-none bg-transparent text-sm"
                />
              </div>
              {createSuggestions.length > 0 && (
                <div className={`mt-1 rounded-md border ${borderColor} ${darkMode ? "bg-[#1E293B]" : "bg-white"} max-h-40 overflow-y-auto`}>
                  {createSuggestions.map((s, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setNewTask({ ...newTask, assignedTo: [...newTask.assignedTo, s] });
                        setCreateQuery("");
                      }}
                      className={`flex items-center gap-2 p-2 cursor-pointer`}
                    >
                      <img src={s.avatar} className="w-6 h-6 rounded-full" />
                      <span className="text-sm">{s.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowCreateModal(false)} className={`px-4 py-2 rounded-lg border ${borderColor}`}>
                Cancel
              </button>
              <button onClick={handleCreateTask} className="px-4 py-2 bg-[#0A236E] text-white rounded-lg">
                Create
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditingTask(null)} />
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative w-full max-w-lg mx-4 rounded-2xl border ${borderColor} ${cardBg} p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Edit Task</h3>
              <button onClick={() => setEditingTask(null)} className={`text-sm ${textMuted}`}>
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <input
                placeholder="Title"
                value={editingTask.title}
                onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                className={`w-full border ${borderColor} rounded px-3 py-2 ${inputBg} ${ringBrand}`}
              />
              <textarea
                placeholder="Description"
                value={editingTask.description}
                onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                className={`w-full border ${borderColor} rounded px-3 py-2 ${inputBg} ${ringBrand}`}
              />
              <input
                type="date"
                value={editingTask.dueDate}
                onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                className={`w-full border ${borderColor} rounded px-3 py-2 ${inputBg} ${ringBrand}`}
              />
              {/* Status select from dynamic statuses */}
              <div>
                <label className="text-sm block mb-1">Status</label>
                <select
                  value={editingTask.status}
                  onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })}
                  className={`w-full border ${borderColor} rounded px-3 py-2 ${inputBg}`}
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {statusTitle(s)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assignees (Gmail-style tag input) */}
            <div className="mt-4">
              <label className="text-sm font-medium mb-1 block">Assign to</label>
              <div className={`flex flex-wrap items-center gap-2 border ${borderColor} rounded px-2 py-2 ${inputBg}`}>
                {editingTask.assignedTo.map((a, i) => (
                  <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#0A236E] text-white text-xs">
                    <img src={a.avatar} className="w-5 h-5 rounded-full" />
                    {a.name}
                    <X
                      className="w-3 h-3 cursor-pointer ml-1"
                      onClick={() =>
                        setEditingTask({
                          ...editingTask,
                          assignedTo: editingTask.assignedTo.filter((u) => u.name !== a.name),
                        })
                      }
                    />
                  </div>
                ))}
                <input
                  value={editQuery}
                  onChange={(e) => setEditQuery(e.target.value)}
                  placeholder="Type a name..."
                  className="flex-1 border-0 outline-none bg-transparent text-sm"
                />
              </div>
              {editSuggestions.length > 0 && (
                <div className={`mt-1 rounded-md border ${borderColor} ${darkMode ? "bg-[#1E293B]" : "bg-white"} max-h-40 overflow-y-auto`}>
                  {editSuggestions.map((s, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setEditingTask({ ...editingTask, assignedTo: [...editingTask.assignedTo, s] });
                        setEditQuery("");
                      }}
                      className={`flex items-center gap-2 p-2 cursor-pointer`}
                    >
                      <img src={s.avatar} className="w-6 h-6 rounded-full" />
                      <span className="text-sm">{s.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setEditingTask(null)} className={`px-4 py-2 rounded-lg border ${borderColor}`}>
                Cancel
              </button>
              <button onClick={handleSaveEdit} className="px-4 py-2 bg-[#0A236E] text-white rounded-lg">
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && notesTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowNotesModal(false)} />
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative w-full max-w-xl mx-4 rounded-2xl border ${borderColor} ${cardBg} p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Notes — {notesTask.title}</h3>
              <button onClick={() => setShowNotesModal(false)} className={`text-sm ${textMuted}`}>
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {notesTask.notes.length === 0 ? (
                <div className={`text-sm ${textMuted}`}>No notes yet</div>
              ) : (
                notesTask.notes.map((n) => {
                  const Icon = iconForType(n.type);
                  return (
                    <div key={n.id} className={`border ${borderColor} rounded-lg p-3 ${darkMode ? "bg-[#0F172A]" : "bg-gray-50"}`}>
                      <div className="flex items-start gap-3">
                        <div className="pt-1">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          {editingNoteId === n.id ? (
                            <textarea
                              value={editingNoteText}
                              onChange={(e) => setEditingNoteText(e.target.value)}
                              className={`w-full border ${borderColor} rounded px-2 py-1 ${inputBg}`}
                            />
                          ) : (
                            <p className={`text-sm ${n.deleted ? "line-through text-gray-400" : darkMode ? "text-gray-200" : "text-gray-800"}`}>
                              {n.text}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <img src={n.user.avatar} className="w-5 h-5 rounded-full" title={n.user.name} />
                            <span className="text-xs text-gray-500">
                              {timeAgo(n.time)}
                              {n.edited && n.updatedAt ? ` • Edited by ${n.user.name} ${timeAgo(n.updatedAt)}` : ""}
                              {n.deleted && n.deletedBy && n.deletedAt ? ` • Deleted by ${n.deletedBy.name} ${timeAgo(n.deletedAt)}` : ""}
                            </span>
                          </div>
                        </div>

                        {!n.deleted && (
                          <div className="flex gap-1">
                            {editingNoteId === n.id ? (
                              <button onClick={saveEditNote} className="px-2 py-1 bg-green-600 text-white rounded text-xs">
                                Save
                              </button>
                            ) : (
                              <button onClick={() => startEditNote(n)} className="p-1 rounded">
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => deleteNote(n.id)} className="p-1 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-4 border-t pt-3">
              <div className="flex gap-2 mb-2">
                <select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value as NoteType)}
                  className={`border ${borderColor} rounded px-2 py-1 text-sm ${inputBg}`}
                >
                  <option value="Call">📞 Call</option>
                  <option value="Email">✉️ Email</option>
                  <option value="Text">💬 Text</option>
                  <option value="WhatsApp">📱 WhatsApp</option>
                </select>
                <input
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a new note..."
                  className={`flex-1 border ${borderColor} rounded px-2 py-1 text-sm ${inputBg}`}
                />
                <button onClick={addNote} className="px-3 py-1 bg-[#0A236E] text-white rounded text-sm">
                  Add
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* 🔍 Filter Modal (independent) */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilterModal(false)} />
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative w-full max-w-md mx-4 rounded-2xl border ${borderColor} ${cardBg} p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Filter Tasks</h3>
              <button onClick={() => setShowFilterModal(false)} className={`text-sm ${textMuted}`}>✕</button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs block mb-1">Created From</label>
                  <input
                    type="date"
                    value={filters.createdFrom || ""}
                    onChange={(e) => setFilters({ ...filters, createdFrom: e.target.value })}
                    className={`w-full border ${borderColor} rounded px-3 py-2 ${inputBg}`}
                  />
                </div>
                <div>
                  <label className="text-xs block mb-1">Created To</label>
                  <input
                    type="date"
                    value={filters.createdTo || ""}
                    onChange={(e) => setFilters({ ...filters, createdTo: e.target.value })}
                    className={`w-full border ${borderColor} rounded px-3 py-2 ${inputBg}`}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs block mb-1">Created By</label>
                <select
                  value={filters.createdBy || ""}
                  onChange={(e) => setFilters({ ...filters, createdBy: e.target.value || undefined })}
                  className={`w-full border ${borderColor} rounded px-3 py-2 ${inputBg}`}
                >
                  <option value="">Anyone</option>
                  {[currentUser, ...availableUsers].reduce<User[]>((acc, u) => {
                    // ensure unique names if currentUser is in availableUsers
                    if (!acc.some((x) => x.name === u.name)) acc.push(u);
                    return acc;
                  }, []).map((u) => (
                    <option key={u.name} value={u.name}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs block mb-1">Assigned To</label>
                <select
                  value={filters.assignedTo || ""}
                  onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value || undefined })}
                  className={`w-full border ${borderColor} rounded px-3 py-2 ${inputBg}`}
                >
                  <option value="">Anyone</option>
                  {[currentUser, ...availableUsers].reduce<User[]>((acc, u) => {
                    if (!acc.some((x) => x.name === u.name)) acc.push(u);
                    return acc;
                  }, []).map((u) => (
                    <option key={u.name} value={u.name}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs block mb-1">Overdue By (≥ days)</label>
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. 1"
                  value={filters.overdueDaysMin || ""}
                  onChange={(e) => setFilters({ ...filters, overdueDaysMin: e.target.value })}
                  className={`w-full border ${borderColor} rounded px-3 py-2 ${inputBg}`}
                />
              </div>
            </div>

            <div className="mt-5 flex justify-between">
              <button
                onClick={resetFilters}
                className={`px-3 py-2 rounded-lg border ${borderColor}`}
              >
                Clear
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilterModal(false)}
                  className={`px-3 py-2 rounded-lg border ${borderColor}`}
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ⚙️ Manage Statuses Modal (independent) */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowStatusModal(false)} />
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative w-full max-w-md mx-4 rounded-2xl border ${borderColor} ${cardBg} p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Manage Statuses</h3>
              <button onClick={() => setShowStatusModal(false)} className={`text-sm ${textMuted}`}>✕</button>
            </div>

            <div className="space-y-2">
              {statuses.map((s, idx) => (
                <div key={s + idx} className={`flex items-center gap-2 border ${borderColor} rounded px-2 py-2`}>
                  {editingIdx === idx ? (
                    <>
                      <input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className={`flex-1 border ${borderColor} rounded px-2 py-1 ${inputBg}`}
                      />
                      <button
                        onClick={saveRename}
                        className="px-2 py-1 bg-green-600 text-white rounded text-xs flex items-center gap-1"
                        title="Save"
                      >
                        <Check className="w-3 h-3" />
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm">{statusTitle(s)}</span>
                      <button
                        onClick={() => beginRename(idx)}
                        className="px-2 py-1 text-xs rounded border border-transparent hover:border-gray-300"
                        title="Rename"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteStatus(idx)}
                        className="px-2 py-1 text-xs rounded border border-transparent hover:border-gray-300 disabled:opacity-40"
                        disabled={statuses.length === 1}
                        title={statuses.length === 1 ? "Cannot delete last status" : "Delete"}
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <input
                placeholder="Add new status..."
                value={newStatusName}
                onChange={(e) => setNewStatusName(e.target.value)}
                className={`flex-1 border ${borderColor} rounded px-3 py-2 ${inputBg}`}
              />
              <button
                onClick={addStatus}
                className="px-3 py-2 bg-[#0A236E] text-white rounded-lg flex items-center gap-1"
              >
                <PlusSquare className="w-4 h-4" />
                Add
              </button>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowStatusModal(false)}
                className={`px-3 py-2 rounded-lg border ${borderColor}`}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
