"use client";
"use client";
import { useState } from "react";
import AllSchedule from "@/app/components/AllSchedule";
import PlaylistScheduleForm from "@/app/components/PlaylistScheduleForm";

export default function SchedulePage() {
  const [showForm, setShowForm] = useState(false);

  const handleToggleForm = () => setShowForm(!showForm);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Schedules</h1>
          <p className="text-slate-600 mt-1">Manage All Scheduled Playlists</p>
        </div>
        <button
          className="bg-black hover:bg-red-600 text-white px-3 py-1 rounded"
          onClick={handleToggleForm}
        >
          {showForm ? "Back" : "Add Schedule"}
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <PlaylistScheduleForm />
        </div>
      )}
{!showForm && (
      <AllSchedule />
)}
    </div>
  );
}

