"use client";

import React, { useMemo, useState } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import {
  Trash2,
  Save,
  PlusCircle,
  X,
  Upload,
  Pencil,
  Eye,
  FileDown,
  CreditCard,
  CalendarDays,
} from "lucide-react";

interface Permission {
  create: boolean;
  update: boolean;
  delete: boolean;
  view: boolean;
}

interface Role {
  id: number;
  designation: string;
  permissions: {
    [key: string]: Permission;
  };
}

type FieldType = "text" | "email" | "password" | "number" | "date" | "select";

interface AuthField {
  id: number;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // only for "select"
}

type BillingCycle = "Monthly" | "Yearly";

interface Plan {
  id: number;
  name: string;
  price: number;
  currency: string; // e.g., "₹" or "$"
  cycle: BillingCycle;
  features: string[];
  trialDays?: number;
  maxUsers?: number;
  storageGB?: number;
}

interface Invoice {
  id: number;
  number: string;
  date: string; // ISO date string
  amount: number;
  currency: string;
  status: "Paid" | "Unpaid" | "Refunded";
}

const MODULES = [
  "User",
  "Group",
  "SOP",
  "Exam",
  "Task",
  "Training",
  "Report",
  "Settings",
];

function addDays(baseISO: string, days: number) {
  const d = new Date(baseISO);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function addYears(baseISO: string, years: number) {
  const d = new Date(baseISO);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
}

export default function SettingsPage() {
  // ---------- Theme (Account Settings) ----------
  const [primaryColor, setPrimaryColor] = useState("#0A236E");
  const [secondaryColor, setSecondaryColor] = useState("#1e3a8a");
  const [accentColor, setAccentColor] = useState("#f74c61");

  const themeStyleVars = {
    "--primary": primaryColor,
    "--secondary": secondaryColor,
    "--accent": accentColor,
  } as React.CSSProperties;

  // ---------- Tab State ----------
  const [activeTab, setActiveTab] = useState<
    "roles" | "auth" | "account" | "billing"
  >("roles");

  // ---------- Roles & Access ----------
  const [roles, setRoles] = useState<Role[]>([
    {
      id: 1,
      designation: "Admin",
      permissions: Object.fromEntries(
        MODULES.map((m) => [
          m,
          { create: true, update: true, delete: true, view: true },
        ])
      ),
    },
  ]);

  const [newDesignation, setNewDesignation] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [editName, setEditName] = useState("");

  const handleAddRole = () => {
    if (!newDesignation.trim()) {
      alert("Enter a valid designation name.");
      return;
    }
    const newRole: Role = {
      id: Date.now(),
      designation: newDesignation.trim(),
      permissions: Object.fromEntries(
        MODULES.map((m) => [
          m,
          { create: false, update: false, delete: false, view: false },
        ])
      ),
    };
    setRoles((prev) => [...prev, newRole]);
    setNewDesignation("");
  };

  const togglePermission = (
    roleId: number,
    module: string,
    action: keyof Permission
  ) => {
    setRoles((prev) =>
      prev.map((role) =>
        role.id === roleId
          ? {
              ...role,
              permissions: {
                ...role.permissions,
                [module]: {
                  ...role.permissions[module],
                  [action]: !role.permissions[module][action],
                },
              },
            }
          : role
      )
    );

    if (selectedRole && selectedRole.id === roleId) {
      setSelectedRole((prev) =>
        prev
          ? {
              ...prev,
              permissions: {
                ...prev.permissions,
                [module]: {
                  ...prev.permissions[module],
                  [action]: !prev.permissions[module][action],
                },
              },
            }
          : null
      );
    }
  };

  const handleSaveRole = (roleId: number) => {
    setRoles((prev) =>
      prev.map((r) =>
        r.id === roleId ? { ...r, designation: editName || r.designation } : r
      )
    );
    if (selectedRole) {
      setSelectedRole((prev) =>
        prev ? { ...prev, designation: editName || prev.designation } : prev
      );
    }
    alert("Role updated successfully!");
  };

  const handleDeleteRole = (roleId: number) => {
    if (!confirm("Are you sure you want to delete this role?")) return;
    setRoles((prev) => prev.filter((r) => r.id !== roleId));
    if (selectedRole?.id === roleId) setSelectedRole(null);
  };

  const handleCloseEditor = () => {
    setSelectedRole(null);
    setEditName("");
  };

  // ---------- Authentication Settings ----------
  const [signinTitle, setSigninTitle] = useState("Welcome Back!");
  const [signinSubtitle, setSigninSubtitle] = useState("Sign in to continue.");
  const [signinButton, setSigninButton] = useState("Sign In");
  const [showRememberMe, setShowRememberMe] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(true);
  const [enableSocial, setEnableSocial] = useState(false);

  const [signupTitle, setSignupTitle] = useState("Create an Account");
  const [signupSubtitle, setSignupSubtitle] = useState(
    "Join us and get started today."
  );
  const [signupButton, setSignupButton] = useState("Sign Up");
  const [showTerms, setShowTerms] = useState(true);
  const [signupImage, setSignupImage] = useState<string | null>(null);

  const [signinFields, setSigninFields] = useState<AuthField[]>([]);
  const [signupFields, setSignupFields] = useState<AuthField[]>([]);

  const [showFieldModal, setShowFieldModal] = useState(false);
  const [modalTarget, setModalTarget] = useState<"signin" | "signup">("signup");
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldType, setFieldType] = useState<FieldType>("text");
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldOptionsCSV, setFieldOptionsCSV] = useState("");

  const openFieldModal = (target: "signin" | "signup") => {
    setModalTarget(target);
    setFieldLabel("");
    setFieldType("text");
    setFieldRequired(false);
    setFieldOptionsCSV("");
    setShowFieldModal(true);
  };

  const closeFieldModal = () => {
    setShowFieldModal(false);
  };

  const addAuthField = () => {
    if (!fieldLabel.trim()) {
      alert("Field label is required.");
      return;
    }

    const newField: AuthField = {
      id: Date.now(),
      label: fieldLabel.trim(),
      type: fieldType,
      required: fieldRequired,
      options:
        fieldType === "select"
          ? fieldOptionsCSV
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
    };

    if (modalTarget === "signin") {
      setSigninFields((prev) => [...prev, newField]);
    } else {
      setSignupFields((prev) => [...prev, newField]);
    }

    setShowFieldModal(false);
  };

  const deleteAuthField = (target: "signin" | "signup", id: number) => {
    if (target === "signin") {
      setSigninFields((prev) => prev.filter((f) => f.id !== id));
    } else {
      setSignupFields((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSignupImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveAuthSettings = () => {
    alert("Authentication settings saved successfully!");
  };

  // ---------- Account Settings ----------
  const [accountLogo, setAccountLogo] = useState<string | null>(null);
  const [accountFavicon, setAccountFavicon] = useState<string | null>(null);

  const [adminName, setAdminName] = useState("Admin");
  const [adminEmail, setAdminEmail] = useState("admin@example.com");
  const [adminPassword, setAdminPassword] = useState("");

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setAccountLogo(r.result as string);
    r.readAsDataURL(f);
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setAccountFavicon(r.result as string);
    r.readAsDataURL(f);
  };

  const clearLogo = () => setAccountLogo(null);
  const clearFavicon = () => setAccountFavicon(null);

  const saveBranding = () => {
    alert("Branding saved successfully!");
  };

  const saveAdminDetails = () => {
    alert("Admin details saved successfully!");
    setAdminPassword("");
  };

  const applyTheme = () => {
    alert("Theme colors applied successfully!");
  };

  // ---------- Billing & Payments (Dynamic Plan Manager) ----------
  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [plans, setPlans] = useState<Plan[]>([
    {
      id: 1,
      name: "Starter",
      price: 999,
      currency: "₹",
      cycle: "Monthly",
      features: ["Up to 5 users", "Basic analytics", "Email support"],
      trialDays: 7,
      maxUsers: 5,
      storageGB: 10,
    },
    {
      id: 2,
      name: "Pro",
      price: 2999,
      currency: "₹",
      cycle: "Monthly",
      features: ["Up to 50 users", "Advanced analytics", "Priority support"],
      trialDays: 14,
      maxUsers: 50,
      storageGB: 100,
    },
    {
      id: 3,
      name: "Enterprise",
      price: 9999,
      currency: "₹",
      cycle: "Monthly",
      features: ["Unlimited users", "Custom SLAs", "Dedicated success manager"],
      trialDays: 30,
      maxUsers: 0,
      storageGB: 1000,
    },
  ]);
  const [currentPlanId, setCurrentPlanId] = useState<number>(2);
  const [currentPlanStart, setCurrentPlanStart] = useState<string>(todayISO);
  const [nextBillingDate, setNextBillingDate] = useState<string>(
    addDays(todayISO, 30)
  );

  const currentPlan = useMemo(
    () => plans.find((p) => p.id === currentPlanId) || null,
    [plans, currentPlanId]
  );

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 101,
      number: "INV-000101",
      date: addDays(todayISO, -60),
      amount: 2999,
      currency: "₹",
      status: "Paid",
    },
    {
      id: 102,
      number: "INV-000102",
      date: addDays(todayISO, -30),
      amount: 2999,
      currency: "₹",
      status: "Paid",
    },
  ]);

  // Plan Modal (Add/Edit)
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState<number>(0);
  const [planCurrency, setPlanCurrency] = useState("₹");
  const [planCycle, setPlanCycle] = useState<BillingCycle>("Monthly");
  const [planFeaturesCSV, setPlanFeaturesCSV] = useState("");
  const [planTrialDays, setPlanTrialDays] = useState<number>(0);
  const [planMaxUsers, setPlanMaxUsers] = useState<number>(0);
  const [planStorageGB, setPlanStorageGB] = useState<number>(0);

  const openAddPlan = () => {
    setEditingPlanId(null);
    setPlanName("");
    setPlanPrice(0);
    setPlanCurrency("₹");
    setPlanCycle("Monthly");
    setPlanFeaturesCSV("");
    setPlanTrialDays(0);
    setPlanMaxUsers(0);
    setPlanStorageGB(0);
    setShowPlanModal(true);
  };

  const openEditPlan = (plan: Plan) => {
    setEditingPlanId(plan.id);
    setPlanName(plan.name);
    setPlanPrice(plan.price);
    setPlanCurrency(plan.currency);
    setPlanCycle(plan.cycle);
    setPlanFeaturesCSV((plan.features || []).join(", "));
    setPlanTrialDays(plan.trialDays || 0);
    setPlanMaxUsers(plan.maxUsers || 0);
    setPlanStorageGB(plan.storageGB || 0);
    setShowPlanModal(true);
  };

  const closePlanModal = () => setShowPlanModal(false);

  const savePlanFromModal = () => {
    if (!planName.trim()) {
      alert("Plan name is required.");
      return;
    }
    const features = planFeaturesCSV
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (editingPlanId) {
      // update
      setPlans((prev) =>
        prev.map((p) =>
          p.id === editingPlanId
            ? {
                ...p,
                name: planName.trim(),
                price: Number(planPrice) || 0,
                currency: planCurrency,
                cycle: planCycle,
                features,
                trialDays: Number(planTrialDays) || 0,
                maxUsers: Number(planMaxUsers) || 0,
                storageGB: Number(planStorageGB) || 0,
              }
            : p
        )
      );
      alert("Plan updated!");
    } else {
      // add
      const newPlan: Plan = {
        id: Date.now(),
        name: planName.trim(),
        price: Number(planPrice) || 0,
        currency: planCurrency,
        cycle: planCycle,
        features,
        trialDays: Number(planTrialDays) || 0,
        maxUsers: Number(planMaxUsers) || 0,
        storageGB: Number(planStorageGB) || 0,
      };
      setPlans((prev) => [...prev, newPlan]);
      alert("Plan added!");
    }
    setShowPlanModal(false);
  };

  const deletePlan = (id: number) => {
    if (!confirm("Delete this plan?")) return;
    // if deleting current plan, prevent or move current to another
    if (id === currentPlanId) {
      alert("You cannot delete the active plan. Please switch plans first.");
      return;
    }
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const switchPlan = (plan: Plan) => {
    // Simulate upgrade/downgrade flow
    if (!confirm(`Switch to ${plan.name} ${plan.currency}${plan.price}/${plan.cycle}?`)) {
      return;
    }
    setCurrentPlanId(plan.id);
    setCurrentPlanStart(todayISO);
    // set next billing date based on cycle
    if (plan.cycle === "Monthly") {
      setNextBillingDate(addDays(todayISO, 30));
    } else {
      setNextBillingDate(addYears(todayISO, 1));
    }
    alert(`You are now on the ${plan.name} plan.`);
  };

  const viewInvoice = (inv: Invoice) => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
        <head><title>${inv.number}</title></head>
        <body style="font-family: Arial, sans-serif; padding: 24px;">
          <h2>Invoice ${inv.number}</h2>
          <p><strong>Date:</strong> ${inv.date}</p>
          <p><strong>Amount:</strong> ${inv.currency}${inv.amount}</p>
          <p><strong>Status:</strong> ${inv.status}</p>
          <hr />
          <p>This is a simulated invoice view for demo purposes.</p>
        </body>
      </html>
    `);
    win.document.close();
  };

  const downloadInvoice = (inv: Invoice) => {
    // Create a simple text invoice and trigger download
    const content = `Invoice ${inv.number}\n\nDate: ${inv.date}\nAmount: ${inv.currency}${inv.amount}\nStatus: ${inv.status}\n\n(Generated for demo)`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${inv.number}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const scheduleAccountClosure = () => {
    if (!confirm("This will schedule your account for closure. Continue?")) {
      return;
    }
    alert("Your account has been scheduled for closure. A confirmation email will be sent.");
  };

  const upcomingAmount = useMemo(() => {
    return currentPlan ? `${currentPlan.currency}${currentPlan.price}` : "-";
  }, [currentPlan]);

  return (
    <>
      <Head>
        <title>Settings — Workspace</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div
        className="min-h-screen bg-gray-50 text-gray-900 p-6"
        style={{
          fontFamily:
            'Lexend, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
          ...themeStyleVars,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
        >
          {/* ---------- Tabs ---------- */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab("roles")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "roles"
                  ? "text-[#0A236E] border-b-2 border-[#0A236E]"
                  : "text-gray-600 hover:text-[#0A236E]"
              }`}
              style={
                activeTab === "roles"
                  ? { color: "var(--primary)", borderColor: "var(--primary)" }
                  : undefined
              }
            >
              Roles & Access
            </button>
            <button
              onClick={() => setActiveTab("auth")}
              className={`ml-4 px-4 py-2 text-sm font-medium ${
                activeTab === "auth"
                  ? "text-[#0A236E] border-b-2 border-[#0A236E]"
                  : "text-gray-600 hover:text-[#0A236E]"
              }`}
              style={
                activeTab === "auth"
                  ? { color: "var(--primary)", borderColor: "var(--primary)" }
                  : undefined
              }
            >
              Authentication Settings
            </button>
            <button
              onClick={() => setActiveTab("account")}
              className={`ml-4 px-4 py-2 text-sm font-medium ${
                activeTab === "account"
                  ? "text-[#0A236E] border-b-2 border-[#0A236E]"
                  : "text-gray-600 hover:text-[#0A236E]"
              }`}
              style={
                activeTab === "account"
                  ? { color: "var(--primary)", borderColor: "var(--primary)" }
                  : undefined
              }
            >
              Account Settings
            </button>
            <button
              onClick={() => setActiveTab("billing")}
              className={`ml-4 px-4 py-2 text-sm font-medium ${
                activeTab === "billing"
                  ? "text-[#0A236E] border-b-2 border-[#0A236E]"
                  : "text-gray-600 hover:text-[#0A236E]"
              }`}
              style={
                activeTab === "billing"
                  ? { color: "var(--primary)", borderColor: "var(--primary)" }
                  : undefined
              }
            >
              Billing & Payments
            </button>
          </div>

          {/* ---------- Roles & Access Tab ---------- */}
          {activeTab === "roles" && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Role & Access Management</h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter new designation"
                    value={newDesignation}
                    onChange={(e) => setNewDesignation(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <button
                    onClick={handleAddRole}
                    className="flex items-center gap-1 px-4 py-2 bg-[#0A236E] text-white rounded-md text-sm"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add Role
                  </button>
                </div>
              </div>

              {/* Role List */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    onClick={() => {
                      setSelectedRole(role);
                      setEditName(role.designation);
                    }}
                    className={`p-4 border rounded-xl cursor-pointer ${
                      selectedRole?.id === role.id
                        ? "border-[#0A236E] bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                    style={
                      selectedRole?.id === role.id
                        ? { borderColor: "var(--primary)" }
                        : undefined
                    }
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">{role.designation}</h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRole(role.id);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {Object.keys(role.permissions).length} modules
                    </p>
                  </div>
                ))}
              </div>

              {/* Role Permission Editor */}
              {selectedRole ? (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">Edit Role:</h3>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm w-48"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCloseEditor}
                        className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md text-sm"
                      >
                        <X className="w-4 h-4" />
                        Close
                      </button>
                      <button
                        onClick={() => handleSaveRole(selectedRole.id)}
                        className="flex items-center gap-1 px-4 py-2 bg-[#0A236E] text-white rounded-md text-sm"
                        style={{ backgroundColor: "var(--primary)" }}
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 rounded-lg">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="text-left px-4 py-2 text-sm font-medium">
                            Module
                          </th>
                          <th className="text-center px-2 py-2 text-sm font-medium">
                            Create
                          </th>
                          <th className="text-center px-2 py-2 text-sm font-medium">
                            Update
                          </th>
                          <th className="text-center px-2 py-2 text-sm font-medium">
                            Delete
                          </th>
                          <th className="text-center px-2 py-2 text-sm font-medium">
                            View
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {MODULES.map((mod) => (
                          <tr key={mod} className="border-t">
                            <td className="px-4 py-2 text-sm font-medium">
                              {mod}
                            </td>
                            {["create", "update", "delete", "view"].map(
                              (action) => (
                                <td
                                  key={action}
                                  className="text-center px-2 py-2 text-sm"
                                >
                                  <input
                                    type="checkbox"
                                    checked={
                                      selectedRole.permissions[mod][
                                        action as keyof Permission
                                      ]
                                    }
                                    onChange={() =>
                                      togglePermission(
                                        selectedRole.id,
                                        mod,
                                        action as keyof Permission
                                      )
                                    }
                                  />
                                </td>
                              )
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              ) : (
                <div className="text-gray-500 text-sm text-center mt-4">
                  Select a role to edit permissions.
                </div>
              )}
            </>
          )}

          {/* ---------- Authentication Settings Tab ---------- */}
          {activeTab === "auth" && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold mb-2">
                Authentication Settings
              </h2>

              {/* Sign In Section */}
              <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Sign In Form</h3>
                  <button
                    onClick={() => openFieldModal("signin")}
                    className="flex items-center gap-1 px-3 py-2 bg-[#0A236E] text-white rounded-md text-sm"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add Field
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Title</label>
                    <input
                      type="text"
                      value={signinTitle}
                      onChange={(e) => setSigninTitle(e.target.value)}
                      className="w-full mt-1 p-2 border rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Subtitle</label>
                    <input
                      type="text"
                      value={signinSubtitle}
                      onChange={(e) => setSigninSubtitle(e.target.value)}
                      className="w-full mt-1 p-2 border rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Button Label</label>
                    <input
                      type="text"
                      value={signinButton}
                      onChange={(e) => setSigninButton(e.target.value)}
                      className="w-full mt-1 p-2 border rounded-md text-sm"
                    />
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showRememberMe}
                      onChange={() => setShowRememberMe(!showRememberMe)}
                    />
                    Remember Me
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showForgotPassword}
                      onChange={() => setShowForgotPassword(!showForgotPassword)}
                    />
                    Forgot Password
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={enableSocial}
                      onChange={() => setEnableSocial(!enableSocial)}
                    />
                    Enable Social Logins
                  </label>
                </div>

                {/* Sign In Custom Fields */}
                {signinFields.length > 0 && (
                  <div className="mt-5">
                    <div className="text-sm font-medium mb-2">Custom Fields</div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {signinFields.map((f) => (
                        <div
                          key={f.id}
                          className="border bg-white rounded-md p-3 flex items-start justify-between"
                        >
                          <div className="text-sm">
                            <div className="font-medium">
                              {f.label}
                              {f.required && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              Type: {f.type}
                              {f.type === "select" && f.options?.length
                                ? ` • Options: ${f.options.join(", ")}`
                                : ""}
                            </div>
                          </div>
                          <button
                            onClick={() => deleteAuthField("signin", f.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Remove field"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sign Up Section */}
              <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Sign Up Form</h3>
                  <button
                    onClick={() => openFieldModal("signup")}
                    className="flex items-center gap-1 px-3 py-2 bg-[#0A236E] text-white rounded-md text-sm"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add Field
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Title</label>
                    <input
                      type="text"
                      value={signupTitle}
                      onChange={(e) => setSignupTitle(e.target.value)}
                      className="w-full mt-1 p-2 border rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Subtitle</label>
                    <input
                      type="text"
                      value={signupSubtitle}
                      onChange={(e) => setSignupSubtitle(e.target.value)}
                      className="w-full mt-1 p-2 border rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Button Label</label>
                    <input
                      type="text"
                      value={signupButton}
                      onChange={(e) => setSignupButton(e.target.value)}
                      className="w-full mt-1 p-2 border rounded-md text-sm"
                    />
                  </div>

                  {/* Image upload with preview */}
                  <div>
                    <label className="text-xs text-gray-500">
                      Left Image (Signup)
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <label className="flex items-center gap-2 px-3 py-2 bg-white border rounded-md cursor-pointer text-sm">
                        <Upload className="w-4 h-4" />
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                      {signupImage && (
                        <img
                          src={signupImage}
                          alt="Preview"
                          className="w-16 h-16 object-cover rounded-md border"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showTerms}
                      onChange={() => setShowTerms(!showTerms)}
                    />
                    Require Terms & Conditions
                  </label>
                </div>

                {/* Sign Up Custom Fields */}
                {signupFields.length > 0 && (
                  <div className="mt-5">
                    <div className="text-sm font-medium mb-2">Custom Fields</div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {signupFields.map((f) => (
                        <div
                          key={f.id}
                          className="border bg-white rounded-md p-3 flex items-start justify-between"
                        >
                          <div className="text-sm">
                            <div className="font-medium">
                              {f.label}
                              {f.required && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              Type: {f.type}
                              {f.type === "select" && f.options?.length
                                ? ` • Options: ${f.options.join(", ")}`
                                : ""}
                            </div>
                          </div>
                          <button
                            onClick={() => deleteAuthField("signup", f.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Remove field"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveAuthSettings}
                  className="flex items-center gap-1 px-5 py-2 bg-[#0A236E] text-white rounded-md text-sm"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </motion.div>
          )}

          {/* ---------- Account Settings Tab ---------- */}
          {activeTab === "account" && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold mb-2">Account Settings</h2>

              {/* Branding (Logo & Favicon) */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
                  <h3 className="font-semibold mb-3">Logo</h3>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-3 py-2 bg-white border rounded-md cursor-pointer text-sm">
                      <Upload className="w-4 h-4" />
                      Upload Logo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                    </label>
                    {accountLogo && (
                      <>
                        <img
                          src={accountLogo}
                          alt="Logo"
                          className="h-12 object-contain rounded-md border bg-white"
                        />
                        <button
                          onClick={clearLogo}
                          className="text-red-600 border border-red-300 rounded-md px-3 py-2 text-sm"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={saveBranding}
                      className="flex items-center gap-1 px-4 py-2 bg-[#0A236E] text-white rounded-md text-sm"
                      style={{ backgroundColor: "var(--primary)" }}
                    >
                      <Save className="w-4 h-4" />
                      Save Logo
                    </button>
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
                  <h3 className="font-semibold mb-3">Favicon</h3>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-3 py-2 bg-white border rounded-md cursor-pointer text-sm">
                      <Upload className="w-4 h-4" />
                      Upload Favicon
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFaviconUpload}
                      />
                    </label>
                    {accountFavicon && (
                      <>
                        <img
                          src={accountFavicon}
                          alt="Favicon"
                          className="h-8 w-8 object-contain rounded border bg-white"
                        />
                        <button
                          onClick={clearFavicon}
                          className="text-red-600 border border-red-300 rounded-md px-3 py-2 text-sm"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={saveBranding}
                      className="flex items-center gap-1 px-4 py-2 bg-[#0A236E] text-white rounded-md text-sm"
                      style={{ backgroundColor: "var(--primary)" }}
                    >
                      <Save className="w-4 h-4" />
                      Save Favicon
                    </button>
                  </div>
                </div>
              </div>

              {/* Admin Details */}
              <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
                <h3 className="font-semibold mb-3">Admin Details</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Name</label>
                    <input
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full mt-1 p-2 border rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Email</label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full mt-1 p-2 border rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">
                      Change Password (optional)
                    </label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full mt-1 p-2 border rounded-md text-sm"
                      placeholder="New password"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={saveAdminDetails}
                    className="flex items-center gap-1 px-4 py-2 bg-[#0A236E] text-white rounded-md text-sm"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    <Save className="w-4 h-4" />
                    Save Admin
                  </button>
                </div>
              </div>

              {/* Color Scheme */}
              <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
                <h3 className="font-semibold mb-3">Color Scheme</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Primary
                    </label>
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-16 h-10 p-0 border rounded"
                      title="Primary color"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Secondary
                    </label>
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-16 h-10 p-0 border rounded"
                      title="Secondary color"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Accent
                    </label>
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-16 h-10 p-0 border rounded"
                      title="Accent color"
                    />
                  </div>
                </div>

                {/* Live preview panel */}
                <div className="mt-4 grid md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border bg-white">
                    <div className="text-xs text-gray-500 mb-2">Primary</div>
                    <div
                      className="h-10 rounded"
                      style={{ backgroundColor: "var(--primary)" }}
                    />
                  </div>
                  <div className="p-4 rounded-lg border bg-white">
                    <div className="text-xs text-gray-500 mb-2">Secondary</div>
                    <div
                      className="h-10 rounded"
                      style={{ backgroundColor: "var(--secondary)" }}
                    />
                  </div>
                  <div className="p-4 rounded-lg border bg-white">
                    <div className="text-xs text-gray-500 mb-2">Accent</div>
                    <div
                      className="h-10 rounded"
                      style={{ backgroundColor: "var(--accent)" }}
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={applyTheme}
                    className="flex items-center gap-1 px-4 py-2 bg-[#0A236E] text-white rounded-md text-sm"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    <Save className="w-4 h-4" />
                    Apply Colors
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ---------- Billing & Payments Tab ---------- */}
          {activeTab === "billing" && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold mb-2">Billing & Payments</h2>

              {/* Current Plan Overview */}
              <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold">Current Plan</h3>
                </div>
                {currentPlan ? (
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="p-3 rounded border bg-white">
                      <div className="text-gray-500">Plan</div>
                      <div className="font-medium">
                        {currentPlan.name} — {currentPlan.currency}
                        {currentPlan.price}/{currentPlan.cycle}
                      </div>
                    </div>
                    <div className="p-3 rounded border bg-white">
                      <div className="text-gray-500">Started</div>
                      <div className="font-medium">{currentPlanStart}</div>
                    </div>
                    <div className="p-3 rounded border bg-white">
                      <div className="text-gray-500">Next Renewal</div>
                      <div className="font-medium flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" />
                        {nextBillingDate} • {upcomingAmount}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">
                    No active plan selected.
                  </div>
                )}
              </div>

              {/* Plan Manager */}
              <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Plans</h3>
                  <button
                    onClick={openAddPlan}
                    className="flex items-center gap-1 px-3 py-2 bg-[#0A236E] text-white rounded-md text-sm"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add Plan
                  </button>
                </div>

                {plans.length === 0 ? (
                  <div className="text-sm text-gray-500">No plans yet.</div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-4">
                    {plans.map((p) => (
                      <div
                        key={p.id}
                        className={`border rounded-xl p-4 bg-white ${
                          p.id === currentPlanId ? "ring-1 ring-[var(--primary)]" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-sm text-gray-500">{p.cycle}</div>
                            <div className="text-lg font-semibold">
                              {p.name}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {p.currency}
                              {p.price} / {p.cycle}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditPlan(p)}
                              className="p-2 border rounded-md hover:bg-gray-50"
                              title="Edit plan"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deletePlan(p.id)}
                              className="p-2 border rounded-md hover:bg-gray-50 text-red-600"
                              title="Delete plan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <ul className="mt-3 space-y-1 text-sm list-disc pl-5">
                          {p.features.map((f, idx) => (
                            <li key={idx}>{f}</li>
                          ))}
                          {(p.trialDays || 0) > 0 && (
                            <li>Trial: {p.trialDays} days</li>
                          )}
                          {p.maxUsers ? (
                            <li>Max Users: {p.maxUsers}</li>
                          ) : (
                            <li>Max Users: Unlimited</li>
                          )}
                          {p.storageGB ? (
                            <li>Storage: {p.storageGB} GB</li>
                          ) : (
                            <li>Storage: Unlimited</li>
                          )}
                        </ul>

                        <div className="mt-4 flex gap-2">
                          {p.id === currentPlanId ? (
                            <span className="px-3 py-1 text-xs border rounded-md">
                              Current
                            </span>
                          ) : (
                            <button
                              onClick={() => switchPlan(p)}
                              className="px-3 py-2 text-sm text-white rounded-md"
                              style={{ backgroundColor: "var(--primary)" }}
                            >
                              Select Plan
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Invoices */}
              <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
                <h3 className="font-semibold mb-3">Invoices</h3>
                {invoices.length === 0 ? (
                  <div className="text-sm text-gray-500">No invoices yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border bg-white rounded-md">
                      <thead className="bg-gray-100 text-sm">
                        <tr>
                          <th className="text-left px-4 py-2">Invoice #</th>
                          <th className="text-left px-4 py-2">Date</th>
                          <th className="text-left px-4 py-2">Amount</th>
                          <th className="text-left px-4 py-2">Status</th>
                          <th className="text-left px-4 py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {invoices.map((inv) => (
                          <tr key={inv.id} className="border-t">
                            <td className="px-4 py-2">{inv.number}</td>
                            <td className="px-4 py-2">{inv.date}</td>
                            <td className="px-4 py-2">
                              {inv.currency}
                              {inv.amount}
                            </td>
                            <td className="px-4 py-2">{inv.status}</td>
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => viewInvoice(inv)}
                                  className="px-3 py-1 border rounded-md flex items-center gap-1"
                                  title="View"
                                >
                                  <Eye className="w-4 h-4" />
                                  View
                                </button>
                                <button
                                  onClick={() => downloadInvoice(inv)}
                                  className="px-3 py-1 border rounded-md flex items-center gap-1"
                                  title="Download"
                                >
                                  <FileDown className="w-4 h-4" />
                                  Download
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Close Account */}
              <div className="p-5 rounded-xl border border-gray-200 bg-red-50">
                <h3 className="font-semibold mb-2 text-red-700">
                  Close Account
                </h3>
                <p className="text-sm text-red-700/80">
                  This will schedule your account for closure. You can contact
                  support to reverse this within the grace period.
                </p>
                <div className="mt-3">
                  <button
                    onClick={scheduleAccountClosure}
                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-md"
                  >
                    Close Account
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ---------- Field Builder Modal (Auth) ---------- */}
      {showFieldModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeFieldModal}
          />
          {/* Modal */}
          <div className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Add Field — {modalTarget === "signin" ? "Sign In" : "Sign Up"}
              </h3>
              <button
                onClick={closeFieldModal}
                className="text-gray-600 hover:text-gray-800"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Label</label>
                <input
                  type="text"
                  value={fieldLabel}
                  onChange={(e) => setFieldLabel(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md text-sm"
                  placeholder="e.g., Full Name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Type</label>
                  <select
                    value={fieldType}
                    onChange={(e) => setFieldType(e.target.value as FieldType)}
                    className="w-full mt-1 p-2 border rounded-md text-sm"
                  >
                    <option value="text">text</option>
                    <option value="email">email</option>
                    <option value="password">password</option>
                    <option value="number">number</option>
                    <option value="date">date</option>
                    <option value="select">select</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={fieldRequired}
                      onChange={() => setFieldRequired((v) => !v)}
                    />
                    Required
                  </label>
                </div>
              </div>

              {fieldType === "select" && (
                <div>
                  <label className="text-xs text-gray-500">
                    Options (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={fieldOptionsCSV}
                    onChange={(e) => setFieldOptionsCSV(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md text-sm"
                    placeholder="e.g., Admin, Manager, Operator"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={closeFieldModal}
                className="px-4 py-2 border rounded-md text-sm"
              >
                Cancel
              </button>
              <button
                onClick={addAuthField}
                className="flex items-center gap-1 px-4 py-2 bg-[#0A236E] text-white rounded-md text-sm"
                style={{ backgroundColor: "var(--primary)" }}
              >
                <PlusCircle className="w-4 h-4" />
                Add Field
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Plan Modal (Billing) ---------- */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closePlanModal}
          />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-xl shadow-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingPlanId ? "Edit Plan" : "Add Plan"}
              </h3>
              <button
                onClick={closePlanModal}
                className="text-gray-600 hover:text-gray-800"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">Plan Name</label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md text-sm"
                  placeholder="e.g., Pro"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Currency</label>
                <input
                  type="text"
                  value={planCurrency}
                  onChange={(e) => setPlanCurrency(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md text-sm"
                  placeholder="₹ or $"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Price</label>
                <input
                  type="number"
                  value={planPrice}
                  onChange={(e) => setPlanPrice(Number(e.target.value))}
                  className="w-full mt-1 p-2 border rounded-md text-sm"
                  min={0}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Billing Cycle</label>
                <select
                  value={planCycle}
                  onChange={(e) =>
                    setPlanCycle(e.target.value as BillingCycle)
                  }
                  className="w-full mt-1 p-2 border rounded-md text-sm"
                >
                  <option>Monthly</option>
                  <option>Yearly</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-gray-500">
                  Features (comma-separated)
                </label>
                <input
                  type="text"
                  value={planFeaturesCSV}
                  onChange={(e) => setPlanFeaturesCSV(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md text-sm"
                  placeholder="e.g., Advanced analytics, Priority support"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500">Trial Days</label>
                <input
                  type="number"
                  value={planTrialDays}
                  onChange={(e) => setPlanTrialDays(Number(e.target.value))}
                  className="w-full mt-1 p-2 border rounded-md text-sm"
                  min={0}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Max Users (0 = Unlimited)</label>
                <input
                  type="number"
                  value={planMaxUsers}
                  onChange={(e) => setPlanMaxUsers(Number(e.target.value))}
                  className="w-full mt-1 p-2 border rounded-md text-sm"
                  min={0}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Storage (GB, 0 = Unlimited)</label>
                <input
                  type="number"
                  value={planStorageGB}
                  onChange={(e) => setPlanStorageGB(Number(e.target.value))}
                  className="w-full mt-1 p-2 border rounded-md text-sm"
                  min={0}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={closePlanModal}
                className="px-4 py-2 border rounded-md text-sm"
              >
                Cancel
              </button>
              <button
                onClick={savePlanFromModal}
                className="flex items-center gap-1 px-4 py-2 bg-[#0A236E] text-white rounded-md text-sm"
                style={{ backgroundColor: "var(--primary)" }}
              >
                <Save className="w-4 h-4" />
                Save Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
