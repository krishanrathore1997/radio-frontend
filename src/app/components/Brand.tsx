"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import toast from "react-hot-toast";
import DataTable from "react-data-table-component";
import API from "@/app/service/api";
import BrandRoutes from "@/app/endpoint/brands";
import { useDropzone } from "react-dropzone";
import fetcher from "../service/fetcher";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { TableColumn } from "react-data-table-component";


interface Brand {
  id: number;
  name: string;
  location: string;
  logo: any;
}

interface FormDataType {
  name: string;
  location: string;
  logo: File | null;
}
interface BrandApiResponse {
  message: string;
  brands: Brand[];
}

export default function BrandPage() {
  const { register, handleSubmit, reset, setValue } = useForm<FormDataType>();
  const { data, mutate } = useSWR<BrandApiResponse>(BrandRoutes.list, fetcher);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const MySwal = withReactContent(Swal);
  const handlePreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewLogo(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

const safeBrandList = data?.brands ?? [];
  // Dropzone for image upload
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setValue("logo", file);
      handlePreview(file); // ✅ Call to show preview
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });


  
  const openModal = (brand?: Brand) => {
    if (brand) {
      setEditingId(brand.id);
      setValue("name", brand.name);
      setValue("location", brand.location);
      if (brand.logo) {
        setPreviewLogo(brand.logo); // Assumes logo is a valid URL
      }
    } else {
      setEditingId(null);
      reset();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    reset();
    setPreviewLogo(null);
  };

  const onSubmit = async (data: FormDataType) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("location", data.location);
      if (data.logo) {
        formData.append("logo", data.logo);
      }

      if (editingId) {
        await API.post(`${BrandRoutes.update}/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Brand updated!");
      } else {
        await API.post(BrandRoutes.add, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Brand added!");
      }

      mutate();
      closeModal();
    } catch (error) {
      toast.error("Something went wrong.");
    }
  };

  const deleteBrand = async (id: number) => {
     const result = await MySwal.fire({
    title: 'Are you sure?',
    text: 'You won’t be able to revert this!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
  });

  if (result.isConfirmed) {
      try {
        await API.delete(`${BrandRoutes.delete}/${id}`);
        toast.success("Brand deleted!");
        mutate();
      } catch (err) {
        toast.error("Failed to delete.");
      }
    }
  };

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "#f8fafc",
        borderTopWidth: "1px",
        borderTopColor: "#f1f5f9",
      },
    },
    headCells: {
      style: {
        fontSize: "0.875rem",
        color: "#64748b",
        fontWeight: "600",
      },
    },
    rows: {
      style: {
        fontSize: "0.875rem",
        "&:not(:last-of-type)": {
          borderBottom: "1px solid #f1f5f9",
        },
        "&:hover": {
          backgroundColor: "#f8fafc",
        },
      },
    },
  };

  const columns:TableColumn<Brand>[] = [
    {
      name: "ID",
       cell: (_row, index) => (index !== undefined ? index + 1 : "-"),
      sortable: true,
      width: "100px",
    },
    {
      name: "Logo",
      selector: (row: Brand) => row.logo,
      cell: (row: Brand) => (
        <img src={row.logo} alt={row.name} className="w-10 h-10 rounded" />
      ),
      sortable: true,
    },
    {
      name: "NAME",
      selector: (row: Brand) => row.name,
      sortable: true,
    },
    {
      name: "Location",
      selector: (row: Brand) => row.location,
      sortable: true,
    },
    {
      name: "ACTIONS",
      cell: (row: Brand) => (
        <div className="flex space-x-3">
          <button
            onClick={() => openModal(row)}
            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            ✏️
          </button>
          <button
            onClick={() => deleteBrand(row.id)}
            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            🗑️
          </button>
        </div>
      ),
      right: true,
      width: "120px",
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Brands</h1>
          <p className="text-slate-600 mt-1">Manage your product brands</p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          Add Brand
        </button>
      </div>

      <div className="border border-slate-100 rounded-lg overflow-hidden shadow-sm">
        <DataTable
          columns={columns}
          data={safeBrandList}
          pagination
          customStyles={customStyles}
          paginationPerPage={10}
          paginationComponentOptions={{
            rowsPerPageText: "Rows per page:",
            rangeSeparatorText: "of",
          }}
          noDataComponent={
            <div className="p-6 text-center text-slate-500">
              <p>No brands found</p>
            </div>
          }
        />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingId ? "Edit Brand" : "New Brand"}
              </h2>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="text-red-500">
                    Name
                  </label>
                  <input
                    {...register("name", { required: true })}
                    placeholder="e.g. Honda"
                    className="w-full px-3 py-2 border text-black border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent rounded-lg placeholder-slate-400"
                  />
                </div>
                <div>
                  <label htmlFor="location" className="text-red-500">
                    Location
                  </label>
                  <input
                    {...register("location", { required: true })}
                    placeholder="e.g. Ahmedabad"
                    className="w-full px-3 py-2 border text-black border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent rounded-lg placeholder-slate-400"
                  />
                </div>
                <div
                  {...getRootProps()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-red-500 transition-colors group"
                >
                  <input {...getInputProps()} />
                  <p className="text-gray-600">
                    Drag & drop logo here or click to browse
                  </p>
                  <p className="text-sm text-gray-400">JPG, PNG only</p>
                </div>
                {previewLogo && (
                  <div className="mt-4 text-center">
                    <img
                      src={previewLogo}
                      alt="Logo Preview"
                      className="h-24 object-contain mx-auto"
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  {editingId ? "Save Changes" : "Create Brand"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
