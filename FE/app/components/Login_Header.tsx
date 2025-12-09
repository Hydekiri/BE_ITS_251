'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Login_Header() {
  const router = useRouter();

  return (
    <header className="bg-linear-to-r from-[#235697] to-[#1BA7D9] px-6 lg:px-18 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 relative">
          <Image 
            src="/ITS_LOGO1.png" 
            alt="ITS Logo" 
            fill
            sizes="(max-width: 640px) 100vw, 
                  (max-width: 768px) 50vw, 
                  33vw"
            className="object-contain"
            priority
          />
        </div>
        <span className="text-white font-bold text-xl sm:text-2xl">ITS</span>
      </div>
      <button
        onClick={() => router.back()}
        className="
          border-2 border-white text-white 
          px-4 py-1.5 
          sm:px-6 sm:py-2 
          lg:px-8 lg:py-2 
          rounded-2xl font-semibold 
          hover:bg-white hover:text-[#235697] 
          transition
          cursor-pointer
        "
      >
        &lt; Quay lại
      </button>
    </header>
  );
}