# 01 — Visão Geral

## O que é

App PWA usado durante o festejo religioso pra organizar a distribuição de embalagens (copos, pratos, marmitas, etc.) entre as barracas. Funciona como ponte entre **administração** (organização do festejo) e **responsáveis de barraca** (voluntários).

## Por que existe

Antes era WhatsApp e papel:
- Responsáveis da barraca precisavam correr atrás do admin pra pedir mais embalagens.
- Admin não tinha visão do estoque em tempo real.
- Fácil perder pedido no meio da bagunça do festejo.

Agora:
- Barraca faz pedido pelo app → push cai no celular do admin na hora.
- Admin vê estoque, pedidos pendentes, alertas de estoque baixo tudo em uma tela.

## Quem usa

- **Admin** — senha única (`admin123` por padrão, configurável). Enxerga tudo.
- **Responsável de barraca** — entra com código de acesso (`FESTEJO2026` padrão) + nome + barraca. Só enxerga a própria barraca.

Ver [[Firebase/Auth Flow]] pra detalhes do fluxo de login.

## Fluxos principais

1. **Pedido de barraca** — [[Módulo Barraca/BarracaNovoPedido]] → cria doc em `pedidos` com `status='pendente'` → Cloud Function [[Firebase/Cloud Functions|notificarPedido]] dispara push pro admin.
2. **Notificação recebida** — admin recebe push + [[Módulo Admin/AdminDashboard|dashboard]] mostra o pedido no sininho via `onSnapshot`.
3. **Conclusão** — admin clica no check → `status='concluido'`.

## Links relacionados
- [[02 - Stack & Arquitetura]]
- [[Modelo de Dados]]
