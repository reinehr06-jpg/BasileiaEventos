"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

export default function RegisterPage() {
  const [form, setForm] = useState({
    accountName: "",
    accountSlug: "",
    email: "",
    password: "",
    name: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await authApi.register(form);
      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl mb-4">Register</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input placeholder="Account Name" value={form.accountName} onChange={(e) => setForm({...form, accountName: e.target.value})} className="w-full p-2 mb-4 border rounded" required />
        <input placeholder="Account Slug" value={form.accountSlug} onChange={(e) => setForm({...form, accountSlug: e.target.value})} className="w-full p-2 mb-4 border rounded" required />
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full p-2 mb-4 border rounded" required />
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full p-2 mb-4 border rounded" required />
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="w-full p-2 mb-4 border rounded" required />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Register</button>
        <p className="mt-4 text-center">Already have an account? <a href="/login" className="text-blue-600">Login</a></p>
      </form>
    </div>
  );
}
