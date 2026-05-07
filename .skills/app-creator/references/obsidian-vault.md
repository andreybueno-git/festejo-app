# Obsidian Vault Reference

Templates for each note in the vault. Substitute `<APP>` with the project name and `<PERSONA>` with the end-user role (barraca, cliente, funcionário, etc.).

## 00 - Home.md

```markdown
# 🎉 <APP> — Documentação

<1-line pitch>

## Navegação rápida

### Fundamentos
- [[01 - Visão Geral]]
- [[02 - Stack & Arquitetura]]
- [[03 - Estrutura de Pastas]]
- [[Modelo de Dados]]
- [[Deploy]]

### Firebase
- [[Firebase/Firebase - Visão Geral|Firebase — Visão Geral]]
- [[Firebase/Firestore - Coleções|Firestore — Coleções]]
- [[Firebase/Cloud Functions|Cloud Functions]]
- [[Firebase/Auth Flow|Auth Flow]]
- [[Firebase/Push Notifications (FCM)|Push Notifications (FCM)]]

### Módulos
- [[Módulo Admin/Admin - Visão Geral|Módulo Admin]]
- [[Módulo <PERSONA>/<PERSONA> - Visão Geral|Módulo <PERSONA>]]

### Código
- [[Componentes Compartilhados]]
- [[Services]]

### Histórico
- [[Histórico de Decisões]]
- [[Bugs & Fixes]]

## Status atual
- Versão: **v1.0**
- Plano Firebase: **Blaze**

#<app> #pwa #firebase #react
```

## 02 - Stack & Arquitetura.md (diagrama + BaaS framing)

Must include this exact block about BaaS — it prevents user confusion forever:

```markdown
**O backend existe — é o Firebase**, só que é *serverless*. A gente não mantém servidor Node próprio, mas há um backend de verdade rodando na infra do Google:

1. **Firestore** — banco de dados (fonte da verdade para <entidades>).
2. **Cloud Function `notificarPedido`** — código server-side rodando no Google, disparado quando um doc é criado em `pedidos/*`.
3. **Frontend** — escuta Firestore via `onSnapshot` e re-renderiza em tempo real.

> 💡 **Backend tradicional vs Firebase**
>
> Em uma stack tradicional você teria um servidor Node/Django/Rails com endpoints `POST /pedidos`, deploy, scaling, uptime, banco separado, etc.
>
> No Firebase o cliente escreve direto no Firestore (via SDK, com regras de segurança), e lógica de servidor vira Cloud Function. O "servidor" é a infra do Google. Isso chama-se **BaaS** (Backend as a Service) ou **serverless**.
>
> Pra esse projeto é a escolha certa — zero ops, deploy instantâneo, escala automática.
```

## Modelo de Dados.md

One TS interface block per collection, linked to the collection note in `Firebase/Firestore - Coleções.md`. Always flag Firestore Timestamp gotcha:

```markdown
> ⚠️ `criadoEm` é um **Firestore Timestamp**, não `Date`. Precisa de `.toDate()` ou leitura de `.seconds` antes de usar. Ver [[Bugs & Fixes]].
```

## Bugs & Fixes.md

Start empty except for a template:

```markdown
# Bugs & Fixes

Histórico de bugs resolvidos durante o desenvolvimento.

## <Nome curto do bug>

**Sintoma**: <o que o usuário vê>
**Causa**: <raiz técnica>
**Fix**: <o que foi mudado>
**Versão**: v<X.Y>
**Commit**: `<mensagem>`
```

Remind the user to add a section whenever a non-trivial bug is fixed. This is how institutional memory survives team changes.

## Histórico de Decisões.md

Must include:

1. **Por que Firebase / serverless** — with trade-offs accepted
2. **Sem Firebase Auth** (if applicable) — why + rules implication
3. **Cloud Function v2** — region choice, Blaze requirement
4. **Index strategy** — client-side sort trade-off

Template per decision:

```markdown
## <Decisão>

**Decisão**: <resumo>
**Porquê**: <motivos>
**Trade-off**: <o que a gente perde>
**Quando faria sentido mudar**: <gatilho futuro>
```

## Per-screen notes (admin + persona)

Each screen gets a note with these sections:

```markdown
# <ScreenName>

Arquivo: `src/pages/<module>/<ScreenName>.tsx`
Rota: `/<route>`

## O que mostra / faz
<list>

## Queries / mutations
<code blocks showing Firestore interactions>

## Helpers
<funções internas relevantes>

## Bugs resolvidos
- [[Bugs & Fixes#<section>]]

## Veja também
- [[related note 1]]
- [[related note 2]]
```

## Cross-linking rules

- Every screen note links to `Modelo de Dados` for the entities it touches.
- Every Firebase note links back to related screen notes.
- `Auth Flow` links to both login screens (admin + persona).
- `Push Notifications` links to `AdminConfig` (toggle) and `Cloud Functions` (sender).
- `Bugs & Fixes` entries link back to the screen/service they fixed.

Use the graph view (Cmd+G in Obsidian) to sanity-check the web — orphan notes are usually a sign of missing links.

## When to add new notes

- **New screen** → `Módulo X/<ScreenName>.md`
- **New Firestore collection** → update `Modelo de Dados.md` + section in `Firestore - Coleções.md`
- **New service** → update `Services.md`
- **Bug fix** → new section in `Bugs & Fixes.md`
- **Architectural choice** → new section in `Histórico de Decisões.md`

Vault grows organically with the project. Don't try to document everything up front — only what's shipped.
