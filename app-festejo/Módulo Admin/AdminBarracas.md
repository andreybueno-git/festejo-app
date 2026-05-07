# AdminBarracas

Arquivo: `src/pages/admin/AdminBarracas.tsx`
Rota: `/admin/barracas`

## O que faz

CRUD de barracas + distribuição de embalagens pra cada uma.

## Features

- Listar barracas ativas
- Adicionar nova barraca (nome + emoji)
- Editar / desativar
- Ver responsável logado na barraca (campo `responsavelNome`)
- Distribuir embalagens (entrega manual do admin)

## Campo `responsavelNome`

Populado quando o responsável faz login em [[Módulo Barraca/BarracaLogin]]. Se aparecer "Sem responsável" é porque ninguém logou ainda nessa barraca (ou o responsável deslogou).

## Veja também
- [[Modelo de Dados#Barraca]]
- [[Firebase/Auth Flow]]
