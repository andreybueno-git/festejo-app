# UI Primitives Reference

Three components do most of the heavy lifting. Copy these and rename colors/spacing to suit the app.

## Layout

Wrapper for every screen. Applies background + safe-area padding for iOS.

```tsx
// src/components/Layout.tsx
import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { fotoFundo } = useAuth();

  return (
    <div
      className="min-h-screen w-full relative overflow-x-hidden"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(10,22,40,0.85) 0%, rgba(10,22,40,0.95) 100%), url(${fotoFundo || '/default-bg.jpg'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        paddingTop: 'env(safe-area-inset-top, 0)',
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
      }}
    >
      {children}
    </div>
  );
};
```

## GlassCard

Glass-morphism card — used on 90% of UI surfaces. Has semantic variants.

```tsx
// src/components/GlassCard.tsx
import { ReactNode } from 'react';

type Variant = 'default' | 'warning' | 'success' | 'info';

interface Props {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  onClick?: () => void;
}

const variantStyles: Record<Variant, string> = {
  default: 'bg-white/10 border-white/20',
  warning: 'bg-yellow-500/10 border-yellow-500/30',
  success: 'bg-green-500/10 border-green-500/30',
  info: 'bg-blue-500/10 border-blue-500/30',
};

export const GlassCard: React.FC<Props> = ({ children, variant = 'default', className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`backdrop-blur-[20px] border rounded-2xl shadow-lg ${variantStyles[variant]} ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
  >
    {children}
  </div>
);
```

## BottomNav

Fixed bottom tab bar. Drives based on persona (`admin` | custom).

```tsx
// src/components/BottomNav.tsx
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Package, Settings, /* ... */ } from 'lucide-react';

interface Props {
  tipo: 'admin' | 'barraca';  // Rename to match persona
}

const TABS = {
  admin: [
    { path: '/admin', icon: Home, label: 'Início' },
    { path: '/admin/barracas', icon: Package, label: 'Barracas' },
    { path: '/admin/estoque', icon: Package, label: 'Estoque' },
    { path: '/admin/config', icon: Settings, label: 'Config' },
  ],
  barraca: [
    { path: '/barraca', icon: Home, label: 'Início' },
    // ...
  ],
};

export const BottomNav: React.FC<Props> = ({ tipo }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const tabs = TABS[tipo];

  return (
    <div className="flex justify-around items-center bg-black/40 backdrop-blur-[20px] border-t border-white/10 rounded-2xl p-2">
      {tabs.map(({ path, icon: Icon, label }) => {
        const active = pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl ${active ? 'bg-white/10' : ''}`}
          >
            <Icon size={20} className={active ? 'text-white' : 'text-white/50'} />
            <span className={`text-[11px] ${active ? 'text-white' : 'text-white/50'}`}>{label}</span>
          </button>
        );
      })}
    </div>
  );
};
```

## Design direction

Default aesthetic is **dark + glass**. If the user wants something different, lean into the `frontend-design` skill to pick a different direction (editorial, retro, brutalist, etc.) and rebuild the primitives to match.

## Exports

```tsx
// src/components/index.ts
export { Layout } from './Layout';
export { GlassCard } from './GlassCard';
export { BottomNav } from './BottomNav';
```

Let the screens do `import { Layout, GlassCard, BottomNav } from '../components'`.
