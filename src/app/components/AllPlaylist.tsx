"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiEye, FiTrash2, FiEdit } from "react-icons/fi";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import DataTable, { TableColumn } from "react-data-table-component";

import API from "@/app/service/api";
import PlaylistRoutes from "@/app/endpoint/playlist";

import usePlaylist from "../hooks/usePlaylist";
import PlaylistView from "./PlaylistView";

interface PlaylistProps {
  id: number;
  name: string;
  Brand?: string;
  songs: [];
}

export default function AllPlaylist() {
  const { playlistList, isLoading, isError, mutate } = usePlaylist();
  const MySwal = withReactContent(Swal);
  const router = useRouter();

  const [selectedPlaylist, setSelectedPlaylist] = useState<PlaylistProps | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const handleDelete = async (id: number) => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the playlist.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await API.delete(`${PlaylistRoutes.delete}/${id}`);
        toast.success("Playlist deleted successfully!");
        mutate(); // Refresh data
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete playlist.");
      }
    }
  };

  const columns: TableColumn<PlaylistProps>[] = [
    {
      name: "SR",
      cell: (_row, index) => (index !== undefined ? index + 1 : "-"),
      sortable: true,
      width: "80px",
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Brand Name",
      selector: (row) => row.Brand ?? "-",
      sortable: true,
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedPlaylist(row);
              setIsDrawerOpen(false);
            }}
            className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition"
          >
            <FiEye size={18} />
          </button>
          <button
            onClick={() => router.push(`/admin/playlist/${row.id}`)}
            className="p-2 rounded-full text-indigo-600 hover:bg-indigo-100 transition"
          >
            <FiEdit size={18} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-2 rounded-full text-red-600 hover:bg-red-100 transition"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      ),
      width: "140px",
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Playlist</h1>
          <p className="text-slate-600 mt-1">Manage All Playlist</p>
        </div>
        {!isDrawerOpen && (
          <button
            className="bg-black hover:bg-red-600 text-white px-3 py-1 rounded"
            onClick={() => router.push("/admin/playlist/add")}
          >
            Add Playlist
          </button>
        )}
      </div>

      {!isDrawerOpen && (
        <div className="border border-slate-100 rounded-lg overflow-hidden shadow-sm">
          <DataTable
            columns={columns}
            data={playlistList}
            progressPending={isLoading}
            pagination
          />
        </div>
      )}

      {selectedPlaylist && (
        <PlaylistView
          playlist={selectedPlaylist}
          onClose={() => setSelectedPlaylist(null)}
        />
      )}
    </div>
  );
}
