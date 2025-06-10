// CoverImage.tsx

'use client';

import React, { useState } from 'react';
import { FaMusic } from 'react-icons/fa';

interface CoverImageProps {
  imageUrl?: string;
  width?: string;    // Tailwind width class
  height?: string;   // Tailwind height class
  rounded?: string;  // Tailwind rounded class
}

const CoverImage: React.FC<CoverImageProps> = ({
  imageUrl,
  width = 'w-10',
  height = 'h-10',
  rounded = 'rounded-md',
}) => {
  const [error, setError] = useState(false);

  if (!imageUrl || error) {
    return (
      <div className={`${width} ${height} flex items-center justify-center bg-gray-200 ${rounded}`}>
        <FaMusic className="text-gray-500 w-5 h-5" />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt="Cover"
      className={`${width} ${height} object-cover ${rounded}`}
      onError={() => setError(true)}
    />
  );
};

export default CoverImage;
