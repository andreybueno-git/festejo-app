import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

interface LayoutProps {
  children: ReactNode;
  tipo?: 'admin' | 'barraca';
  showNav?: boolean;
}

export function Layout({ children, tipo, showNav = false }: LayoutProps) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Ambient lights */}
      <div className="ambient-light ambient-light-1" />
      <div className="ambient-light ambient-light-2" />
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        <div className="flex-1 overflow-auto">
          {children}
        </div>
        
        {showNav && tipo && (
          <BottomNav tipo={tipo} />
        )}
      </div>
    </div>
  );
}
