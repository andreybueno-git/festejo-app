interface ChatBubbleProps {
  titulo?: string;
  texto: string;
  referencia: string;
}

export function ChatBubble({ titulo, texto, referencia }: ChatBubbleProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 flex-shrink-0 relative">
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(145deg, rgba(251,191,36,0.3), rgba(245,158,11,0.15))',
            border: '1px solid rgba(251,191,36,0.4)',
            boxShadow: '0 4px 12px rgba(251,191,36,0.2)'
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl">✝️</span>
        </div>
      </div>

      <div className="flex-1 relative">
        <div className="chat-bubble p-4">
          <div 
            className="absolute -left-[6px] top-3 w-3 h-3"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 50%, transparent 50%)',
              borderLeft: '1px solid rgba(255,255,255,0.15)',
              borderBottom: '1px solid rgba(255,255,255,0.15)',
              transform: 'rotate(45deg)'
            }}
          />
          
          {titulo && (
            <p className="text-yellow-300/90 text-[11px] font-semibold uppercase tracking-wider mb-2">
              {titulo}
            </p>
          )}
          <p className="text-white text-sm font-normal italic leading-relaxed mb-2">
            "{texto}"
          </p>
          <p className="text-white/50 text-xs text-right">
            {referencia}
          </p>
        </div>
      </div>
    </div>
  );
}
