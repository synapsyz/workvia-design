"use client";

import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import {
  Layout,
  List as ListIcon,
  Filter as FilterIcon,
  Settings,
  X,
  PlusSquare,
  Pencil,
  Trash,
  Check,
  Edit3,
  Trash2,
  PhoneCall,
  Mail,
  MessageSquareText,
  Smartphone,
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
type IssueStatus = string;
type NoteType = "Call" | "Email" | "Text" | "WhatsApp";

interface Evidence {
  type: "text" | "image" | "audio" | "video";
  url?: string;  // for image/audio/video blobs
  text?: string; // for text evidence
}

interface Note {
  id: number;
  type: NoteType;
  text: string;        // note body
  time: string;        // ISO
  user: User;          // author
  // Optional display info similar to your task page (not editable for brevity)
  edited?: boolean;
  updatedAt?: string;  // ISO
  deleted?: boolean;
  deletedBy?: User;
  deletedAt?: string;  // ISO
  evidence?: Evidence; // NEW
}

interface Issue {
  id: number;
  title: string;
  description: string;
  assignedTo: User[];
  dueDate: string;      // yyyy-mm-dd
  status: IssueStatus;
  notes: Note[];
  createdAt?: string;   // ISO
  createdBy?: User;
  completionEvidence?: Evidence; // NEW
}

/* ------------------ Filters ------------------ */
type Filters = {
  createdFrom?: string;    // yyyy-mm-dd
  createdTo?: string;      // yyyy-mm-dd
  createdBy?: string;      // name
  assignedTo?: string;     // name
  overdueDaysMin?: string; // number-as-string
};

/* ------------------ Users ------------------ */
const availableUsers: User[] = [
  { name: "Asha Raman", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
  { name: "John Doe", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
  { name: "Jane Smith", avatar: "https://randomuser.me/api/portraits/women/65.jpg" },
  { name: "Priya Patel", avatar: "https://randomuser.me/api/portraits/women/12.jpg" },
  { name: "Rahul Sharma", avatar: "https://randomuser.me/api/portraits/men/45.jpg" },
];

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

const formatDateTimeNice = (iso?: string) => (iso ? new Date(iso).toLocaleString() : "");

/* ------------------ Seed Data ------------------ */
const initialIssues: Issue[] = [
  {
    id: 1,
    title: "Login Bug",
    description: "Login button not working properly",
    assignedTo: [availableUsers[0], availableUsers[1]],
    dueDate: "2025-10-15",
    status: "open",
    createdAt: "2025-10-07T12:00:00Z",
    createdBy: availableUsers[1],
    notes: [
      {
        id: 11,
        type: "Call",
        text: "Confirmed repro steps with QA.",
        time: "2025-10-07T15:30:00Z",
        user: availableUsers[0],
      },
    ],
  },
  {
    id: 2,
    title: "Payment Failure",
    description: "Card payments fail intermittently",
    assignedTo: [availableUsers[2]],
    dueDate: "2025-10-18",
    status: "in-progress",
    createdAt: "2025-10-09T12:00:00Z",
    createdBy: availableUsers[3],
    notes: [
      {
        id: 21,
        type: "Email",
        text: "Vendor responded; gateway timeout observed.",
        time: "2025-10-09T14:10:00Z",
        user: availableUsers[2],
      },
    ],
  },
];

/* ------------------ Storage Keys ------------------ */
const FILTERS_KEY = "workvia_issues_filters_v1";
const STATUSES_KEY = "workvia_issue_statuses_v1";

/* ------------------ Component ------------------ */
export default function IssuesPage() {
  /* Statuses (dynamic) */
  const defaultStatuses: IssueStatus[] = ["open", "in-progress", "resolved", "closed"];
  const [statuses, setStatuses] = useState<IssueStatus[]>(defaultStatuses);

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

  /* Issues state */
  const [issues, setIssues] = useState<Issue[]>(initialIssues);

  /* View & search */
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [search, setSearch] = useState("");

  /* Filters */
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

  const filteredIssues = useMemo(() => {
    let list = [...issues];

    // Apply Filters
    if (filters.createdFrom) {
      const from = new Date(filters.createdFrom).getTime();
      list = list.filter((i) => (i.createdAt ? new Date(i.createdAt).getTime() >= from : true));
    }
    if (filters.createdTo) {
      const to = new Date(filters.createdTo);
      to.setHours(23, 59, 59, 999);
      const toMs = to.getTime();
      list = list.filter((i) => (i.createdAt ? new Date(i.createdAt).getTime() <= toMs : true));
    }
    if (filters.createdBy) {
      list = list.filter(
        (i) => (i.createdBy?.name || "").toLowerCase() === filters.createdBy!.toLowerCase()
      );
    }
    if (filters.assignedTo) {
      const name = filters.assignedTo.toLowerCase();
      list = list.filter((i) => i.assignedTo.some((a) => a.name.toLowerCase() === name));
    }
    if (filters.overdueDaysMin && filters.overdueDaysMin.trim() !== "") {
      const minDays = Math.max(0, Number(filters.overdueDaysMin));
      list = list.filter((i) => {
        if (i.status === "closed" || i.status === "resolved") return false; // treat resolved/closed as not overdue
        const due = new Date(i.dueDate).getTime();
        const now = Date.now();
        const diffDays = Math.floor((now - due) / (1000 * 60 * 60 * 24));
        return diffDays >= minDays;
      });
    }

    // Search
    const q = search.toLowerCase().trim();
    if (!q) return list;
    return list.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.assignedTo.some((a) => a.name.toLowerCase().includes(q))
    );
  }, [issues, filters, search]);

  const columns = statuses.map((s) => ({ key: s as IssueStatus, title: statusTitle(s) }));
  const issuesByStatus = (status: IssueStatus) => filteredIssues.filter((i) => i.status === status);

  const onDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;
    const idNum = Number(draggableId);
    const destStatus = destination.droppableId as IssueStatus;
    setIssues((prev) => prev.map((i) => (i.id === idNum ? { ...i, status: destStatus } : i)));
  };

  /* Create/Edit */
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);

  const [newIssue, setNewIssue] = useState<Omit<Issue, "id">>({
    title: "",
    description: "",
    assignedTo: [],
    dueDate: "",
    status: statuses[0] || "open",
    notes: [],
    createdAt: undefined,
    createdBy: undefined,
  });

  const [createQuery, setCreateQuery] = useState("");
  const [editQuery, setEditQuery] = useState("");

  const createSuggestions = useMemo(() => {
    const q = createQuery.toLowerCase().trim();
    if (!q) return [];
    return availableUsers.filter(
      (u) => u.name.toLowerCase().includes(q) && !newIssue.assignedTo.some((a) => a.name === u.name)
    );
  }, [createQuery, newIssue.assignedTo]);

  const editSuggestions = useMemo(() => {
    if (!editingIssue) return [];
    const q = editQuery.toLowerCase().trim();
    if (!q) return [];
    return availableUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) &&
        !editingIssue.assignedTo.some((a) => a.name === u.name)
    );
  }, [editQuery, editingIssue]);

  const handleCreateIssue = () => {
    if (!newIssue.title || !newIssue.description || !newIssue.dueDate) return;
    const id = issues.length ? Math.max(...issues.map((i) => i.id)) + 1 : 1;
    const createdAt = new Date().toISOString();
    const createdBy = currentUser;
    const defaultStatus = statuses[0] || "open";
    setIssues([
      ...issues,
      { id, ...newIssue, status: newIssue.status || defaultStatus, createdAt, createdBy, notes: [] },
    ]);
    setShowCreateModal(false);
    setNewIssue({
      title: "",
      description: "",
      assignedTo: [],
      dueDate: "",
      status: statuses[0] || "open",
      notes: [],
      createdAt: undefined,
      createdBy: undefined,
    });
    setCreateQuery("");
  };

  const handleSaveEdit = () => {
    if (!editingIssue) return;
    setIssues((prev) => prev.map((i) => (i.id === editingIssue.id ? editingIssue : i)));
    setEditingIssue(null);
    setEditQuery("");
  };

  /* Notes modal */
  const [notesIssue, setNotesIssue] = useState<Issue | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [noteType, setNoteType] = useState<NoteType>("Text");
  const [noteText, setNoteText] = useState("");

  // Evidence for note
  const [evidenceType, setEvidenceType] = useState<"none" | "text" | "image" | "audio" | "video">(
    "none"
  );
  const [evidenceText, setEvidenceText] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  const addNote = () => {
    if (!notesIssue || !noteText.trim()) return;
    const evidence: Evidence | undefined =
      evidenceType === "none"
        ? undefined
        : evidenceType === "text"
        ? { type: "text", text: evidenceText }
        : evidenceFile
        ? { type: evidenceType, url: URL.createObjectURL(evidenceFile) }
        : undefined;

    const n: Note = {
      id: Date.now(),
      type: noteType,
      text: noteText.trim(),
      time: new Date().toISOString(),
      user: currentUser,
      evidence,
    };

    setIssues((prev) =>
      prev.map((i) => (i.id === notesIssue.id ? { ...i, notes: [n, ...i.notes] } : i))
    );
    setNotesIssue({ ...notesIssue, notes: [n, ...notesIssue.notes] });
    setNoteText("");
    setEvidenceFile(null);
    setEvidenceText("");
    setEvidenceType("none");
  };

  /* Complete/Close Issue modal */
  const [completeIssue, setCompleteIssue] = useState<Issue | null>(null);
  const [completionEvidenceType, setCompletionEvidenceType] = useState<
    "text" | "image" | "audio" | "video"
  >("text");
  const [completionText, setCompletionText] = useState("");
  const [completionFile, setCompletionFile] = useState<File | null>(null);

  const markComplete = (issue: Issue) => {
    setCompleteIssue(issue);
  };

  const handleSubmitCompletion = () => {
    if (!completeIssue) return;
    const evidence: Evidence =
      completionEvidenceType === "text"
        ? { type: "text", text: completionText || "Resolved with text note." }
        : completionFile
        ? { type: completionEvidenceType, url: URL.createObjectURL(completionFile) }
        : { type: "text", text: "Resolved" };

    // If your flow prefers "resolved" instead of "closed", you can change this.
    const closedStatus = statuses.find((s) => s.toLowerCase() === "closed") || statuses[statuses.length - 1];

    setIssues((prev) =>
      prev.map((i) =>
        i.id === completeIssue.id ? { ...i, status: closedStatus, completionEvidence: evidence } : i
      )
    );
    setCompleteIssue(null);
    setCompletionFile(null);
    setCompletionText("");
  };

  /* Manage statuses */
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
    const duplicate = statuses.some((s, i) => i !== editingIdx && s.toLowerCase() === newName.toLowerCase());
    if (duplicate) return;

    setStatuses((prev) => {
      const copy = [...prev];
      copy[editingIdx] = newName;
      return copy;
    });

    // Remap issues from old status to new status
    setIssues((prev) => prev.map((i) => (i.status === oldName ? { ...i, status: newName } : i)));

    setEditingIdx(null);
    setEditingName("");
  };

  const deleteStatus = (idx: number) => {
    if (statuses.length === 1) return; // cannot delete last
    const toRemove = statuses[idx];
    const next = statuses.filter((_, i) => i !== idx);
    const fallback = next[0];
    setStatuses(next);
    setIssues((prev) => prev.map((i) => (i.status === toRemove ? { ...i, status: fallback } : i)));
  };

  /* Filter modal helpers */
  const resetFilters = () => setFilters({});

  /* ------------------ UI ------------------ */
  return (
    <>
      <Head>
        <title>Issues — WorkVia</title>
      </Head>

      <div
        className="min-h-screen bg-gray-50 text-gray-900"
        style={{
          fontFamily:
            'Lexend, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
        }}
      >
        <main className="flex-1 p-6">
          {/* Top Controls */}
          <div className="mb-4 flex justify-between gap-3 flex-wrap">
            {/* Left: Search */}
            <div className="flex items-center gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search issues, assignees..."
                className="w-72 border border-gray-200 rounded-lg px-3 py-2 bg-white"
              />
            </div>

            {/* Right: Actions */}
            <div className="flex gap-2 flex-wrap">
              {anyFilterActive && (
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 border border-blue-200 self-center">
                  Filters active
                </span>
              )}

              <button
                onClick={() => setShowFilterModal(true)}
                className="px-3 py-2 rounded-lg text-sm flex items-center gap-2 bg-white border border-gray-200"
              >
                <FilterIcon className="w-4 h-4" />
                Filter
              </button>

              <button
                onClick={() => setShowStatusModal(true)}
                className="px-3 py-2 rounded-lg text-sm flex items-center gap-2 bg-white border border-gray-200"
              >
                <Settings className="w-4 h-4" />
                Manage Statuses
              </button>

              <button
                onClick={() => setView("kanban")}
                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  view === "kanban" ? "bg-[#0A236E] text-white" : "bg-white border border-gray-200"
                }`}
              >
                <Layout className="w-4 h-4" /> Kanban
              </button>
              <button
                onClick={() => setView("list")}
                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  view === "list" ? "bg-[#0A236E] text-white" : "bg-white border border-gray-200"
                }`}
              >
                <ListIcon className="w-4 h-4" /> List
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-[#0A236E] text-white rounded-lg"
              >
                + Create Issue
              </button>
            </div>
          </div>

          {/* Kanban */}
          {view === "kanban" && (
            <div className="p-4 rounded-2xl bg-white border border-gray-100">
              <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {columns.map((col) => (
                    <Droppable droppableId={col.key} key={col.key}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="rounded-xl bg-gray-50 border border-gray-200 p-4 min-h-[460px]"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold">{col.title}</h3>
                            <span className="text-xs text-gray-500">
                              {issuesByStatus(col.key).length}
                            </span>
                          </div>

                          <div className="space-y-3">
                            {issuesByStatus(col.key).map((issue, index) => (
                              <Draggable draggableId={String(issue.id)} index={index} key={issue.id}>
                                {(dragProvided) => (
                                  <div
                                    ref={dragProvided.innerRef}
                                    {...dragProvided.draggableProps}
                                    {...dragProvided.dragHandleProps}
                                    className="rounded-xl bg-white border border-gray-200 p-4"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0">
                                        <div className="font-medium break-words">{issue.title}</div>
                                        <div className="text-xs text-gray-500 mt-1 break-words">
                                          {issue.description}
                                        </div>
                                        <div className="flex mt-2 gap-1 flex-wrap">
                                          {issue.assignedTo.map((a, i) => (
                                            <img
                                              key={i}
                                              src={a.avatar}
                                              title={a.name}
                                              className="w-6 h-6 rounded-full border"
                                            />
                                          ))}
                                        </div>

                                        {(issue.createdBy || issue.createdAt) && (
                                          <div className="text-xs text-gray-500 mt-2">
                                            Created by{" "}
                                            <span className="text-gray-800">
                                              {issue.createdBy?.name || "Unknown"}
                                            </span>{" "}
                                            on{" "}
                                            <span className="text-gray-800">
                                              {formatDateTimeNice(issue.createdAt)}
                                            </span>
                                          </div>
                                        )}

                                        <div className="text-xs text-gray-500 mt-1">
                                          Due: {issue.dueDate}
                                        </div>

                                        {/* Overdue in Kanban */}
                                        {issue.status !== "closed" &&
                                          getOverdueInfo(issue.dueDate) && (
                                            <div className="text-xs text-red-500 mt-1">
                                              {getOverdueInfo(issue.dueDate)}
                                            </div>
                                          )}

                                        {/* Completion evidence (if any) */}
                                        {issue.completionEvidence && (
                                          <div className="mt-2 text-xs">
                                            <strong>Resolution Evidence:</strong>
                                            <div className="mt-1">
                                              {issue.completionEvidence.type === "text" && (
                                                <p className="text-gray-700">
                                                  {issue.completionEvidence.text}
                                                </p>
                                              )}
                                              {issue.completionEvidence.type === "image" && (
                                                <img
                                                  src={issue.completionEvidence.url}
                                                  className="rounded-md max-h-40"
                                                />
                                              )}
                                              {issue.completionEvidence.type === "audio" && (
                                                <audio
                                                  controls
                                                  src={issue.completionEvidence.url}
                                                  className="w-full"
                                                />
                                              )}
                                              {issue.completionEvidence.type === "video" && (
                                                <video
                                                  controls
                                                  src={issue.completionEvidence.url}
                                                  className="w-full rounded-md"
                                                />
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      <div className="flex flex-col gap-1 shrink-0">
                                        {issue.status !== "closed" && (
                                          <button
                                            onClick={() => markComplete(issue)}
                                            className="px-2 py-1 bg-green-600 text-white text-xs rounded"
                                          >
                                            Close
                                          </button>
                                        )}
                                        <button
                                          onClick={() => {
                                            setNotesIssue(issue);
                                            setShowNotesModal(true);
                                          }}
                                          className="px-2 py-1 bg-gray-500 text-white text-xs rounded"
                                        >
                                          Notes
                                        </button>
                                        <button
                                          onClick={() => setEditingIssue(issue)}
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
            <div className="p-6 rounded-2xl bg-white border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full table-auto text-sm">
                  <thead className="text-xs text-gray-500 text-left">
                    <tr>
                      <th className="pb-3">Title</th>
                      <th className="pb-3">Description</th>
                      <th className="pb-3">Assignees</th>
                      <th className="pb-3">Created</th>
                      <th className="pb-3">Due</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {filteredIssues.map((issue) => (
                      <tr key={issue.id} className="border-t">
                        <td className="py-3 font-medium">{issue.title}</td>
                        <td className="py-3">{issue.description}</td>
                        <td className="py-3">
                          <div className="flex gap-1 flex-wrap">
                            {issue.assignedTo.map((a, i) => (
                              <img
                                key={i}
                                src={a.avatar}
                                title={a.name}
                                className="w-6 h-6 rounded-full border"
                              />
                            ))}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="text-xs">
                            <div>
                              <span className="text-gray-500">By:</span>{" "}
                              <span className="text-gray-800">
                                {issue.createdBy?.name || "Unknown"}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">On:</span>{" "}
                              <span className="text-gray-800">
                                {formatDateTimeNice(issue.createdAt)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          {issue.dueDate}
                          {issue.status !== "closed" && getOverdueInfo(issue.dueDate) && (
                            <div className="text-xs text-red-500 mt-1">
                              {getOverdueInfo(issue.dueDate)}
                            </div>
                          )}
                        </td>
                        <td className="py-3 capitalize">{statusTitle(issue.status)}</td>
                        <td className="py-3 flex gap-2 flex-wrap">
                          {issue.status !== "closed" && (
                            <button
                              onClick={() => markComplete(issue)}
                              className="px-3 py-1 bg-green-600 text-white rounded text-xs"
                            >
                              Close
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setNotesIssue(issue);
                              setShowNotesModal(true);
                            }}
                            className="px-3 py-1 bg-gray-500 text-white rounded text-xs"
                          >
                            Notes
                          </button>
                          <button
                            onClick={() => setEditingIssue(issue)}
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

      {/* ------------------ Create Issue Modal ------------------ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreateModal(false)} />
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full max-w-lg mx-4 rounded-2xl border border-gray-200 bg-white p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Create Issue</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-sm text-gray-500">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <input
                placeholder="Title"
                value={newIssue.title}
                onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                className="w-full border border-gray-200 rounded px-3 py-2"
              />
              <textarea
                placeholder="Description"
                value={newIssue.description}
                onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                className="w-full border border-gray-200 rounded px-3 py-2"
              />
              <input
                type="date"
                value={newIssue.dueDate}
                onChange={(e) => setNewIssue({ ...newIssue, dueDate: e.target.value })}
                className="w-full border border-gray-200 rounded px-3 py-2"
              />

              {/* Status select */}
              <div>
                <label className="text-sm block mb-1">Status</label>
                <select
                  value={newIssue.status}
                  onChange={(e) => setNewIssue({ ...newIssue, status: e.target.value })}
                  className="w-full border border-gray-200 rounded px-3 py-2"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {statusTitle(s)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assignees input (Gmail-like) */}
            <div className="mt-4">
              <label className="text-sm font-medium mb-1 block">Assign to</label>
              <div className="flex flex-wrap items-center gap-2 border border-gray-200 rounded px-2 py-2 bg-white">
                {newIssue.assignedTo.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#0A236E] text-white text-xs"
                  >
                    <img src={a.avatar} className="w-5 h-5 rounded-full" />
                    {a.name}
                    <X
                      className="w-3 h-3 cursor-pointer ml-1"
                      onClick={() =>
                        setNewIssue({
                          ...newIssue,
                          assignedTo: newIssue.assignedTo.filter((u) => u.name !== a.name),
                        })
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
                <div className="mt-1 rounded-md border border-gray-200 bg-white max-h-40 overflow-y-auto">
                  {createSuggestions.map((s, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setNewIssue({ ...newIssue, assignedTo: [...newIssue.assignedTo, s] });
                        setCreateQuery("");
                      }}
                      className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-50"
                    >
                      <img src={s.avatar} className="w-6 h-6 rounded-full" />
                      <span className="text-sm">{s.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateIssue}
                className="px-4 py-2 bg-[#0A236E] text-white rounded-lg"
              >
                Create
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ------------------ Edit Issue Modal ------------------ */}
      {editingIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditingIssue(null)} />
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full max-w-lg mx-4 rounded-2xl border border-gray-200 bg-white p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Edit Issue</h3>
              <button onClick={() => setEditingIssue(null)} className="text-sm text-gray-500">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <input
                placeholder="Title"
                value={editingIssue.title}
                onChange={(e) => setEditingIssue({ ...editingIssue, title: e.target.value })}
                className="w-full border border-gray-200 rounded px-3 py-2"
              />
              <textarea
                placeholder="Description"
                value={editingIssue.description}
                onChange={(e) => setEditingIssue({ ...editingIssue, description: e.target.value })}
                className="w-full border border-gray-200 rounded px-3 py-2"
              />
              <input
                type="date"
                value={editingIssue.dueDate}
                onChange={(e) => setEditingIssue({ ...editingIssue, dueDate: e.target.value })}
                className="w-full border border-gray-200 rounded px-3 py-2"
              />
              <div>
                <label className="text-sm block mb-1">Status</label>
                <select
                  value={editingIssue.status}
                  onChange={(e) => setEditingIssue({ ...editingIssue, status: e.target.value })}
                  className="w-full border border-gray-200 rounded px-3 py-2"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {statusTitle(s)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assignees */}
            <div className="mt-4">
              <label className="text-sm font-medium mb-1 block">Assign to</label>
              <div className="flex flex-wrap items-center gap-2 border border-gray-200 rounded px-2 py-2 bg-white">
                {editingIssue.assignedTo.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#0A236E] text-white text-xs"
                  >
                    <img src={a.avatar} className="w-5 h-5 rounded-full" />
                    {a.name}
                    <X
                      className="w-3 h-3 cursor-pointer ml-1"
                      onClick={() =>
                        setEditingIssue({
                          ...editingIssue,
                          assignedTo: editingIssue.assignedTo.filter((u) => u.name !== a.name),
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
                <div className="mt-1 rounded-md border border-gray-200 bg-white max-h-40 overflow-y-auto">
                  {editSuggestions.map((s, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setEditingIssue({
                          ...editingIssue,
                          assignedTo: [...editingIssue.assignedTo, s],
                        });
                        setEditQuery("");
                      }}
                      className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-50"
                    >
                      <img src={s.avatar} className="w-6 h-6 rounded-full" />
                      <span className="text-sm">{s.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setEditingIssue(null)}
                className="px-4 py-2 rounded-lg border border-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-[#0A236E] text-white rounded-lg"
              >
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ------------------ Notes Modal ------------------ */}
      {showNotesModal && notesIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowNotesModal(false)} />
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full max-w-xl mx-4 rounded-2xl border border-gray-200 bg-white p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Notes — {notesIssue.title}</h3>
              <button onClick={() => setShowNotesModal(false)} className="text-sm text-gray-500">
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {notesIssue.notes.length === 0 ? (
                <div className="text-sm text-gray-500">No notes yet</div>
              ) : (
                notesIssue.notes.map((n) => {
                  const Icon = iconForType(n.type);
                  return (
                    <div
                      key={n.id}
                      className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="pt-1">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p
                            className={`text-sm ${
                              n.deleted ? "line-through text-gray-400" : "text-gray-800"
                            }`}
                          >
                            {n.text}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <img
                              src={n.user.avatar}
                              className="w-5 h-5 rounded-full"
                              title={n.user.name}
                            />
                            <span className="text-xs text-gray-500">
                              {timeAgo(n.time)}
                              {n.edited && n.updatedAt ? ` • Edited ${timeAgo(n.updatedAt)}` : ""}
                              {n.deleted && n.deletedBy && n.deletedAt
                                ? ` • Deleted by ${n.deletedBy.name} ${timeAgo(n.deletedAt)}`
                                : ""}
                            </span>
                          </div>

                          {/* Evidence preview */}
                          {n.evidence && (
                            <div className="mt-2">
                              {n.evidence.type === "text" && (
                                <p className="text-xs text-gray-700">{n.evidence.text}</p>
                              )}
                              {n.evidence.type === "image" && (
                                <img src={n.evidence.url} className="rounded-md max-h-40" />
                              )}
                              {n.evidence.type === "audio" && (
                                <audio controls src={n.evidence.url} className="w-full" />
                              )}
                              {n.evidence.type === "video" && (
                                <video controls src={n.evidence.url} className="w-full rounded-md" />
                              )}
                            </div>
                          )}
                        </div>

                        {!n.deleted && (
                          <div className="flex gap-1">
                            {/* lightweight edit/delete icons (non-functional editing for brevity) */}
                            <button className="p-1 rounded hover:bg-white" title="Edit (demo)">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button className="p-1 rounded hover:bg-white" title="Delete (demo)">
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

            {/* Add Note */}
            <div className="mt-4 border-t pt-3">
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <select
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value as NoteType)}
                    className="border border-gray-200 rounded px-2 py-1 text-sm"
                  >
                    <option value="Call">📞 Call</option>
                    <option value="Email">✉️ Email</option>
                    <option value="Text">💬 Text</option>
                    <option value="WhatsApp">📱 WhatsApp</option>
                  </select>

                  <select
                    value={evidenceType}
                    onChange={(e) => setEvidenceType(e.target.value as any)}
                    className="border border-gray-200 rounded px-2 py-1 text-sm"
                  >
                    <option value="none">No Evidence</option>
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                    <option value="audio">Audio</option>
                    <option value="video">Video</option>
                  </select>

                  <input
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add a note..."
                    className="border border-gray-200 rounded px-2 py-1 text-sm"
                  />
                </div>

                {evidenceType === "text" && (
                  <textarea
                    placeholder="Enter text evidence..."
                    value={evidenceText}
                    onChange={(e) => setEvidenceText(e.target.value)}
                    className="border border-gray-200 rounded px-2 py-1 text-sm"
                  />
                )}
                {["image", "audio", "video"].includes(evidenceType) && (
                  <input
                    type="file"
                    accept={
                      evidenceType === "image"
                        ? "image/*"
                        : evidenceType === "audio"
                        ? "audio/*"
                        : "video/*"
                    }
                    onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                    className="border border-gray-200 rounded px-2 py-1 text-sm"
                  />
                )}

                <button
                  onClick={addNote}
                  className="mt-2 px-3 py-2 bg-[#0A236E] text-white rounded text-sm self-end"
                >
                  Add Note
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ------------------ Close Issue (Completion Evidence) ------------------ */}
      {completeIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCompleteIssue(null)} />
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full max-w-md mx-4 rounded-2xl border border-gray-200 bg-white p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Close Issue — {completeIssue.title}</h3>
              <button onClick={() => setCompleteIssue(null)} className="text-sm text-gray-500">
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <select
                value={completionEvidenceType}
                onChange={(e) => setCompletionEvidenceType(e.target.value as any)}
                className="border border-gray-200 rounded px-2 py-1 text-sm w-full"
              >
                <option value="text">Text</option>
                <option value="image">Image</option>
                <option value="audio">Audio</option>
                <option value="video">Video</option>
              </select>

              {completionEvidenceType === "text" && (
                <textarea
                  placeholder="Enter text evidence..."
                  value={completionText}
                  onChange={(e) => setCompletionText(e.target.value)}
                  className="border border-gray-200 rounded px-2 py-1 text-sm w-full"
                />
              )}
              {["image", "audio", "video"].includes(completionEvidenceType) && (
                <input
                  type="file"
                  accept={
                    completionEvidenceType === "image"
                      ? "image/*"
                      : completionEvidenceType === "audio"
                      ? "audio/*"
                      : "video/*"
                  }
                  onChange={(e) => setCompletionFile(e.target.files?.[0] || null)}
                  className="border border-gray-200 rounded px-2 py-1 text-sm w-full"
                />
              )}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setCompleteIssue(null)}
                className="px-4 py-2 rounded-lg border border-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCompletion}
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                Close Issue
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ------------------ Filter Modal ------------------ */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilterModal(false)} />
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full max-w-md mx-4 rounded-2xl border border-gray-200 bg-white p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Filter Issues</h3>
              <button onClick={() => setShowFilterModal(false)} className="text-sm text-gray-500">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs block mb-1">Created From</label>
                  <input
                    type="date"
                    value={filters.createdFrom || ""}
                    onChange={(e) => setFilters({ ...filters, createdFrom: e.target.value })}
                    className="w-full border border-gray-200 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-xs block mb-1">Created To</label>
                  <input
                    type="date"
                    value={filters.createdTo || ""}
                    onChange={(e) => setFilters({ ...filters, createdTo: e.target.value })}
                    className="w-full border border-gray-200 rounded px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs block mb-1">Created By</label>
                <select
                  value={filters.createdBy || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, createdBy: e.target.value || undefined })
                  }
                  className="w-full border border-gray-200 rounded px-3 py-2"
                >
                  <option value="">Anyone</option>
                  {[currentUser, ...availableUsers]
                    .reduce<User[]>((acc, u) => {
                      if (!acc.some((x) => x.name === u.name)) acc.push(u);
                      return acc;
                    }, [])
                    .map((u) => (
                      <option key={u.name} value={u.name}>
                        {u.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs block mb-1">Assigned To</label>
                <select
                  value={filters.assignedTo || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, assignedTo: e.target.value || undefined })
                  }
                  className="w-full border border-gray-200 rounded px-3 py-2"
                >
                  <option value="">Anyone</option>
                  {[currentUser, ...availableUsers]
                    .reduce<User[]>((acc, u) => {
                      if (!acc.some((x) => x.name === u.name)) acc.push(u);
                      return acc;
                    }, [])
                    .map((u) => (
                      <option key={u.name} value={u.name}>
                        {u.name}
                      </option>
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
                  className="w-full border border-gray-200 rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-between">
              <button onClick={resetFilters} className="px-3 py-2 rounded-lg border border-gray-200">
                Clear
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="px-3 py-2 rounded-lg border border-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ------------------ Manage Statuses Modal ------------------ */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowStatusModal(false)} />
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full max-w-md mx-4 rounded-2xl border border-gray-200 bg-white p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Manage Statuses</h3>
              <button onClick={() => setShowStatusModal(false)} className="text-sm text-gray-500">
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {statuses.map((s, idx) => (
                <div
                  key={s + idx}
                  className="flex items-center gap-2 border border-gray-200 rounded px-2 py-2"
                >
                  {editingIdx === idx ? (
                    <>
                      <input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 border border-gray-200 rounded px-2 py-1"
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
                className="flex-1 border border-gray-200 rounded px-3 py-2"
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
                className="px-3 py-2 rounded-lg border border-gray-200"
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
