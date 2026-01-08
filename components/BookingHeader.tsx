import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BookingHeaderProps {
  title?: string;
  step?: number;
  onBack?: () => void;
}

export const BookingHeader: React.FC<BookingHeaderProps> = ({ title, step, onBack }) => {
  const navigate = useNavigate();
  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#1a2632] border-b border-[#e9ecef] dark:border-slate-800 w-full shadow-sm">
      <div className="px-4 md:px-10 py-3 flex items-center justify-between max-w-[1200px] mx-auto w-full">
        <div className="flex items-center gap-4 text-[#111518] dark:text-white">
          <div className="h-9 w-9 text-emerald-600 dark:text-emerald-400 flex items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
            <span className="material-symbols-outlined text-2xl">electric_bolt</span>
          </div>
          <div className="flex flex-col">
            <h2 className="text-[#111518] dark:text-white text-base font-bold leading-tight tracking-[-0.015em]">{title || 'Taller Charli'}</h2>
            {typeof step === 'number' && (
               <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Paso {step} de 3</span>
                  <div className="hidden sm:flex h-1 w-12 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                     <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
                  </div>
               </div>
            )}
          </div>
        </div>
        <button
          onClick={handleBack}
          className="flex min-w-[36px] items-center justify-center rounded-full h-9 w-9 md:w-auto md:px-3 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-[#111518] dark:text-white transition-colors"
          title="Volver"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          <span className="hidden md:inline ml-1 text-sm font-semibold">Volver</span>
        </button>
      </div>
    </header>
  );
};