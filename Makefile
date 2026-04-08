# ══════════════════════════════════════════════════════
#  Free.API — Makefile
#  Uso: make <comando>
# ══════════════════════════════════════════════════════

.PHONY: help dev prod down logs migrate seed install clean

# Cores para output
GREEN  = \033[0;32m
YELLOW = \033[0;33m
BLUE   = \033[0;34m
RESET  = \033[0m

help: ## Mostra esta ajuda
	@echo ""
	@echo "$(BLUE)Free.API — Comandos disponíveis:$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-18s$(RESET) %s\n", $$1, $$2}'
	@echo ""

# ── Desenvolvimento ───────────────────────────────────────────────
dev: ## Sobe banco + Redis para desenvolvimento local
	@echo "$(YELLOW)Subindo infraestrutura de desenvolvimento...$(RESET)"
	docker-compose -f docker-compose.dev.yml up -d
	@echo "$(GREEN)✅ PostgreSQL: localhost:5432$(RESET)"
	@echo "$(GREEN)✅ Redis:      localhost:6379$(RESET)"
	@echo "$(GREEN)✅ Adminer:    http://localhost:8080$(RESET)"
	@echo ""
	@echo "Agora execute em terminais separados:"
	@echo "  cd backend  && npm run dev"
	@echo "  cd frontend && npm start"

dev-stop: ## Para os containers de desenvolvimento
	docker-compose -f docker-compose.dev.yml down

# ── Produção ──────────────────────────────────────────────────────
prod: ## Sobe toda a stack em produção
	@echo "$(YELLOW)Subindo Free.API em produção...$(RESET)"
	docker-compose up -d --build
	@echo "$(GREEN)✅ Plataforma rodando em http://localhost$(RESET)"

down: ## Para todos os containers
	docker-compose down
	docker-compose -f docker-compose.dev.yml down

logs: ## Mostra logs do backend
	docker-compose logs -f backend

logs-all: ## Mostra logs de todos os serviços
	docker-compose logs -f

# ── Banco de dados ────────────────────────────────────────────────
migrate: ## Aplica o schema.sql no banco
	@echo "$(YELLOW)Aplicando schema...$(RESET)"
	cd backend && node src/config/migrate.js
	@echo "$(GREEN)✅ Schema aplicado$(RESET)"

seed: ## Insere dados iniciais (admin, categorias, usuários de teste)
	@echo "$(YELLOW)Inserindo dados iniciais...$(RESET)"
	cd backend && node src/config/seed.js

db-reset: ## Recria o banco do zero (CUIDADO: apaga tudo)
	@echo "$(YELLOW)⚠️  Recriando banco de dados...$(RESET)"
	docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -c "DROP DATABASE IF EXISTS freeapi_db;"
	docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -c "CREATE DATABASE freeapi_db;"
	$(MAKE) migrate
	$(MAKE) seed

# ── Instalação ────────────────────────────────────────────────────
install: ## Instala dependências do backend e frontend
	@echo "$(YELLOW)Instalando dependências...$(RESET)"
	cd backend  && npm install
	cd frontend && npm install
	@echo "$(GREEN)✅ Dependências instaladas$(RESET)"

install-backend: ## Instala apenas dependências do backend
	cd backend && npm install

install-frontend: ## Instala apenas dependências do frontend
	cd frontend && npm install

# ── Setup inicial ─────────────────────────────────────────────────
setup: ## Setup completo: instala deps, sobe infra, migra e seed
	@echo "$(BLUE)🚀 Configurando Free.API do zero...$(RESET)"
	cp -n backend/.env.example backend/.env || true
	$(MAKE) install
	$(MAKE) dev
	@echo "$(YELLOW)Aguardando banco inicializar...$(RESET)"
	sleep 5
	$(MAKE) migrate
	$(MAKE) seed
	@echo ""
	@echo "$(GREEN)✅ Setup concluído!$(RESET)"
	@echo ""
	@echo "Próximos passos:"
	@echo "  1. Edite backend/.env com suas credenciais"
	@echo "  2. cd backend  && npm run dev"
	@echo "  3. cd frontend && npm start"
	@echo "  4. Acesse http://localhost:3000"

# ── Build ─────────────────────────────────────────────────────────
build-frontend: ## Gera build de produção do frontend
	cd frontend && npm run build

# ── Limpeza ───────────────────────────────────────────────────────
clean: ## Remove node_modules e builds
	rm -rf backend/node_modules frontend/node_modules frontend/build
	@echo "$(GREEN)✅ Limpeza concluída$(RESET)"

# ── Status ────────────────────────────────────────────────────────
status: ## Mostra status dos containers
	docker-compose ps
	@echo ""
	docker-compose -f docker-compose.dev.yml ps
