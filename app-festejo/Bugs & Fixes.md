# Bugs & Fixes

Histórico de bugs resolvidos durante o desenvolvimento.

## Toggle push contraditório

**Sintoma**: Toggle de push em [[Módulo Admin/AdminConfig]] ficava verde ("Ativadas neste dispositivo") mas o texto abaixo dizia "desativadas".

**Causa**: o código usava `Notification.permission` como source of truth. Em iOS, uma vez granted, a permissão nunca volta pra `default` mesmo depois de deletar o token FCM.

**Fix**: novo estado `pushAtivo` baseado em `temTokenRegistrado()` que combina permission + presença da chave `festejo:fcm-token` no localStorage.

**Versão**: v2.3.
**Commit**: `fix: toggle push UI contraditório`

## Sininho admin vazio

**Sintoma**: Pedido criado pela barraca não aparecia no sininho do [[Módulo Admin/AdminDashboard|dashboard]] do admin, mesmo com Cloud Function logando `Push enviado`.

**Causa**: query tinha `where('status', '==', 'pendente') + orderBy('criadoEm', 'desc')` — combinação que exige índice composto no Firestore. Índice não existia → query falhava silenciosamente porque o error handler era `() => {}`.

**Fix**: removido `orderBy` e `limit` da query. Sort e slice feitos client-side. Error handlers agora usam `console.error` pra surfar erros futuros.

**Versão**: v2.4.

## NaNh no tempo dos pedidos

**Sintoma**: Pedidos apareciam com "NaNh" no lugar do tempo decorrido ("agora", "2 min", "1h").

**Causa**: `pedido.criadoEm` é Firestore Timestamp (`{seconds, nanoseconds, toDate()}`), não `Date`. `new Date(timestamp).getTime()` retornava `NaN`.

**Fix**: `formatTime()` e sort agora detectam o shape do valor e usam `.toDate()` / `.seconds * 1000` conforme o caso.

**Versão**: v2.5.

## Responsável não aparecia

**Sintoma**: No [[Módulo Admin/AdminBarracas]], todas as barracas mostravam "Sem responsável" mesmo com gente logada.

**Causa**: `loginBarraca` só salvava no localStorage local. Não gravava `responsavelNome`/`responsavelId` no doc da barraca no Firestore.

**Fix**: adicionado `updateDoc(barracas/{id}, { responsavelNome, responsavelId, responsavelLoginEm })` no `loginBarraca`.

⚠️ Barracas com responsável logado **antes** da v2.6 precisam deslogar + logar de novo pra atualizar.

**Versão**: v2.6.

## Veja também
- [[Histórico de Decisões]]
