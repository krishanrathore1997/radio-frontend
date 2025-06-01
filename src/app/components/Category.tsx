"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import DataTable from "react-data-table-component";
import { TableColumn } from "react-data-table-component";
import API from "@/app/service/api";
import CategoryRoutes from "@/app/endpoint/category";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import useCategory from "../hooks/useCategory";

interface Category {
  id: number;
  name: string;
}

export default function CategoryPage() {
  const { register, handleSubmit, reset, setValue } = useForm<{ name: string }>();
  const { categoryList, isError, isLoading, mutate } = useCategory();
  const MySwal = withReactContent(Swal);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const openModal = (category?: Category) => {
    if (category) {
      setEditingId(category.id);
      setValue("name", category.name);
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
  };

  const onSubmit = async (data: { name: string }) => {
  try {
    let response;

    if (editingId) {
      response = await API.post(`${CategoryRoutes.update}/${editingId}`, data);
      toast.success(response.data.message || "Category Update Successfully");
    } else {
      response = await API.post(CategoryRoutes.add, data);
      toast.success(response.data.message || "Category Create Successfully");
    }

    // ✅ Dynamically show success message from backend response

    mutate();
    closeModal();
  } catch (error: any) {
    // ✅ Optionally show backend error message if available
    const message = error?.response?.data?.message || "Something went wrong.";
    toast.error(message);
  }
};


  
const deleteCategory = async (id: number) => {
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
      const response = await API.delete(`${CategoryRoutes.delete}/${id}`);
      toast.success(response.data.message || 'Category deleted successfully!');
      mutate();
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || 'Failed to delete category.';
      toast.error(errorMessage);
    }
  }
}

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#f8fafc',
        borderTopWidth: '1px',
        borderTopColor: '#f1f5f9',
      },
    },
    headCells: {
      style: {
        fontSize: '0.875rem',
        color: '#64748b',
        fontWeight: '600',
      },
    },
    rows: {
      style: {
        fontSize: '0.875rem',
        '&:not(:last-of-type)': {
          borderBottom: '1px solid #f1f5f9',
        },
        '&:hover': {
          backgroundColor: '#f8fafc',
        },
      },
    },
  };

  const columns:TableColumn<Category>[]  = [
    { 
      name: "ID", 
      cell: (_row, index) => (index !== undefined ? index + 1 : "-"),
      sortable: true,
      width: '100px'
    },
    { 
      name: "NAME", 
      selector: (row: Category) => row.name, 
      sortable: true 
    },
    {
      name: "ACTIONS",
      cell: (row: Category) => (
        <div className="flex space-x-3">
          <button 
            onClick={() => openModal(row)} 
            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button 
            onClick={() => deleteCategory(row.id)} 
            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
      right: true,
      width: '120px'
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Categories</h1>
          <p className="text-slate-600 mt-1">Manage your product categories</p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </button>
      </div>

      <div className="border border-slate-100 rounded-lg overflow-hidden shadow-sm">
        <DataTable 
          columns={columns} 
          data={categoryList}
          pagination
          customStyles={customStyles}
          paginationPerPage={10}
          paginationComponentOptions={{
            rowsPerPageText: 'Rows per page:',
            rangeSeparatorText: 'of',
          }}
          noDataComponent={
            <div className="p-6 text-center text-slate-500">
              <svg className="w-12 h-12 mx-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="mt-4">No categories found</p>
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
                {editingId ? "Edit Category" : "New Category"}
              </h2>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              <div className="space-y-4">
                <div>

                  <input
                    {...register("name", { required: true })}
                    placeholder="e.g. Electronics"
                    className="w-full px-3 py-2 border text-black border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-slate-400"
                  />
                </div>
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
                  {editingId ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}