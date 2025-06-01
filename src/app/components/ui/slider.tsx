'use client';

import * as React from "react";

interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  max: number;
  step: number;
  className?: string;
}

export function Slider({
  value,
  onValueChange,
  max,
  step,
  className = "",
}: SliderProps) {
  return (
    <div className={`relative w-full h-4 flex items-center ${className}`}>
      {/* Background & Gradient Bar */}
      <div className="absolute w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          style={{ width: `${(value[0] / max) * 100}%` }}
        />
      </div>

      {/* Range input on top */}
      <input
        type="range"
        min="0"
        max={max}
        step={step}
        value={value[0]}
        onChange={(e) => onValueChange([Number(e.target.value)])}
        className="w-full h-4 bg-transparent appearance-none z-10 cursor-pointer"
      />

      {/* Thumb & Track styling */}
      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 16px;
          width: 16px;
          margin-top: -7px;
          background: #007bff;
          border-radius: 50%;
          border: none;
          cursor: pointer;
        }

        input[type='range']::-webkit-slider-runnable-track {
          height: 2px;
          background: transparent;
        }

        input[type='range']::-moz-range-thumb {
          height: 16px;
          width: 16px;
          background: #007bff;
          border-radius: 50%;
          border: none;
          cursor: pointer;
        }

        input[type='range']::-moz-range-track {
          height: 2px;
          background: transparent;
        }
      `}</style>
    </div>
  );
}
