# Histórico de Decisões

Decisões arquiteturais e por quê.

## Por que Firebase / serverless

**Decisão**: usar Firebase (Firestore + Cloud Functions + FCM + Storage) ao invés de um backend tradicional (Node/Express + Postgres, por exemplo).

**Porquê**:
- Zero ops — não precisa provisionar servidor, cuidar de uptime, configurar nginx, etc.
- Tempo real de graça — `onSnapshot` já resolve o "dashboard atualiza sozinho".
- Auth flexível (ou nenhuma) — `config/geral` guarda senhas e código, não precisa de OAuth.
- Push notifications com integração direta (FCM + Cloud Functions).
- Deploy instantâneo — `git push` na Vercel + `firebase deploy --only functions` e acabou.
- Escala automática — se dobrar o número de barracas, não precisa redimensionar nada.

**Trade-offs aceitos**:
- Firestore é NoSQL — sem joins, sem transactions complexas.
- Vendor lock-in no Google Cloud.
- Regras de segurança em DSL própria (não SQL/código).
- Custo pode crescer se o uso escalar bruscamente.

**Quando faria sentido mudar**:
- Lógica de negócio muito complexa que não cabe em Cloud Function.
- Precisa de SQL / relatórios analíticos pesados.
- Custo mensal virando inviável (alerta de budget configurado em R$25).

Pra escopo atual (festejo de 3-5 dias, 10-30 barracas, 1 admin) é super apropriado.

## Sem Firebase Auth

**Decisão**: auth caseira com senha + código em `config/geral`.

**Porquê**: simplicidade — não precisa de email/SMS/cadastro. Admin é uma pessoa só, responsáveis são voluntários rotativos que só precisam entrar rapidinho com um código compartilhado. Zero fricção.

**Trade-off**: sem Firebase Auth, não dá pra usar regras de segurança finas no Firestore. Por enquanto rules são abertas (⚠️ revisar em produção).

## Cloud Function v2

**Decisão**: Cloud Functions **v2** (`onDocumentCreated` do pacote `firebase-functions/v2/firestore`), região `southamerica-east1`.

**Porquê**: v2 tem melhor cold start e latência. Região BR reduz latência pra usuários locais.

**Trade-off**: v2 exige plano **Blaze** (não roda no Spark).

## Sem índice composto

**Decisão**: queries do dashboard não usam `orderBy + where` em campos diferentes.

**Porquê**: evita a necessidade de criar índices compostos manualmente no Firebase Console. Sort client-side funciona bem pra volumes pequenos (< 100 pedidos pendentes simultâneos).

**Trade-off**: se a coleção crescer muito, performance cai. Pra um festejo: irrelevante.

## localStorage como source of truth do token FCM

**Decisão**: além de salvar o token em `fcmTokens/{token}` no Firestore, também guardamos em `localStorage['festejo:fcm-token']`.

**Porquê**: iOS não deixa apps revogar `Notification.permission`. Sem o localStorage, não teria como saber se o user *ativou nesse dispositivo* — só se ele já concedeu permissão alguma vez.

## Vercel ao invés de Firebase Hosting

**Decisão**: Frontend na Vercel.

**Porquê**: preview deploys por branch, integração com GitHub direta, build cache agressivo. Firebase Hosting funcionaria, mas a DX é melhor na Vercel pra um projeto desse porte.

## Bump de `version.ts` pra forçar update

**Decisão**: Constante `APP_VERSION` em `src/version.ts` que é incrementada a cada release.

**Porquê**: o vite-plugin-pwa gera um SW com hash, mas dispositivos com cache agressivo (iOS em especial) às vezes servem versão antiga. Bumpar a versão força invalidação.

## Veja também
- [[Bugs & Fixes]]
- [[02 - Stack & Arquitetura]]
