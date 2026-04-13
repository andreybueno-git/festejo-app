import React from 'react';
import { getVersiculoDoDia } from '../data/versiculos';

interface VerseBubbleProps {
  diaFestejo: number;
}

export const VerseBubble: React.FC<VerseBubbleProps> = ({ diaFestejo }) => {
  const versiculo = getVersiculoDoDia(diaFestejo);

  return (
    <div className="flex items-start gap-3 animate-fade-in">
      {/* Avatar */}
      <div className="w-10 h-10 flex-shrink-0 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/30 to-yellow-600/15 rounded-full border border-yellow-500/40 shadow-lg shadow-yellow-500/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl">✝️</span>
        </div>
      </div>
      
      {/* Balão */}
      <div className="flex-1 relative">
        {/* Glass bubble */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/12 to-white/6 backdrop-blur-[30px] rounded-tl-[4px] rounded-tr-[18px] rounded-br-[18px] rounded-bl-[18px] border border-white/15 shadow-lg shadow-black/12" />
        
        {/* Setinha do balão */}
        <div className="absolute left-[-6px] top-3 w-3 h-3 bg-gradient-to-br from-white/12 to-transparent border-l border-b border-white/15 transform rotate-45" />
        
        {/* Conteúdo */}
        <div className="relative z-10 p-4">
          <p className="text-yellow-300/90 text-[11px] font-semibold tracking-wider uppercase mb-2">
            Dia {diaFestejo} do Festejo
          </p>
          <p className="text-white text-sm font-normal leading-relaxed italic mb-2">
            "{versiculo.texto}"
          </p>
          <p className="text-white/50 text-xs text-right">
            {versiculo.referencia}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerseBubble;
