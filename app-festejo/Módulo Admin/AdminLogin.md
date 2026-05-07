# AdminLogin

Arquivo: `src/pages/admin/AdminLogin.tsx`
Rota: `/admin/login`

## Fluxo

1. User digita senha.
2. Chama `loginAdmin(senha)` do [[Services#AuthContext|AuthContext]].
3. Se bate com `config/geral.senhaAdmin` (ou default `admin123`), redireciona pra `/admin`.

## Componentes de UI

- GlassCard de entrada
- Input de senha (type=password)
- Link "Sou responsável de barraca" → redireciona pra [[Módulo Barraca/BarracaLogin]]

## Veja também
- [[Firebase/Auth Flow]]
