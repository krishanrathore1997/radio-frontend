// app/admin/layout.tsx
"use client";
import type { ReactNode } from "react";
import Sidebar from "../components/Sidebar";
import { Toaster } from "react-hot-toast";
import useAuth from "../hooks/useAuth";

export default function AdminLayout({ children }: { children: ReactNode  }) {
  useAuth();
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar />
      <Toaster position="top-right" />
      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
