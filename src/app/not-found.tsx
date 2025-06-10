'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="bg-[#fdb709] flex items-center justify-center min-h-screen px-4">
      <div className="text-center max-w-md mx-auto">
        <div className="flex items-center justify-center space-x-6">
          <span className="text-white text-[10rem] leading-none select-none drop-shadow-lg">4</span>

          <div className="relative w-40 h-40 flex items-center justify-center drop-shadow-xl">
            <Image
              src="/image-from-rawpixel-id-6338463-png.png"
              alt="Vinyl 404 graphic"
              fill
              className="object-contain"
              priority
            />
          </div>

          <span className="text-white text-[10rem] leading-none select-none drop-shadow-lg">4</span>
        </div>

        <h1 className="text-[#0a1a3a] text-[4rem] mt-6 font-bold select-none drop-shadow-md">ERROR</h1>

        <p className="text-[#f44336] text-[1.75rem] mt-2 font-semibold select-none drop-shadow-sm">
          PAGE NOT FOUND
        </p>

        <button
          onClick={() => router.back()}
          className="mt-8 bg-[#0a1a3a] text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:bg-[#142a5a] transition-colors duration-300"
        >
          Go Back
        </button>
      </div>
    </main>
  );
}
