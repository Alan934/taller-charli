import React from 'react';
import { useNavigate } from 'react-router-dom';

export const BookingHeader: React.FC = () => {
  const navigate = useNavigate();
  return (
    <header class="sticky top-0 z-50 bg-white dark:bg-[#1a2632] border-b border-[#f0f3f4] dark:border-[#2a3844] w-full">
      <div class="px-4 md:px-10 py-3 flex items-center justify-between max-w-[960px] mx-auto w-full">
        <div class="flex items-center gap-4 text-[#111518] dark:text-white">
          <div class="size-8 text-primary flex items-center justify-center rounded-lg bg-primary/10">
            <span class="material-symbols-outlined !text-2xl">electric_bolt</span>
          </div>
          <h2 class="text-[#111518] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
            Taller Charli
          </h2>
        </div>
        <button 
          onClick={() => navigate('/')}
          class="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-[#111518] dark:text-white text-sm font-bold leading-normal tracking-[0.015em] border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
        >
          <span class="truncate">Cancelar</span>
        </button>
      </div>
    </header>
  );
};