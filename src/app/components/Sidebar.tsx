"use client";
import Link from "next/link";
import { FaChartLine } from "react-icons/fa";
import { MdDashboard, MdLibraryMusic, MdSchedule } from "react-icons/md";

const menuItems = [
  { label: "Dashboard", icon: MdDashboard, href: "/admin/dashboard" },
  { label: "Live", icon: MdLibraryMusic, href: "/live" },
  { label: "Library", icon: MdLibraryMusic, href: "/admin" },
  { label: "Categories", icon: MdLibraryMusic, href: "/admin/category" },
  { label: "Brands", icon: MdLibraryMusic, href: "/admin/brand" },
  { label: "Playlists", icon: MdLibraryMusic, href: "/admin/playlist" },
  { label: "Scheduling", icon: MdSchedule, href: "/admin/schedule" },
  { label: "Statistics", icon: FaChartLine, href: "/statistics" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-black text-white flex flex-col shadow-lg">
      {/* Header */}
      <div className="p-6 text-2xl font-extrabold tracking-wide border-b border-white/20">
        🎧 FM.Land
      </div>

      {/* Menu */}
      <ul className="flex-1 space-y-2 p-4">
        {menuItems.map(({ label, icon: Icon, href }) => (
          <li key={label}>
            <Link
              href={href}
              prefetch={true} // ✅ Ensures prefetching for faster route transitions
              className="flex items-center gap-4 px-4 py-2 rounded-lg hover:bg-white hover:text-black transition-colors duration-200"
            >
              <Icon className="text-xl" />
              <span className="text-base font-medium">{label}</span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="p-4 text-xs text-center text-white/80 border-t border-white/20">
        Powered by <span className="font-semibold">Radio</span>
      </div>
    </aside>
  );
}
