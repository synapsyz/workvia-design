"use client";

import React, { useState, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Edit3,
  UserPlus,
  UsersRound,
  UserCheck,
  UserX,
  PlusCircle,
  Tag,
  X,
  Users, // fallback if UsersRound is missing
} from "lucide-react";

/* =========================
   Types
========================= */
type Status = "active" | "inactive";

interface User {
  id: number;
  name: string;
  email: string;
  contact: string;
  designation: string;
  status: Status;
  managerId?: number | null;
  groupIds?: number[];
}

interface Group {
  id: number;
  name: string;
  description?: string;
  color: "blue" | "indigo" | "violet" | "green" | "orange";
  memberIds: number[];
}

/* =========================
   Utilities / UI Tokens
========================= */
const avatarUrl = (id: number) =>
  `https://i.pravatar.cc/150?img=${(id % 70) + 1}`;

const brand = "#0A236E";

const colorMap: Record<
  Group["color"],
  { bgSoft: string; text: string; ring: string }
> = {
  blue: { bgSoft: "#EEF2FF", text: "#1E3A8A", ring: "rgba(59,130,246,.25)" },
  indigo: { bgSoft: "#EEF2FF", text: "#312E81", ring: "rgba(99,102,241,.25)" },
  violet: { bgSoft: "#F5F3FF", text: "#4C1D95", ring: "rgba(139,92,246,.25)" },
  green: { bgSoft: "#ECFDF5", text: "#065F46", ring: "rgba(16,185,129,.25)" },
  orange: { bgSoft: "#FFF7ED", text: "#7C2D12", ring: "rgba(245,158,11,.25)" },
};

const UsersIcon = UsersRound ?? Users;


