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
    <header className="sticky top-0 z-50 bg-white border-b border-[#f0f3f4] w-full">
      <div className="px-4 md:px-10 py-3 flex items-center justify-between max-w-[960px] mx-auto w-full">
        <div className="flex items-center gap-4 text-[#111518]">
          <div className="h-8 w-8 text-emerald-500 flex items-center justify-center rounded-lg bg-emerald-50">
            <span className="material-symbols-outlined text-2xl">electric_bolt</span>
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-[#111518] text-lg font-bold leading-tight tracking-[-0.015em]">{title || 'Taller Charli'}</h2>
            {typeof step === 'number' && <span className="text-sm text-gray-500">Paso {step}</span>}
          </div>
        </div>
        <button
          onClick={handleBack}
          className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-transparent hover:bg-slate-100 text-[#111518] text-sm font-bold leading-normal tracking-[0.015em] border border-transparent hover:border-slate-200 transition-colors"
        >
          <span className="truncate">Volver</span>
        </button>
      </div>
    </header>
  );
};