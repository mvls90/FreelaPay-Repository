-- ============================================================
-- Free.API - Schema PostgreSQL Completo
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_type AS ENUM ('freelancer', 'client', 'admin', 'mediator', 'support');
CREATE TYPE user_status AS ENUM ('pending', 'active', 'suspended', 'banned');
CREATE TYPE verification_level AS ENUM ('unverified', 'basic', 'verified', 'premium');
CREATE TYPE proposal_status AS ENUM ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'cancelled');
CREATE TYPE project_status AS ENUM ('waiting_payment', 'in_progress', 'in_review', 'revision_requested', 'completed', 'cancelled', 'disputed');
CREATE TYPE payment_status AS ENUM ('pending', 'held', 'released', 'refunded', 'disputed', 'cancelled');
CREATE TYPE payment_method AS ENUM ('pix', 'credit_card', 'debit_card', 'bank_transfer', 'crypto');
CREATE TYPE milestone_status AS ENUM ('pending', 'in_progress', 'submitted', 'approved', 'rejected', 'paid');
CREATE TYPE dispute_status AS ENUM ('open', 'under_review', 'awaiting_response', 'resolved', 'escalated', 'closed');
CREATE TYPE dispute_resolution AS ENUM ('full_release', 'partial_release', 'full_refund', 'partial_refund', 'cancelled');
CREATE TYPE notification_type AS ENUM (
  'proposal_accepted', 'proposal_rejected', 'payment_received', 'payment_released',
  'milestone_approved', 'milestone_rejected', 'revision_requested', 'project_completed',
  'dispute_opened', 'dispute_resolved', 'message_received', 'system_alert'
);
CREATE TYPE contract_status AS ENUM ('draft', 'pending_signature', 'signed', 'expired', 'cancelled');

-- ============================================================
-- TABELA: USERS
-- ============================================================
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type            user_type NOT NULL,
  status          user_status NOT NULL DEFAULT 'pending',
  verification    verification_level NOT NULL DEFAULT 'unverified',
  full_name       VARCHAR(200) NOT NULL,
  email           VARCHAR(200) NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  phone           VARCHAR(20),
  document_cpf    VARCHAR(14),
  document_rg     VARCHAR(20),
  avatar_url      TEXT,
  bio             TEXT,
  website_url     TEXT,
  skills          TEXT[],
  location_city   VARCHAR(100),
  location_state  VARCHAR(50),
  location_country VARCHAR(50) DEFAULT 'BR',
  trust_score     NUMERIC(5,2) DEFAULT 0,
  total_earned    NUMERIC(15,2) DEFAULT 0,
  total_spent     NUMERIC(15,2) DEFAULT 0,
  completed_projects INTEGER DEFAULT 0,
  cancelled_projects INTEGER DEFAULT 0,
  dispute_count   INTEGER DEFAULT 0,
  two_fa_enabled  BOOLEAN DEFAULT FALSE,
  two_fa_secret   TEXT,
  last_login_at   TIMESTAMPTZ,
  email_verified  BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMPTZ,
  is_premium      BOOLEAN DEFAULT FALSE,
  premium_until   TIMESTAMPTZ,
  bank_account    JSONB,
  pix_key         VARCHAR(200),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(type);
CREATE INDEX idx_users_status ON users(status);