/* =========================
   Small UI primitives
========================= */
function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 12, opacity: 0 }}
        className="relative w-full max-w-lg mx-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-lg"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function Input({
  label,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--brand,#0A236E)]/20"
        style={{ '--brand': brand } as React.CSSProperties}
      />
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        rows={3}
        className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--brand,#0A236E)]/20"
        style={{ '--brand': brand } as React.CSSProperties}
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { label: string; value: string | number }[];
}) {
  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--brand,#0A236E)]/20"
        style={{ '--brand': brand } as React.CSSProperties}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function MultiSelect({
  label,
  options,
  values,
  onToggle,
}: {
  label: string;
  options: { label: string; value: number }[];
  values: number[];
  onToggle: (value: number) => void;
}) {
  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => {
          const active = values.includes(o.value);
          return (
            <button
              type="button"
              key={o.value}
              onClick={() => onToggle(o.value)}
              className={`px-3 py-1.5 rounded-full text-xs border transition ${
                active
                  ? "bg-[var(--brand,#0A236E)] text-white border-[var(--brand,#0A236E)]"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
              style={{ '--brand': brand } as React.CSSProperties}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Button({
  children,
  onClick,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "ghost" | "danger";
}) {
  const base =
    "px-4 py-2 rounded-xl text-sm font-medium transition border focus:outline-none";
  const styles =
    variant === "primary"
      ? "bg-[var(--brand,#0A236E)] text-white border-[var(--brand,#0A236E)] hover:bg-[color:var(--brand,#0A236E)]/90"
      : variant === "ghost"
      ? "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
      : "bg-red-600 text-white border-red-600 hover:bg-red-700";
  return (
    <button
      onClick={onClick}
      className={`${base} ${styles}`}
      style={{ '--brand': brand } as React.CSSProperties}
    >
      {children}
    </button>
  );
}

/* =========================
   Seed data
========================= */
const seedUsers: User[] = [
    { id: 1, name: "Asha Raman", email: "asha@example.com", contact: "9876543210", designation: "Product Lead", status: "active", managerId: 3, groupIds: [1] },
    { id: 2, name: "John Doe", email: "john@example.com", contact: "9123456780", designation: "Developer", status: "inactive", managerId: 1, groupIds: [2] },
    { id: 3, name: "Jane Smith", email: "jane@example.com", contact: "9988776655", designation: "Designer", status: "active", managerId: null, groupIds: [1, 2] },
];

const seedGroups: Group[] = [
    { id: 1, name: "Engineering", description: "Builds product features", color: "blue", memberIds: [1, 3] },
    { id: 2, name: "Design", description: "Design system & visuals", color: "indigo", memberIds: [2, 3] },
];


/* =========================
   Page
========================= */
export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(seedUsers);
  const [groups, setGroups] = useState<Group[]>(seedGroups);

  const [activeTab, setActiveTab] = useState<"users" | "groups">("users");
  const [peopleFilter, setPeopleFilter] = useState<"all" | "active" | "inactive">(
    "all"
  );

  // Modals (users)
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Modals (groups)
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<Group | null>(null);

  // Forms
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    contact: "",
    designation: "",
    password: "",
    managerId: "",
    groupIds: [] as number[],
  });

  const [groupForm, setGroupForm] = useState<{
    id?: number;
    name: string;
    description: string;
    color: Group["color"];
    memberIds: number[];
  }>({
    name: "",
    description: "",
    color: "blue",
    memberIds: [],
  });

  const filteredUsers = users.filter((u) =>
    peopleFilter === "all" ? true : u.status === peopleFilter
  );

  /* =========================
     CRUD — Users
 ========================= */
  const handleOpenCreateUser = () => {
    setNewUser({
      name: "",
      email: "",
      contact: "",
      designation: "",
      password: "",
      managerId: "",
      groupIds: [],
    });
    setShowCreateUserModal(true);
  };

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email) return;
    const id = Math.max(0, ...users.map((u) => u.id)) + 1;
    const user: User = {
      id,
      name: newUser.name,
      email: newUser.email,
      contact: newUser.contact,
      designation: newUser.designation,
      status: "active",
      managerId: newUser.managerId ? parseInt(newUser.managerId, 10) : null,
      groupIds: newUser.groupIds,
    };
    setUsers((prev) => [...prev, user]);
    setShowCreateUserModal(false);
  };

  const handleSaveEditUser = () => {
    if (!editingUser) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === editingUser.id ? editingUser : u))
    );
    setEditingUser(null);
  };

  const handleConfirmDeleteUser = () => {
    if (!deletingUser) return;
    setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
    setDeletingUser(null);
  };

  /* =========================
     CRUD — Groups
 ========================= */
  const openEditGroup = (group: Group) => {
    setGroupForm({
      id: group.id,
      name: group.name,
      description: group.description || "",
      color: group.color,
      memberIds: [...group.memberIds],
    });
    setEditingGroup(group);
  };

  const createGroup = () => {
    if (!groupForm.name.trim()) return;
    const id = Math.max(0, ...groups.map((g) => g.id)) + 1;
    const newG: Group = {
      id,
      name: groupForm.name.trim(),
      description: groupForm.description.trim(),
      color: groupForm.color,
      memberIds: [...groupForm.memberIds],
    };
    setGroups((prev) => [...prev, newG]);
    setShowCreateGroupModal(false);
  };

  const saveGroup = () => {
    if (!editingGroup || !groupForm.id) return;
    const updated: Group = {
      id: groupForm.id,
      name: groupForm.name,
      description: groupForm.description,
      color: groupForm.color,
      memberIds: [...groupForm.memberIds],
    };
    setGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    setEditingGroup(null);
  };

  const confirmDeleteGroup = () => {
    if (!deletingGroup) return;
    setGroups((prev) => prev.filter((g) => g.id !== deletingGroup.id));
    setDeletingGroup(null);
  };

  /* =========================
     Render helpers
 ========================= */
  const groupsForUser = (u: User) => {
    const list = (u.groupIds || [])
      .map((gid) => groups.find((g) => g.id === gid))
      .filter((g): g is Group => Boolean(g));
    if (!list.length)
      return <span className="text-gray-500 text-xs">No group</span>;
    return (
      <div className="flex flex-wrap gap-1.5">
        {list.map((g) => {
          const c = colorMap[g.color];
          return (
            <span
              key={g.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium"
              style={{
                backgroundColor: c.bgSoft,
                color: c.text,
                boxShadow: `0 0 0 1px ${c.ring} inset`,
              }}
            >
              <Tag className="w-3.5 h-3.5 opacity-70" />
              {g.name}
            </span>
          );
        })}
      </div>
    );
  };

  const managerCell = (u: User) => {
    if (!u.managerId) return <span className="text-gray-500 text-xs">—</span>;
    const m = users.find((x) => x.id === u.managerId);
    return (
      <div className="flex items-center gap-2">
        <img
          src={avatarUrl(m?.id || 1)}
          alt={m?.name}
          className="w-7 h-7 rounded-full object-cover ring-1 ring-black/5"
        />
        <div className="text-sm">{m?.name}</div>
      </div>
    );
  };

  const Row = ({ children }: { children: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1 }}
      className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm hover:shadow transition-shadow"
    >
      {children}
    </motion.div>
  );

  /* =========================
     JSX
 ========================= */
  return (
    <div className="p-6 space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${
            activeTab === "users"
              ? "bg-[var(--brand,#0A236E)] text-white border-[var(--brand,#0A236E)]"
              : "bg-white border-gray-200 hover:bg-gray-50"
          }`}
          style={{ '--brand': brand } as React.CSSProperties}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab("groups")}
          className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${
            activeTab === "groups"
              ? "bg-[var(--brand,#0A236E)] text-white border-[var(--brand,#0A236E)]"
              : "bg-white border-gray-200 hover:bg-gray-50"
          }`}
          style={{ '--brand': brand } as React.CSSProperties}
        >
          Groups
        </button>
      </div>

      {/* USERS LIST */}
      {activeTab === "users" && (
        <Fragment>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setPeopleFilter("all")}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium border transition ${
                peopleFilter === "all"
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
            >
              <UsersIcon className="w-4 h-4" /> All
            </button>
            <button
              onClick={() => setPeopleFilter("active")}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium border transition ${
                peopleFilter === "active"
                  ? "bg-[var(--brand,#0A236E)] text-white border-[var(--brand,#0A236E)]"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
              style={{ '--brand': brand } as React.CSSProperties}
            >
              <UserCheck className="w-4 h-4" /> Active
            </button>
            <button
              onClick={() => setPeopleFilter("inactive")}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium border transition ${
                peopleFilter === "inactive"
                  ? "bg-[var(--brand,#0A236E)] text-white border-[var(--brand,#0A236E)]"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
              style={{ '--brand': brand } as React.CSSProperties}
            >
              <UserX className="w-4 h-4" /> Inactive
            </button>

            <div className="flex-1" />
            <button
              onClick={handleOpenCreateUser}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--brand,#0A236E)] text-white hover:bg-[color:var(--brand,#0A236E)]/90"
              style={{ '--brand': brand } as React.CSSProperties}
            >
              <PlusCircle className="w-4 h-4" /> Create User
            </button>
          </div>
          <div className="space-y-2">
            {filteredUsers.map((u) => (
              <Row key={u.id}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img
                    src={avatarUrl(u.id)}
                    alt={u.name}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-black/5"
                  />
                  <div className="min-w-0">
                    <div className="font-semibold leading-tight truncate">
                      {u.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {u.designation}
                    </div>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-4 min-w-0 flex-[1.2]">
                  <div className="min-w-0">
                    <div className="text-[12px] text-gray-500">Email</div>
                    <div className="text-sm truncate">{u.email}</div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[12px] text-gray-500">Contact</div>
                    <div className="text-sm truncate">{u.contact}</div>
                  </div>
                </div>
                <div className="hidden lg:flex items-center min-w-0 flex-[0.9]">
                  <div className="min-w-0">
                    <div className="text-[12px] text-gray-500">Manager</div>
                    <div className="text-sm truncate">{managerCell(u)}</div>
                  </div>
                </div>
                <div className="hidden xl:flex items-center min-w-0 flex-[1.2]">
                  <div className="min-w-0">
                    <div className="text-[12px] text-gray-500">Groups</div>
                    <div className="truncate">{groupsForUser(u)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingUser(u)}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingUser(u)}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Row>
            ))}
          </div>
        </Fragment>
      )}

      {/* GROUPS LIST */}
      {activeTab === "groups" && (
        <Fragment>
          <div className="flex justify-end">
            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--brand,#0A236E)] text-white hover:bg-[color:var(--brand,#0A236E)]/90"
              style={{ '--brand': brand } as React.CSSProperties}
            >
              <UserPlus className="w-4 h-4" /> Create Group
            </button>
          </div>
          <div className="space-y-2">
            {groups.map((g) => {
              const c = colorMap[g.color];
              return (
                <Row key={g.id}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium"
                        style={{
                          backgroundColor: c.bgSoft,
                          color: c.text,
                          boxShadow: `0 0 0 1px ${c.ring} inset`,
                        }}
                      >
                        <Tag className="w-3.5 h-3.5 opacity-70" />
                        {g.name}
                      </span>
                      <div className="font-semibold truncate">{g.name}</div>
                    </div>
                    <div className="mt-1 text-sm text-gray-600 truncate">
                      {g.description || (
                        <span className="text-gray-400">No description</span>
                      )}
                    </div>
                  </div>
                  <div className="hidden md:flex items-center">
                    <div className="flex -space-x-2">
                      {g.memberIds.slice(0, 10).map((uid) => {
                        const u = users.find((x) => x.id === uid);
                        if (!u) return null;
                        return (
                          <img
                            key={uid}
                            src={avatarUrl(uid)}
                            alt={u.name}
                            title={u.name}
                            className="w-8 h-8 rounded-full ring-2 ring-white object-cover"
                          />
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditGroup(g)}
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingGroup(g)}
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Row>
              );
            })}
          </div>
        </Fragment>
      )}

      {/* MODALS */}
      <AnimatePresence>
        {showCreateUserModal && (
          <Modal onClose={() => setShowCreateUserModal(false)} title="Create User">
            <div className="grid grid-cols-1 gap-3">
              <Input label="Name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
              <Input label="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
              <Input label="Contact" value={newUser.contact} onChange={(e) => setNewUser({ ...newUser, contact: e.target.value })} />
              <Input label="Designation" value={newUser.designation} onChange={(e) => setNewUser({ ...newUser, designation: e.target.value })} />
              <Input label="Password" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
              <Select label="Manager" value={newUser.managerId} onChange={(e) => setNewUser({ ...newUser, managerId: e.target.value })} options={[{ label: "None", value: "" }, ...users.map((u) => ({ label: u.name, value: String(u.id) }))]} />
              <MultiSelect label="Groups" options={groups.map((g) => ({ label: g.name, value: g.id }))} values={newUser.groupIds} onToggle={(id) => setNewUser((prev) => ({ ...prev, groupIds: prev.groupIds.includes(id) ? prev.groupIds.filter((x) => x !== id) : [...prev.groupIds, id] }))} />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowCreateUserModal(false)}>Cancel</Button>
              <Button onClick={handleCreateUser}>Create</Button>
            </div>
          </Modal>
        )}

        {editingUser && (
          <Modal onClose={() => setEditingUser(null)} title="Edit User">
             <div className="grid grid-cols-1 gap-3">
              <Input label="Name" value={editingUser.name} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} />
              <Input label="Email" value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} />
              <Input label="Contact" value={editingUser.contact} onChange={(e) => setEditingUser({ ...editingUser, contact: e.target.value })} />
              <Input label="Designation" value={editingUser.designation} onChange={(e) => setEditingUser({ ...editingUser, designation: e.target.value })} />
              <Select label="Status" value={editingUser.status} onChange={(e) => setEditingUser({...editingUser, status: e.target.value as Status})} options={[{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }]} />
              <Select label="Manager" value={String(editingUser.managerId ?? "")} onChange={(e) => setEditingUser({...editingUser, managerId: e.target.value ? parseInt(e.target.value, 10) : null})} options={[{ label: "None", value: "" }, ...users.map((u) => ({ label: u.name, value: String(u.id) }))]} />
              <MultiSelect label="Groups" options={groups.map((g) => ({ label: g.name, value: g.id }))} values={editingUser.groupIds || []} onToggle={(id) => setEditingUser((prev) => { if (!prev) return prev; const current = prev.groupIds || []; return { ...prev, groupIds: current.includes(id) ? current.filter((x) => x !== id) : [...current, id] }; })} />
            </div>
            <div className="mt-5 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setEditingUser(null)}>Cancel</Button>
                <Button onClick={handleSaveEditUser}>Save</Button>
            </div>
          </Modal>
        )}

        {deletingUser && (
           <Modal onClose={() => setDeletingUser(null)} title="Delete User">
            <div className="text-sm text-gray-700">Are you sure you want to delete <span className="font-medium">{deletingUser.name}</span>?</div>
            <div className="mt-5 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setDeletingUser(null)}>Cancel</Button>
                <Button variant="danger" onClick={handleConfirmDeleteUser}>Delete</Button>
            </div>
          </Modal>
        )}

        {showCreateGroupModal && (
          <Modal onClose={() => setShowCreateGroupModal(false)} title="Create Group">
            <div className="grid grid-cols-1 gap-3">
              <Input label="Name" value={groupForm.name} onChange={(e) => setGroupForm((p) => ({ ...p, name: e.target.value }))} />
              <Textarea label="Description" value={groupForm.description} onChange={(e) => setGroupForm((p) => ({ ...p, description: e.target.value }))} />
              <Select label="Color" value={groupForm.color} onChange={(e) => setGroupForm((p) => ({ ...p, color: e.target.value as Group["color"] }))} options={[{ label: "Blue", value: "blue" }, { label: "Indigo", value: "indigo" }, { label: "Violet", value: "violet" }, { label: "Green", value: "green" }, { label: "Orange", value: "orange" }]} />
              <MultiSelect label="Members" options={users.map((u) => ({ label: u.name, value: u.id }))} values={groupForm.memberIds} onToggle={(id) => setGroupForm((p) => ({ ...p, memberIds: p.memberIds.includes(id) ? p.memberIds.filter((x) => x !== id) : [...p.memberIds, id] }))} />
            </div>
            <div className="mt-5 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowCreateGroupModal(false)}>Cancel</Button>
                <Button onClick={createGroup}>Create</Button>
            </div>
          </Modal>
        )}

         {editingGroup && (
          <Modal onClose={() => setEditingGroup(null)} title="Edit Group">
            <div className="grid grid-cols-1 gap-3">
              <Input label="Name" value={groupForm.name} onChange={(e) => setGroupForm((p) => ({ ...p, name: e.target.value }))} />
              <Textarea label="Description" value={groupForm.description} onChange={(e) => setGroupForm((p) => ({ ...p, description: e.target.value }))} />
              <Select label="Color" value={groupForm.color} onChange={(e) => setGroupForm((p) => ({ ...p, color: e.target.value as Group["color"] }))} options={[{ label: "Blue", value: "blue" }, { label: "Indigo", value: "indigo" }, { label: "Violet", value: "violet" }, { label: "Green", value: "green" }, { label: "Orange", value: "orange" }]} />
              <MultiSelect label="Members" options={users.map((u) => ({ label: u.name, value: u.id }))} values={groupForm.memberIds} onToggle={(id) => setGroupForm((p) => ({ ...p, memberIds: p.memberIds.includes(id) ? p.memberIds.filter((x) => x !== id) : [...p.memberIds, id] }))} />
            </div>
            <div className="mt-5 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setEditingGroup(null)}>Cancel</Button>
                <Button onClick={saveGroup}>Save</Button>
            </div>
          </Modal>
        )}

        {deletingGroup && (
          <Modal onClose={() => setDeletingGroup(null)} title="Delete Group">
            <div className="text-sm text-gray-700">Are you sure you want to delete <span className="font-medium">{deletingGroup.name}</span>?</div>
             <div className="mt-5 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setDeletingGroup(null)}>Cancel</Button>
                <Button variant="danger" onClick={confirmDeleteGroup}>Delete</Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}