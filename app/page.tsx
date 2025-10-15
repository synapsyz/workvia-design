"use client";

import { useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "reset">("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", country: "" });
  const [msg, setMsg] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.email, password: form.password }),
      });

      if (!res.ok) throw new Error("Login failed");
      const data = await res.json();

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      setMsg("Login successful!");
      router.push("/dashboard"); // ✅ redirect after login
    } catch (err) {
      setMsg("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.email,
          password: form.password,
          email: form.email,
          name: form.name,
          country: form.country,
        }),
      });

      if (!res.ok) throw new Error("Signup failed");
      setMsg("Account created successfully!");
    } catch (err) {
      setMsg("Error creating account");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/reset/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });

      if (!res.ok) throw new Error("Reset failed");
      setMsg("Reset link sent!");
    } catch (err) {
      setMsg("Error sending reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="text-center text-2xl font-bold text-blue-600 mb-6">YourLogo</div>

        {/* Tabs */}
        <div className="flex justify-around mb-6 border-b">
          {["login", "signup", "reset"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-2 px-4 font-medium transition ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-blue-500"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Message */}
        {msg && <p className="text-center text-sm text-red-500 mb-2">{msg}</p>}

        {/* Forms */}
        {activeTab === "login" && (
          <LoginForm
            form={form}
            handleInputChange={handleInputChange}
            handleSubmit={handleLogin}
            loading={loading}
          />
        )}
        {activeTab === "signup" && (
          <SignupForm
            form={form}
            handleInputChange={handleInputChange}
            handleSubmit={handleSignup}
            loading={loading}
          />
        )}
        {activeTab === "reset" && (
          <ResetForm
            form={form}
            handleInputChange={handleInputChange}
            handleSubmit={handleReset}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}

/* ------------------- Forms ------------------- */

function LoginForm({
  form,
  handleInputChange,
  handleSubmit,
  loading,
}: {
  form: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}) {
  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold text-center">Sign in to your account</h2>

      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleInputChange}
          placeholder="you@example.com"
          className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleInputChange}
          placeholder="••••••••"
          className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" className="rounded" /> Remember me
        </label>
        <button type="button" className="text-blue-600 hover:underline">
          Forgot?
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Loading..." : "Sign in"}
      </button>

      <Divider />

      <button
        type="button"
        className="w-full flex items-center justify-center gap-2 border py-2 rounded-lg hover:bg-gray-50 transition"
      >
        <FaGoogle /> Sign in with Google
      </button>
    </form>
  );
}

function SignupForm({
  form,
  handleInputChange,
  handleSubmit,
  loading,
}: {
  form: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}) {
  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold text-center">Create your account</h2>

      <div>
        <label className="block text-sm font-medium">Full name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleInputChange}
          placeholder="John Doe"
          className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleInputChange}
          placeholder="you@example.com"
          className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleInputChange}
          placeholder="Create password"
          className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Country</label>
        <select
          name="country"
          value={form.country}
          onChange={handleInputChange}
          className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option>United States</option>
          <option>Canada</option>
          <option>Mexico</option>
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" /> Get emails about product updates
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Loading..." : "Create account"}
      </button>

      <Divider />

      <button
        type="button"
        className="w-full flex items-center justify-center gap-2 border py-2 rounded-lg hover:bg-gray-50 transition"
      >
        <FaGoogle /> Sign up with Google
      </button>
    </form>
  );
}

function ResetForm({
  form,
  handleInputChange,
  handleSubmit,
  loading,
}: {
  form: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}) {
  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold text-center">Reset your password</h2>
      <p className="text-sm text-center text-gray-500">
        Enter your email and we’ll send you a reset link.
      </p>

      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleInputChange}
          placeholder="you@example.com"
          className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Loading..." : "Reset password"}
      </button>
    </form>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-2 my-3">
      <hr className="flex-1 border-gray-300" />
      <span className="text-gray-400 text-sm">or</span>
      <hr className="flex-1 border-gray-300" />
    </div>
  );
}
