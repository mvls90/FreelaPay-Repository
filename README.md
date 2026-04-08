# 🛡️ Free.API — Plataforma de Intermediação de Pagamentos para Freelancers

Plataforma completa de segurança e transparência em transações entre clientes e freelancers.

---

## 🏗️ Arquitetura

```
freeapi/
├── backend/          # Node.js + Express + Socket.io
│   ├── src/
│   │   ├── controllers/   # Lógica de negócio
│   │   ├── middleware/    # Auth JWT, validação, rate limit
│   │   ├── routes/        # Rotas da API
│   │   ├── services/      # Email, notificações, pagamentos
│   │   └── config/        # DB, Socket, Logger
│   └── Dockerfile
├── frontend/         # React 18 + React Router + Zustand
│   ├── src/
│   │   ├── pages/         # Telas (auth, freelancer, client, admin)
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── store/         # Estado global (Zustand)
│   │   ├── services/      # API axios
│   │   └── context/       # Socket.io context
│   └── Dockerfile
├── database/
│   └── schema.sql    # Schema PostgreSQL completo
└── docker-compose.yml
```

---

## 🚀 Instalação Rápida (Docker)

### 1. Pré-requisitos
- Docker e Docker Compose instalados
- Node.js 20+ (para desenvolvimento local)

### 2. Configurar variáveis de ambiente

```bash
cp backend/.env.example backend/.env
# Edite o arquivo com suas credenciais
```

Variáveis obrigatórias no `.env`:
```env
JWT_SECRET=seu_jwt_secret_muito_seguro_min_32_chars
JWT_REFRESH_SECRET=outro_secret_muito_seguro
DB_PASSWORD=sua_senha_postgres
MP_ACCESS_TOKEN=seu_token_mercado_pago    # Para PIX
STRIPE_SECRET_KEY=sk_test_...             # Para cartão
SMTP_USER=seu@email.com
SMTP_PASS=senha_app_gmail
```

### 3. Subir com Docker Compose

```bash
docker-compose up -d
```

Isso vai:
- ✅ Criar o banco PostgreSQL e aplicar o schema
- ✅ Subir o Redis
- ✅ Iniciar o backend na porta 3001
- ✅ Fazer build e servir o frontend na porta 3000

### 4. Acessar

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001/api |
| Health check | http://localhost:3001/health |

---

## 💻 Desenvolvimento Local

### Backend
```bash
cd backend
npm install
cp .env.example .env    # Configure as variáveis
npm run dev             # Nodemon com hot reload
```

### Frontend
```bash
cd frontend
npm install
# Criar .env.local:
echo "REACT_APP_API_URL=http://localhost:3001/api" > .env.local
echo "REACT_APP_SOCKET_URL=http://localhost:3001" >> .env.local
npm start
```

### Banco de dados local
```bash
# Com PostgreSQL instalado:
createdb freeapi_db
psql freeapi_db < database/schema.sql
```

---

## 📋 Funcionalidades Implementadas

### Para Freelancers
- ✅ Cadastro e login com verificação de e-mail
- ✅ Autenticação 2FA (TOTP)
- ✅ Criação de propostas com link único
- ✅ Pagamento por etapas (milestones) ou 100% antecipado
- ✅ Upload de atualizações de progresso
- ✅ Chat em tempo real com cliente
- ✅ Dashboard financeiro (saldo, em custódia, total ganho)
- ✅ Solicitação de saque

### Para Clientes
- ✅ Visualização de proposta pelo link (sem cadastro prévio)
- ✅ Aceite/recusa de proposta
- ✅ Pagamento via PIX (QR Code) e cartão de crédito
- ✅ Aprovação de etapas e liberação de pagamento
- ✅ Solicitação de revisões
- ✅ Abertura de disputas
- ✅ Chat em tempo real com freelancer

### Administração
- ✅ Dashboard master com métricas em tempo real
- ✅ Gestão de usuários (suspender, banir)
- ✅ Central de disputas com atribuição de mediadores
- ✅ Controle de saques pendentes
- ✅ Alertas de fraude
- ✅ Logs de auditoria completos

### Segurança
- ✅ JWT com refresh token automático
- ✅ 2FA com TOTP (Google Authenticator)
- ✅ Rate limiting por IP
- ✅ Helmet.js (headers de segurança)
- ✅ bcrypt para senhas (12 rounds)
- ✅ Validação de inputs (express-validator)
- ✅ Auditoria de todas as ações administrativas

---

## 💳 Integração de Pagamentos

### PIX (Mercado Pago)
```env
MP_ACCESS_TOKEN=APP_USR-...
```
O QR Code é gerado automaticamente e expira em 30 minutos.
Webhook configurado em: `POST /api/webhooks/mercadopago`

### Cartão de Crédito (Stripe)
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
Webhook configurado em: `POST /api/webhooks/stripe`

---

## 🌐 API — Principais Endpoints

### Auth
```
POST /api/auth/register     Cadastro
POST /api/auth/login        Login
POST /api/auth/refresh      Renovar token
POST /api/auth/setup-2fa    Configurar 2FA
```

### Propostas
```
POST   /api/proposals               Criar proposta
GET    /api/proposals               Listar minhas propostas
GET    /api/proposals/link/:link    Ver proposta (público)
POST   /api/proposals/:id/accept    Aceitar proposta
POST   /api/proposals/:id/reject    Recusar proposta
```

### Projetos
```
GET    /api/projects                    Listar projetos
GET    /api/projects/:id                Detalhe
POST   /api/projects/:id/updates        Enviar atualização
POST   /api/projects/:id/milestones/:milestoneId/approve   Aprovar etapa
POST   /api/projects/:id/milestones/:milestoneId/reject    Solicitar revisão
```

### Pagamentos
```
POST   /api/payments/project/:id/initiate   Iniciar pagamento
GET    /api/payments/balance                 Saldo do usuário
POST   /api/payments/withdraw                Solicitar saque
```

### Disputas
```
POST   /api/disputes            Abrir disputa
GET    /api/disputes/:id        Detalhe
POST   /api/disputes/:id/messages    Enviar mensagem
POST   /api/disputes/:id/resolve     Resolver (mediador)
```

---

## 🔧 Próximos Passos Recomendados

1. **Configurar domínio e SSL** com Nginx + Certbot
2. **Implementar KYC** (verificação de documentos com envio S3)
3. **Contratos digitais** com DocuSign ou similar
4. **Marketplace** de freelancers com busca e filtros
5. **App mobile** com React Native (o backend já suporta)
6. **Monitoramento** com Grafana + alertas Telegram
7. **Testes automatizados** com Jest + Supertest

---

## 📊 Modelo de Monetização

- **Taxa por transação**: 5% do valor total (configurável)
- **Plano premium**: Freelancers pagam mensalidade por destaque
- **Taxa de mediação**: 5-10% em disputas resolvidas

---

## 🛡️ Conformidade

- **LGPD**: Dados criptografados, consentimento registrado
- **PCI-DSS**: Nunca armazenamos dados de cartão (Stripe cuida disso)
- **2FA**: Disponível para todos os usuários

---

> **Free.API** — Desenvolvido com React + Node.js + PostgreSQL
