'use client';
import React, { useState } from "react";
import CategoryDropdown from "./CategoryDropdown";

interface SearchBarProps {
  onSearch: (term: string, categoryId: number | null) => void;
  onReset: () => void;
  initialSearch?: string;
}

export default function SearchBar({ onSearch, onReset, initialSearch = "" }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Handle search
  const handleSearch = () => {
    onSearch(searchTerm.trim(), selectedCategoryId); // Pass the search term and selected category ID to the parent
  };

  // Handle category change
  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId); // Update the selected category
  };

  // Handle reset
  const handleReset = () => {
    setSearchTerm(""); // Clear the search term
    setSelectedCategoryId(null); // Clear selected category
    onReset(); // Reset the parent component's state
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)} // Update the search term on input change
        className="border px-3 py-2 rounded w-64 text-black bg-white"
      />
      
      {/* Category Dropdown */}
      <CategoryDropdown onCategoryChange={handleCategoryChange} />

      <button
        onClick={handleSearch} // Trigger the search action
        className="bg-black text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Search
      </button>

      <button
        onClick={handleReset} // Trigger the reset action
        className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
      >
        Reset
      </button>
    </div>
  );
}
