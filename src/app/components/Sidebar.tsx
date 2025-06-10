"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MdDashboard,
  MdLibraryMusic,
  MdSchedule,
  MdLiveTv,
  MdCategory,
  MdQueueMusic,
  MdLogout,
} from "react-icons/md";
import { FaChartLine, FaTags } from "react-icons/fa";
import API from "../service/api";
import auth from "../endpoint/auth";

const menuItems = [
  { label: "Dashboard", icon: MdDashboard, href: "/admin/dashboard" },
  { label: "Live", icon: MdLiveTv, href: "/live" },
  { label: "Library", icon: MdLibraryMusic, href: "/admin" },
  { label: "Categories", icon: MdCategory, href: "/admin/category" },
  { label: "Brands", icon: FaTags, href: "/admin/brand" },
  { label: "Playlists", icon: MdQueueMusic, href: "/admin/playlist" },
  { label: "Scheduling", icon: MdSchedule, href: "/admin/schedule" },
  { label: "Statistics", icon: FaChartLine, href: "/statistics" },
];

export default function Sidebar() {
  const router = useRouter();

  const handleLogout = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await API.post(auth.logout);

    if (response.status === 200) {
      localStorage.removeItem("token");
      router.push("/login");
    }else {
      console.error("Logout failed");
    }
  } catch (error) {
    console.error("An error occurred during logout", error);
  }
};


  return (
    <aside className="w-64 min-h-screen mx-h-screen bg-black text-white flex flex-col shadow-lg">
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
              prefetch={true}
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

      {/* Logout Button */}
      <div className="p-2">
        <button
          onClick={handleLogout}
          className="block w-full text-center bg-white text-black font-semibold py-2 rounded-lg hover:bg-gray-200 transition-all duration-200"
        >
         Logout 
        </button>
      </div>
    </aside>
  );
}
