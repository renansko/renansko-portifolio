# Renan Skonicezny Vilela — Portfólio

Site pessoal e portfólio profissional de Renan Skonicezny Vilela, com o CapiBot conectado a uma assistente RAG.

- **Stack**: HTML5, Vanilla CSS, Modern JavaScript.
- **Mascote & Assistente**: CapiBot com backend serverless Go, OpenAI e Neon/pgvector.
- **Deploy**: front-end estático e função Go na Vercel.

## Arquitetura da Capivara

O navegador chama `POST /api/chat`. A função serverless gera o embedding da pergunta, consulta os trechos mais próximos no PostgreSQL/pgvector e envia somente esse contexto para a OpenAI Responses API. As credenciais nunca chegam ao navegador.

```text
index.html → /api/chat → OpenAI Embeddings → Neon/pgvector
                         contexto recuperado → OpenAI Responses → resposta
```

Principais arquivos:

- `api/chat.go`: entrada da função Go reconhecida pela Vercel.
- `internal/capivara/`: validação, recuperação vetorial e cliente da OpenAI.
- `db/migrations/001_portfolio_rag.sql`: extensão `vector`, tabela e índice HNSW.
- `data/portfolio.json`: corpus editável do portfólio.
- `cmd/setup-rag/main.go`: aplica a migração, gera embeddings e faz upsert do corpus.

## Configuração

Requisitos: Go 1.24 ou superior, uma chave da OpenAI API e um banco PostgreSQL com pgvector.

1. Copie `.env.example` para `.env.local` e preencha as credenciais.
2. Baixe as dependências e prepare o banco:

```bash
go mod download
go run ./cmd/setup-rag
```

O comando é idempotente e pode ser executado novamente após alterações em `data/portfolio.json`.

## Execução local

Para executar site e API juntos, autentique a CLI da Vercel e rode:

```bash
vercel dev
```

Para validar o código sem acessar serviços externos:

```bash
go test ./...
go test -race ./...
go vet ./...
go build ./...
```

## Publicação

Publique na Vercel e configure `DATABASE_URL` e `OPENAI_API_KEY`. As variáveis opcionais `OPENAI_EMBEDDING_MODEL` e `OPENAI_CHAT_MODEL` permitem trocar os modelos sem alterar o código.

O front-end continua servido por `index.html`, mas o CapiBot RAG não funciona em hospedagem puramente estática porque depende da função segura em `/api/chat`.

Nunca coloque a connection string do banco ou a chave da OpenAI no `index.html`, nem faça commit de `.env` ou `.env.local`.
