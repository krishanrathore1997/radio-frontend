'use client';
import React from "react";

interface UploadProgressProps {
  uploadProgress: {
    id: number;
    title: string;
    progress: number;
  }[];
}

const UploadProgress: React.FC<UploadProgressProps> = ({ uploadProgress }) => {
  if (uploadProgress.length === 0) return null;

  return (
    <div className="mt-8 px-6">
      <h3 className="text-lg font-semibold mb-4 text-red-500">Uploading Files</h3>
      <ul className="space-y-4 max-h-40 overflow-y-auto">
        {uploadProgress.map((track) => (
          <li key={track.id} className="bg-gray-100 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-gray-800">{track.title}</span>
              <span className="text-sm text-gray-600">{track.progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-300 rounded">
              <div
                className="h-2 bg-red-500 rounded transition-all duration-200"
                style={{ width: `${track.progress}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UploadProgress;