-- ============================================================
-- TABELA: USER_DOCUMENTS (para verificação KYC)
-- ============================================================
CREATE TABLE user_documents (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doc_type      VARCHAR(50) NOT NULL,
  file_url      TEXT NOT NULL,
  status        VARCHAR(20) DEFAULT 'pending',
  reviewed_by   UUID REFERENCES users(id),
  reviewed_at   TIMESTAMPTZ,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: CATEGORIES
-- ============================================================
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon        VARCHAR(50),
  parent_id   UUID REFERENCES categories(id),
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: PROPOSALS
-- ============================================================
CREATE TABLE proposals (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id       UUID NOT NULL REFERENCES users(id),
  client_id           UUID REFERENCES users(id),
  category_id         UUID REFERENCES categories(id),
  status              proposal_status NOT NULL DEFAULT 'draft',
  title               VARCHAR(300) NOT NULL,
  description         TEXT NOT NULL,
  scope_details       TEXT,
  total_amount        NUMERIC(15,2) NOT NULL,
  platform_fee_pct    NUMERIC(5,2) DEFAULT 5.00,
  platform_fee_amount NUMERIC(15,2),
  freelancer_receives NUMERIC(15,2),
  payment_type        VARCHAR(20) NOT NULL DEFAULT 'full',
  deadline_days       INTEGER NOT NULL,
  revisions_included  INTEGER DEFAULT 2,
  unique_link         VARCHAR(100) UNIQUE NOT NULL,
  link_expires_at     TIMESTAMPTZ,
  accepted_at         TIMESTAMPTZ,
  rejected_at         TIMESTAMPTZ,
  rejection_reason    TEXT,
  meta_data           JSONB,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_proposals_freelancer ON proposals(freelancer_id);
CREATE INDEX idx_proposals_client ON proposals(client_id);
CREATE INDEX idx_proposals_link ON proposals(unique_link);
CREATE INDEX idx_proposals_status ON proposals(status);

-- ============================================================
-- TABELA: MILESTONES (etapas de pagamento)
-- ============================================================
CREATE TABLE milestones (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id     UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  title           VARCHAR(200) NOT NULL,
  description     TEXT,
  order_index     INTEGER NOT NULL,
  percentage      NUMERIC(5,2) NOT NULL,
  amount          NUMERIC(15,2) NOT NULL,
  status          milestone_status NOT NULL DEFAULT 'pending',
  due_date        TIMESTAMPTZ,
  submitted_at    TIMESTAMPTZ,
  approved_at     TIMESTAMPTZ,
  paid_at         TIMESTAMPTZ,
  submission_notes TEXT,
  rejection_reason TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: PROJECTS
-- ============================================================
CREATE TABLE projects (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id         UUID NOT NULL REFERENCES proposals(id),
  freelancer_id       UUID NOT NULL REFERENCES users(id),
  client_id           UUID NOT NULL REFERENCES users(id),
  status              project_status NOT NULL DEFAULT 'waiting_payment',
  title               VARCHAR(300) NOT NULL,
  total_amount        NUMERIC(15,2) NOT NULL,
  amount_held         NUMERIC(15,2) DEFAULT 0,
  amount_released     NUMERIC(15,2) DEFAULT 0,
  started_at          TIMESTAMPTZ,
  deadline_at         TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  cancelled_at        TIMESTAMPTZ,
  cancellation_reason TEXT,
  revisions_used      INTEGER DEFAULT 0,
  revisions_allowed   INTEGER DEFAULT 2,
  progress_pct        NUMERIC(5,2) DEFAULT 0,
  last_activity_at    TIMESTAMPTZ DEFAULT NOW(),
  meta_data           JSONB,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_freelancer ON projects(freelancer_id);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);

-- ============================================================
-- TABELA: PROJECT_UPDATES (progresso do freelancer)
-- ============================================================
CREATE TABLE project_updates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id    UUID REFERENCES milestones(id),
  author_id       UUID NOT NULL REFERENCES users(id),
  title           VARCHAR(200),
  description     TEXT NOT NULL,
  progress_pct    NUMERIC(5,2),
  attachments     JSONB DEFAULT '[]',
  is_delivery     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: PAYMENTS
-- ============================================================
CREATE TABLE payments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id          UUID NOT NULL REFERENCES projects(id),
  milestone_id        UUID REFERENCES milestones(id),
  payer_id            UUID NOT NULL REFERENCES users(id),
  payee_id            UUID NOT NULL REFERENCES users(id),
  status              payment_status NOT NULL DEFAULT 'pending',
  method              payment_method,
  amount              NUMERIC(15,2) NOT NULL,
  platform_fee        NUMERIC(15,2) NOT NULL DEFAULT 0,
  net_amount          NUMERIC(15,2) NOT NULL,
  currency            VARCHAR(3) DEFAULT 'BRL',
  gateway_provider    VARCHAR(50),
  gateway_payment_id  VARCHAR(200),
  gateway_response    JSONB,
  held_at             TIMESTAMPTZ,
  released_at         TIMESTAMPTZ,
  refunded_at         TIMESTAMPTZ,
  pix_qr_code         TEXT,
  pix_expiry          TIMESTAMPTZ,
  card_last_four      VARCHAR(4),
  installments        INTEGER DEFAULT 1,
  chargeback_protected BOOLEAN DEFAULT TRUE,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_project ON payments(project_id);
CREATE INDEX idx_payments_payer ON payments(payer_id);
CREATE INDEX idx_payments_payee ON payments(payee_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================================
-- TABELA: CONTRACTS
-- ============================================================
CREATE TABLE contracts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id      UUID NOT NULL REFERENCES projects(id),
  proposal_id     UUID NOT NULL REFERENCES proposals(id),
  freelancer_id   UUID NOT NULL REFERENCES users(id),
  client_id       UUID NOT NULL REFERENCES users(id),
  status          contract_status NOT NULL DEFAULT 'draft',
  content         TEXT NOT NULL,
  content_hash    TEXT,
  freelancer_sig  JSONB,
  client_sig      JSONB,
  signed_at       TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  docusign_id     VARCHAR(200),
  nda_required    BOOLEAN DEFAULT FALSE,
  ip_assignment   BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: DISPUTES
-- ============================================================
CREATE TABLE disputes (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id          UUID NOT NULL REFERENCES projects(id),
  opened_by           UUID NOT NULL REFERENCES users(id),
  assigned_mediator   UUID REFERENCES users(id),
  status              dispute_status NOT NULL DEFAULT 'open',
  resolution          dispute_resolution,
  subject             VARCHAR(300) NOT NULL,
  description         TEXT NOT NULL,
  evidence_by_client  JSONB DEFAULT '[]',
  evidence_by_freelancer JSONB DEFAULT '[]',
  proposed_amount     NUMERIC(15,2),
  resolution_notes    TEXT,
  auto_resolve_at     TIMESTAMPTZ,
  opened_at           TIMESTAMPTZ DEFAULT NOW(),
  resolved_at         TIMESTAMPTZ,
  sla_deadline        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_disputes_project ON disputes(project_id);
CREATE INDEX idx_disputes_mediator ON disputes(assigned_mediator);
CREATE INDEX idx_disputes_status ON disputes(status);

-- ============================================================
-- TABELA: DISPUTE_MESSAGES
-- ============================================================
CREATE TABLE dispute_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispute_id  UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES users(id),
  content     TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  is_internal BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: MESSAGES (chat interno)
-- ============================================================
CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id      UUID REFERENCES projects(id),
  dispute_id      UUID REFERENCES disputes(id),
  sender_id       UUID NOT NULL REFERENCES users(id),
  receiver_id     UUID NOT NULL REFERENCES users(id),
  content         TEXT,
  attachments     JSONB DEFAULT '[]',
  is_read         BOOLEAN DEFAULT FALSE,
  read_at         TIMESTAMPTZ,
  is_system_msg   BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_project ON messages(project_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);

-- ============================================================
-- TABELA: REVIEWS
-- ============================================================
CREATE TABLE reviews (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id      UUID NOT NULL REFERENCES projects(id),
  reviewer_id     UUID NOT NULL REFERENCES users(id),
  reviewed_id     UUID NOT NULL REFERENCES users(id),
  rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title           VARCHAR(200),
  content         TEXT,
  on_time         BOOLEAN,
  communication   SMALLINT CHECK (communication BETWEEN 1 AND 5),
  quality         SMALLINT CHECK (quality BETWEEN 1 AND 5),
  professionalism SMALLINT CHECK (professionalism BETWEEN 1 AND 5),
  is_public       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  title       VARCHAR(200) NOT NULL,
  body        TEXT NOT NULL,
  data        JSONB DEFAULT '{}',
  is_read     BOOLEAN DEFAULT FALSE,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);

-- ============================================================
-- TABELA: AUDIT_LOGS
-- ============================================================
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id),
  action      VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);

-- ============================================================
-- TABELA: FINANCIAL_TRANSACTIONS (ledger)
-- ============================================================
CREATE TABLE financial_transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id),
  payment_id      UUID REFERENCES payments(id),
  type            VARCHAR(50) NOT NULL,
  amount          NUMERIC(15,2) NOT NULL,
  balance_before  NUMERIC(15,2),
  balance_after   NUMERIC(15,2),
  description     TEXT,
  reference_id    UUID,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: USER_BALANCES
-- ============================================================
CREATE TABLE user_balances (
  user_id         UUID PRIMARY KEY REFERENCES users(id),
  available       NUMERIC(15,2) DEFAULT 0,
  held            NUMERIC(15,2) DEFAULT 0,
  total_earned    NUMERIC(15,2) DEFAULT 0,
  total_withdrawn NUMERIC(15,2) DEFAULT 0,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: WITHDRAWAL_REQUESTS
-- ============================================================
CREATE TABLE withdrawal_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id),
  amount          NUMERIC(15,2) NOT NULL,
  method          payment_method NOT NULL,
  status          VARCHAR(20) DEFAULT 'pending',
  bank_info       JSONB,
  processed_by    UUID REFERENCES users(id),
  processed_at    TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: FRAUD_ALERTS
-- ============================================================
CREATE TABLE fraud_alerts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id),
  alert_type      VARCHAR(50) NOT NULL,
  severity        VARCHAR(20) DEFAULT 'medium',
  description     TEXT NOT NULL,
  data            JSONB DEFAULT '{}',
  status          VARCHAR(20) DEFAULT 'open',
  reviewed_by     UUID REFERENCES users(id),
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: PLATFORM_SETTINGS
-- ============================================================
CREATE TABLE platform_settings (
  key         VARCHAR(100) PRIMARY KEY,
  value       JSONB NOT NULL,
  description TEXT,
  updated_by  UUID REFERENCES users(id),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO platform_settings (key, value, description) VALUES
('platform_fee_pct', '5.0', 'Percentual de taxa da plataforma'),
('dispute_auto_resolve_days', '7', 'Dias para auto-resolução de disputas'),
('max_revisions_default', '2', 'Revisões padrão incluídas'),
('chargeback_protection', 'true', 'Proteção contra chargeback ativa'),
('min_withdrawal_amount', '50.0', 'Valor mínimo para saque'),
('proposal_link_expiry_days', '30', 'Dias para expiração do link de proposta');

-- ============================================================
-- TRIGGERS: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_proposals_updated_at BEFORE UPDATE ON proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_disputes_updated_at BEFORE UPDATE ON disputes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_milestones_updated_at BEFORE UPDATE ON milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at();
