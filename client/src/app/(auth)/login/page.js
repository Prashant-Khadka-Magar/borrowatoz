"use client";

import { useLoginMutation } from "@/state/authApi";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [login, { isLoading }] = useLoginMutation();
  const router = useRouter();
  const handleChange = (e) => {
    setError("");
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login({
        email: form.email,
        password: form.password,
      }).unwrap();

      router.push("/");
    } catch (error) {
      setError(error?.data?.message || "Login failed");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border p-6 shadow-sm">
        <h1 className="text-2xl font-semibold mb-6">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3"
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white rounded-lg px-4 py-3"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
         <span className="mt-5">
          <a href="/register" className="text-blue-500 underline">
            Don&apos;t have an account? Register
          </a>
        </span>
      </div>
    </main>
  );
}
