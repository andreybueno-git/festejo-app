# Auth Flow

Auth é **caseira**, não usa Firebase Auth. Sessão persiste via `localStorage`.

Implementação: `src/contexts/AuthContext.tsx`.

## Personas

### Admin
- Login: senha única ([[Módulo Admin/AdminLogin]])
- Senha default: `admin123`
- Configurável em `config/geral.senhaAdmin`

### Responsável de barraca
- Login: [código de acesso] + [nome] + [barraca] ([[Módulo Barraca/BarracaLogin]])
- Código default: `FESTEJO2026`
- Configurável em `config/geral.codigoAcesso`

## Fluxo de login — Admin

```
Digita senha → loginAdmin(senha)
  → se bate → setUsuario(ADMIN_USUARIO) + localStorage.set('festejo_usuario')
  → redirect /admin
```

## Fluxo de login — Barraca

```
Digita código → verificarCodigo(codigo)
  → se bate → mostra form com nome + select de barracas
Digita nome + seleciona barraca → loginBarraca(nome, barracaId)
  → updateDoc(barracas/{id}, { responsavelNome, responsavelId, responsavelLoginEm })
  → setUsuario(...) + setBarraca(...) + localStorage
  → redirect /barraca
```

## Logout

```
logout() → limpa estado + localStorage
```

## Logout forçado de todas as barracas

Admin pode forçar em [[Módulo Admin/AdminConfig]]:

```ts
deslogarTodasBarracas()
  → setDoc(config/geral, { sessionToken: Date.now() })
```

> 💡 Como funciona: cada barraca escuta `config/geral.sessionToken`. Se mudar, logout automático.

## Restauração de sessão

No mount do `AuthProvider`:
```ts
const saved = localStorage.getItem('festejo_usuario');
if (saved) setUsuario(JSON.parse(saved));
```

## Veja também
- [[Módulo Admin/AdminLogin]]
- [[Módulo Barraca/BarracaLogin]]
- [[Services#AuthContext]]
