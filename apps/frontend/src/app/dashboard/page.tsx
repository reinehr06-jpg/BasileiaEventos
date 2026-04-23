"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
    else {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/accounts/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then(setUser)
        .catch(() => router.push("/login"));
    }
  }, [router]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl mb-4">Dashboard</h1>
      <p>Welcome, {user.users?.[0]?.name || "User"}!</p>
      <p>Account: {user.name}</p>
      <button onClick={() => { localStorage.removeItem("token"); router.push("/login"); }} className="mt-4 bg-red-600 text-white p-2 rounded">Logout</button>
    </div>
  );
}
