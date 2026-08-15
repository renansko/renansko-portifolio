# Renan Skonicezny Vilela — Portfólio

Portfólio pessoal com a Capivara, uma assistente RAG que responde perguntas sobre a trajetória profissional de Renan.

## Arquitetura da Capivara

O navegador chama `POST /api/chat`. A função serverless em Go gera o embedding da pergunta, consulta os trechos mais próximos no PostgreSQL/pgvector do Neon e envia apenas esse contexto para a OpenAI Responses API. As credenciais nunca são enviadas ao navegador.

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

## Configuração do Neon e OpenAI

Requisitos: Go 1.24 ou superior, uma chave da OpenAI API e o projeto Neon [`late-king-32274883`](https://console.neon.tech/app/projects/late-king-32274883).

1. No projeto Neon, clique em **Connect** e copie a connection string do banco.
2. Copie `.env.example` para `.env.local` e preencha:

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
OPENAI_API_KEY=sk-...
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_CHAT_MODEL=gpt-5.6-luna
```

3. Baixe as dependências e prepare o banco:

```bash
go mod download
go run ./cmd/setup-rag
```

O comando é idempotente: pode ser executado novamente depois de alterar `data/portfolio.json`.

## Execução local

As rotas em `api/` usam o runtime Go da Vercel. Para executar site e API juntos, instale a CLI da Vercel e execute:

```bash
vercel dev
```

Abra a URL exibida pelo CLI e converse com a Capivara. Para validar o código sem acessar serviços externos:

```bash
go test ./...
```

## Publicação

Publique na Vercel e cadastre `DATABASE_URL` e `OPENAI_API_KEY` nas variáveis de ambiente do projeto. As variáveis opcionais `OPENAI_EMBEDDING_MODEL` e `OPENAI_CHAT_MODEL` permitem trocar os modelos sem alterar código.

O front-end continua sendo servido pelo `index.html`, mas a versão RAG não funciona somente no GitHub Pages porque precisa da função serverless segura em `/api/chat`.

Nunca coloque a connection string do Neon ou a chave OpenAI no `index.html` nem faça commit de `.env`/`.env.local`.
