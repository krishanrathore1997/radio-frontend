"use client";

import { useState } from "react";
import { FiTrash2, FiEdit } from "react-icons/fi";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import DataTable, { TableColumn } from "react-data-table-component";
import { useRouter } from "next/navigation";

import API from "@/app/service/api";
import ScheduleRoutes from "@/app/endpoint/schedule";
import useSchedule from "../hooks/useSchedule";
import { EyeIcon } from "lucide-react";

interface Schedule {
  id: number;
  playlist_id: number;
  playlist_name: string;
  schedule_date: string;
  start_time: string;
  end_time: string;
}

export default function AllSchedule() {
  const { scheduleList, isLoading, mutate } = useSchedule(); // ✅ Fixed variable name
  const MySwal = withReactContent(Swal);
  const router = useRouter();
console.log("Schedule List:", scheduleList);
  const handleDelete = async (id: number) => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the schedule.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await API.delete(`${ScheduleRoutes.delete}/${id}`);
        toast.success("Schedule deleted successfully!");
        mutate();
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete schedule.");
      }
    }
  };

  const columns: TableColumn<Schedule>[] = [
    {
      name: "SR",
      cell: (_row, index) => index + 1,
      width: "70px",
    },
    {
      name: "Playlist Name",
      selector: (row) => row.playlist_name || "-",
      sortable: true,
    },
    {
      name: "Date",
      selector: (row) => row.schedule_date,
      sortable: true,
        width: "120px",
    },
    {
      name: "Start Time",
      selector: (row) => row.start_time,
      sortable: true,
      width: "100px",
    },
    {
      name: "End Time",
      selector: (row) => row.end_time,
      sortable: true,
      width: "100px",
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push(`/admin/schedule/${row.id}`)}
            className="p-2 rounded-full text-indigo-600 hover:bg-indigo-100 transition"
            aria-label="Edit schedule"
          >
            <FiEdit size={18} />
          </button>
          <button
            onClick={() => router.push(`/admin/playlist/${row.playlist_id}/view`)}   
            className="p-2 rounded-full text-indigo-600 hover:bg-indigo-100 transition"
            aria-label="View schedule"
          >
            <EyeIcon size={18} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-2 rounded-full text-red-600 hover:bg-red-100 transition"
            aria-label="Delete schedule"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      ),
      width: "150px",
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="border border-slate-100 rounded-lg overflow-hidden shadow-sm">
        <DataTable
          columns={columns}
          data={scheduleList}
          progressPending={isLoading}
          pagination
          noDataComponent="No schedules found."
        />
      </div>
    </div>
  );
}
