# BarracaLogin

Arquivo: `src/pages/barraca/BarracaLogin.tsx`
Rota: `/barraca/login`

## Fluxo

1. User digita **código de acesso** (`config/geral.codigoAcesso`, ex: `FESTEJO2026`).
2. Se bate, aparece form:
   - Input de nome do responsável
   - Select de barracas ativas
3. Chama `loginBarraca(nome, barracaId)` do [[Services#AuthContext|AuthContext]]:
   - Cria `Usuario` com `tipo: 'responsavel'`
   - `updateDoc(barracas/{id}, { responsavelNome, responsavelId, responsavelLoginEm })`
   - Persiste em localStorage
   - Redireciona pra `/barraca`

## Por que grava `responsavelNome` no doc da barraca

Pra [[Módulo Admin/AdminBarracas|painel do admin]] mostrar quem está logado em cada barraca. Ver [[Bugs & Fixes#Responsável não aparecia]].

## Veja também
- [[Firebase/Auth Flow]]
- [[Modelo de Dados#Barraca]]
