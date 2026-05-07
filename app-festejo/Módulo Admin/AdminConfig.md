# AdminConfig

Arquivo: `src/pages/admin/AdminConfig.tsx`
Rota: `/admin/config`

## O que faz

Configurações globais + por dispositivo.

## Seções

### Senha do admin
Atualiza `config/geral.senhaAdmin`.

### Código de acesso das barracas
Atualiza `config/geral.codigoAcesso`. Novos responsáveis precisam desse código pra entrar.

### Notificações push (por dispositivo)
- Toggle ON → [[Firebase/Push Notifications (FCM)|registrarPushAdmin]]
- Toggle OFF → [[Firebase/Push Notifications (FCM)|removerPushAdmin]]
- Source of truth do estado: `pushAtivo = temTokenRegistrado()`
- Ver [[Bugs & Fixes#Toggle push contraditório]] pra entender por que não usamos `Notification.permission`.

### Deslogar todas as barracas
Bump no `config/geral.sessionToken` → todos os responsáveis são forçados a relogar.

### Foto de fundo
Upload/URL pra `config/geral.fotoFundo`, usada em [[Componentes Compartilhados#Layout|Layout]].

## Veja também
- [[Firebase/Push Notifications (FCM)]]
- [[Firebase/Auth Flow]]
