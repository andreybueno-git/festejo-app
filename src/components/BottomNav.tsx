import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Package, Store, Settings, ClipboardList, LucideIcon } from 'lucide-react';

interface NavItem {
  id: string;
  icon: string | LucideIcon;
  label: string;
  path: string;
}

interface BottomNavProps {
  tipo?: 'admin' | 'barraca';
  items?: NavItem[];
  activeId?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ tipo, items: customItems, activeId }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const adminItems: NavItem[] = [
    { id: 'home', icon: Home, label: 'Início', path: '/admin' },
    { id: 'estoque', icon: Package, label: 'Estoque', path: '/admin/estoque' },
    { id: 'barracas', icon: Store, label: 'Barracas', path: '/admin/barracas' },
    { id: 'config', icon: Settings, label: 'Config', path: '/admin/config' },
  ];

  const barracaItems: NavItem[] = [
    { id: 'home', icon: Home, label: 'Início', path: '/barraca' },
    { id: 'pedidos', icon: ClipboardList, label: 'Pedidos', path: '/barraca/pedidos' },
  ];

  // Usa items customizados se fornecidos, senão usa os padrões
  const items = customItems || (tipo === 'admin' ? adminItems : barracaItems);

  const renderIcon = (icon: string | LucideIcon) => {
    if (typeof icon === 'string') {
      return <span className="text-xl">{icon}</span>;
    }
    const Icon = icon;
    return <Icon size={22} className="text-white" />;
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 pb-safe"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
    >
      <div className="mx-4 mb-4">
        <div className="relative">
          {/* Glass background */}
          <div 
            className="absolute inset-0 rounded-[22px]"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255,255,255,0.12)'
            }}
          />
          
          {/* Navigation items */}
          <div className="relative z-10 px-4 py-3 flex justify-around">
            {items.map((item) => {
              const isActive = activeId ? item.id === activeId : location.pathname === item.path;
              
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`
                    flex flex-col items-center gap-1 px-4 py-2 rounded-[14px] transition-all
                    ${isActive ? 'bg-white/12' : 'opacity-50 hover:opacity-75'}
                  `}
                >
                  {renderIcon(item.icon)}
                  <span className={`text-[11px] ${isActive ? 'text-white font-medium' : 'text-white/70'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
