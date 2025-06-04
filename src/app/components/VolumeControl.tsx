'use client';

import { FaVolumeUp, FaVolumeMute, FaVolumeDown } from "react-icons/fa";
import * as Slider from "@radix-ui/react-slider";

interface VolumeControlProps {
  volume: number; // 0 to 100
  isMuted: boolean;
  onVolumeChange: (value: number[]) => void;
  onToggleMute: () => void;
}

export function VolumeControl({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
}: VolumeControlProps) {
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <FaVolumeMute className="w-5 h-5" />;
    if (volume < 40) return <FaVolumeDown className="w-5 h-5" />;
    return <FaVolumeUp className="w-5 h-5" />;
  };

  return (
    <div className="w-[240px] bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-xl border border-white/20">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMute}
          className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-transform hover:scale-110"
        >
          {getVolumeIcon()}
        </button>

        <div className="flex-1">
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            value={[volume]}
            onValueChange={onVolumeChange}
            max={100}
            step={1}
          >
            <Slider.Track className="bg-white/20 relative grow rounded-full h-2">
              <Slider.Range className="absolute bg-gradient-to-r from-purple-400 to-pink-400 h-full rounded-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-purple-400 rounded-full shadow hover:scale-125 transition-transform" />
          </Slider.Root>
        </div>

        <div className="w-10 text-right">
          <span className="text-sm text-white/80">{volume}%</span>
        </div>
      </div>
    </div>
  );
}
