import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Admin pages
import { AdminLogin, AdminDashboard, AdminEstoque, AdminBarracas, AdminConfig } from './pages/admin';

// Barraca pages
import { BarracaLogin, BarracaHome, BarracaNovoPedido } from './pages/barraca';

// Componente para rotas protegidas do Admin
function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { usuario, loading, isAdmin } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!usuario || !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

// Componente para rotas protegidas da Barraca
function ProtectedBarracaRoute({ children }: { children: React.ReactNode }) {
  const { usuario, loading, isBarraca } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!usuario || !isBarraca) {
    return <Navigate to="/barraca/login" replace />;
  }
  
  return <>{children}</>;
}

// Tela de carregamento
function LoadingScreen() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 relative">
          <div 
            className="absolute inset-0 rounded-[20px] animate-pulse"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl">⛪</span>
          </div>
        </div>
        <p className="text-white/60 text-sm">Carregando...</p>
      </div>
    </div>
  );
}

// Componente de roteamento principal
function AppRoutes() {
  return (
    <Routes>
      {/* Admin routes */}
      <Route path="/" element={<AdminLogin />} />
      <Route 
        path="/admin" 
        element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        } 
      />
      <Route 
        path="/admin/estoque" 
        element={
          <ProtectedAdminRoute>
            <AdminEstoque />
          </ProtectedAdminRoute>
        } 
      />
      <Route 
        path="/admin/barracas" 
        element={
          <ProtectedAdminRoute>
            <AdminBarracas />
          </ProtectedAdminRoute>
        } 
      />
      <Route 
        path="/admin/config" 
        element={
          <ProtectedAdminRoute>
            <AdminConfig />
          </ProtectedAdminRoute>
        } 
      />

      {/* Barraca routes */}
      <Route path="/barraca/login" element={<BarracaLogin />} />
      <Route 
        path="/barraca" 
        element={
          <ProtectedBarracaRoute>
            <BarracaHome />
          </ProtectedBarracaRoute>
        } 
      />
      <Route 
        path="/barraca/novo-pedido" 
        element={
          <ProtectedBarracaRoute>
            <BarracaNovoPedido />
          </ProtectedBarracaRoute>
        } 
      />
      <Route 
        path="/barraca/pedidos" 
        element={
          <ProtectedBarracaRoute>
            <BarracaHome />
          </ProtectedBarracaRoute>
        } 
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// App principal
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="h-screen w-screen overflow-hidden">
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
