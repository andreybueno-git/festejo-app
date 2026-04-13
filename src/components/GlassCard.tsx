import { ReactNode, CSSProperties } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary';
  highlight?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}

export const GlassCard = ({ 
  children, 
  className = '', 
  variant = 'default',
  highlight = false,
  onClick,
  style
}: GlassCardProps) => {
  const variantStyles = {
    default: 'border-white/15',
    success: 'border-green-500/25',
    warning: 'border-yellow-500/25',
    danger: 'border-red-500/25',
    info: 'border-blue-500/30',
    primary: 'border-blue-400/30',
  };

  const bgVariants = {
    default: 'from-white/10 via-white/[0.04] to-white/[0.06]',
    success: 'from-green-500/15 via-green-500/5 to-green-500/10',
    warning: 'from-yellow-500/15 via-yellow-400/5 to-yellow-500/8',
    danger: 'from-red-500/15 via-red-500/5 to-red-500/8',
    info: 'from-blue-500/20 via-blue-600/10 to-blue-500/15',
    primary: 'from-blue-500/20 via-blue-600/10 to-blue-500/15',
  };

  return (
    <div 
      className={`
        relative rounded-[22px] overflow-hidden
        ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}
        ${className}
      `}
      onClick={onClick}
      style={style}
    >
      {/* Glass background */}
      <div className={`
        absolute inset-0 
        bg-gradient-to-br ${bgVariants[variant]}
        backdrop-blur-[30px]
        border ${variantStyles[variant]}
        rounded-[22px]
        shadow-lg shadow-black/10
      `} />
      
      {/* Top highlight */}
      {highlight && (
        <div className="absolute top-[1px] left-5 right-5 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full" />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;
