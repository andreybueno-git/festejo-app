# 🎪 App Festejo

Sistema de controle de embalagens para festejo da igreja.

## ✨ Funcionalidades

### Admin
- 📊 Dashboard com pedidos pendentes
- 📦 Gestão de estoque com alertas
- 🏪 Cadastro e gerenciamento de barracas
- ⚙️ Configurações do festejo

### Barracas
- 📖 Versículo diário sobre serviço
- 📝 Fazer pedidos de embalagens
- 📱 Envio automático via WhatsApp
- 📋 Acompanhar status dos pedidos

## 🚀 Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta no Firebase (gratuito)

### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/festejo-app.git
cd festejo-app
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o Firebase**

   a. Acesse [Firebase Console](https://console.firebase.google.com)
   
   b. Crie um novo projeto
   
   c. Ative os serviços:
      - Authentication (Email/Password)
      - Firestore Database
      - Storage
      - Cloud Messaging (opcional, para notificações)
   
   d. Copie as credenciais do projeto

4. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas credenciais do Firebase.

5. **Execute o projeto**
```bash
npm run dev
```

6. **Acesse no navegador**
```
http://localhost:5173
```

## 📱 Instalando como PWA

1. Abra o app no navegador do celular
2. Toque em "Adicionar à tela inicial" (ou menu ⋮ → "Instalar app")
3. Pronto! O app funciona offline

## 🔧 Build para produção

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/`.

## 🌐 Deploy na Vercel

1. Faça push do código para o GitHub
2. Importe o repositório na [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente
4. Deploy automático!

## 📁 Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
├── contexts/       # Context API (Auth)
├── data/          # Dados estáticos (versículos)
├── pages/
│   ├── admin/     # Telas do admin
│   └── barraca/   # Telas da barraca
├── services/      # Firebase config
├── styles/        # CSS global (Liquid Glass)
└── types/         # Tipos TypeScript
```

## 🎨 Design

O app usa o estilo **Apple Liquid Glass 2025**:
- Fundo com gradiente azul profundo
- Cards com efeito de vidro (blur + transparência)
- Tipografia SF Pro style
- Cores semânticas para status

## 📋 Código de Acesso Padrão

Para testes, o código de acesso das barracas é:
```
FESTEJO2026
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

---

Feito com ❤️ para a comunidade da igreja.
