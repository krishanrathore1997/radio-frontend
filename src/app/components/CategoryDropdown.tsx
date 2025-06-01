"use client";
import useSWR from "swr";
import Select from "react-select";
import { useEffect, useState } from "react";
import fetcher from "@/app/service/fetcher";
import Category from "../endpoint/category";

interface OptionType {
  value: number | null;
  label: string;
}

interface CategoryType {
  id: number;
  name: string;
}

interface CategoryResponse {
  message: string;
  category: CategoryType[];
}

interface CategoryDropdownProps {
  onCategoryChange: (categoryId: number | null) => void;
}

export default function CategoryDropdown({ onCategoryChange }: CategoryDropdownProps) {
  const { data } = useSWR<CategoryResponse>(Category.list, fetcher);
  const categories = data?.category ?? [];

  const [selectedCategory, setSelectedCategory] = useState<OptionType | null>(null);

  const categoryOptions: OptionType[] = [
    { value: null, label: "All" },
    ...categories.map(({ id, name }) => ({
      value: id,
      label: name,
    })),
  ];

  useEffect(() => {
    if (!selectedCategory) {
      setSelectedCategory({ value: null, label: "All" });
      onCategoryChange(null); // Default to "All"
    }
  }, [categories, selectedCategory, onCategoryChange]);

  const handleChange = (option: OptionType | null) => {
    setSelectedCategory(option);
    onCategoryChange(option?.value ?? null);
  };

  return (
    <div className="relative w-full max-w-xs mx-auto">
      <Select
        options={categoryOptions}
        value={selectedCategory}
        onChange={handleChange}
        className="w-full p-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 ease-in-out"
        placeholder="Select a category"
        isDisabled={categoryOptions.length === 0}
        styles={{
          control: (base) => ({
            ...base,
            borderColor: 'transparent',
            boxShadow: 'none',
            '&:hover': {
              borderColor: 'transparent',
            },
            '&:focus': {
              borderColor: 'transparent',
            },
            '&:disabled': {
              backgroundColor: '#e5e7eb', // Tailwind grey-300
              cursor: 'not-allowed',
            },
          }),
          menu: (base) => ({
            ...base,
            zIndex: 9999, // Bring the dropdown above other content
          })
        }}
      />
      {categoryOptions.length === 0 && (
        <p className="text-gray-500 text-sm mt-2 text-center">
          No categories available
        </p>
      )}
    </div>
  );
}