# Componentes Compartilhados

Pasta: `src/components/`

## Layout

Wrapper root de cada tela. Aplica o background (foto do festejo com overlay escuro) e safe-area do iOS.

Props principais: `children`.

Lê `fotoFundo` do [[Services#AuthContext|AuthContext]].

## GlassCard

Card com efeito glass morphism. Usado em quase todas as telas.

Variantes:
- default — fundo translúcido branco
- `warning` — tint amarelo, borda amarela (alertas)
- `success` — tint verde (confirmações)
- `info` — tint azul

Props: `variant?`, `className?`, `onClick?`.

## BottomNav

Barra inferior com ícones de navegação.

Props: `tipo: 'admin' | 'barraca'`.

- `admin` → Dashboard, Barracas, Estoque, Config
- `barraca` → Home, Novo Pedido, Histórico, Perfil

## Veja também
- [[03 - Estrutura de Pastas]]
- [[Módulo Admin/Admin - Visão Geral]]
- [[Módulo Barraca/Barraca - Visão Geral]]
