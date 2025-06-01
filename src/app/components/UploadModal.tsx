"use client";
import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import useSWR from "swr";
import Select from "react-select";
import fetcher from "@/app/service/fetcher";
import Category from "../endpoint/category";

interface UploadModalProps {
  onDrop: (files: File[], categoryId: number | null) => void;
  onClose: () => void;
}

interface CategoryType {
  id: number;
  name: string;
}

interface CategoryResponse {
  message: string;
  category: CategoryType[];
}

interface OptionType {
  value: number | string;
  label: string;
  isDisabled?: boolean;
}

const UploadModal: React.FC<UploadModalProps> = ({ onDrop, onClose }) => {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => onDrop(acceptedFiles, Number(selectedCategory?.value) || null),
  });
  const { data, error, isLoading } = useSWR<CategoryResponse>(Category.list, fetcher);

  const [selectedCategory, setSelectedCategory] = useState<OptionType | null>({
    value: "",
    label: "Select Category",
    isDisabled: true,
  });
  

  const categoryList = data?.category ?? [];

  // Create options for react-select

  const categoryOptions: OptionType[] = [
    { value: "", label: "Select Category", isDisabled: false },
    ...categoryList.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })),
  ];
  

    // Set initial category when data is loaded
  useEffect(() => {
    if (data && data.category.length > 0) {
      const firstCategory = data.category[0];
      setSelectedCategory({
        value: firstCategory.id,
        label: firstCategory.name,
      });
    }
  }, [data]);
  

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl p-8 shadow-2xl overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Upload Songs</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="my-4">
          <label className="block text-gray-700 font-medium mb-2">
            Select Category
          </label>    

          <Select
            options={categoryOptions}
            value={selectedCategory}
            onChange={(option) => setSelectedCategory(option)}
            placeholder="Select a category"
            className="react-select-container text-black border-red-300 rounded-md"
            classNamePrefix="react-select"
            isSearchable
            isOptionDisabled={(option) => option.isDisabled === true}
          />

        </div>
        <div
          {...getRootProps()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-red-500 transition-colors group"
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 group-hover:text-red-500 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-xl text-gray-600">
              Drag and drop files here, or{" "}
              <span className="text-red-500 font-semibold">browse</span>
            </p>
            <p className="text-sm text-gray-500">Supported formats: MP3, WAV, FLAC</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
