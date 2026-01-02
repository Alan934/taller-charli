import React from 'react';

interface LoadingProps {
  label?: string;
  fillViewport?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ label = 'Cargando...', fillViewport = true }) => (
  <div className={`${fillViewport ? 'min-h-screen' : 'h-full'} flex flex-col items-center justify-center gap-3 bg-transparent text-[#111518] dark:text-white`}>
    <div className="relative h-12 w-12">
      <span className="absolute inset-0 rounded-full border-4 border-primary/30 border-t-primary animate-spin" aria-hidden />
      <span className="absolute inset-2 rounded-full bg-primary/30 animate-ping" aria-hidden />
    </div>
    <p className="text-sm font-semibold tracking-wide text-[#617989] dark:text-gray-300">{label}</p>
  </div>
);

export default Loading;
