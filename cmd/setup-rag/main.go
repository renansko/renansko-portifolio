package main

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/renansko/renansko-portfolio/internal/capivara"
)

const embeddingDimensions = 1536

type portfolioChunk struct {
	Slug     string         `json:"slug"`
	Title    string         `json:"title"`
	Content  string         `json:"content"`
	Source   string         `json:"source"`
	Metadata map[string]any `json:"metadata"`
}

func main() {
	if err := run(); err != nil {
		fmt.Fprintf(os.Stderr, "Falha ao preparar o RAG: %v\n", err)
		os.Exit(1)
	}
}

func run() error {
	root, err := projectRoot()
	if err != nil {
		return err
	}
	if err := loadEnvironment(filepath.Join(root, ".env.local")); err != nil {
		return err
	}
	databaseURL, err := requireEnvironment("DATABASE_URL")
	if err != nil {
		return err
	}
	apiKey, err := requireEnvironment("OPENAI_API_KEY")
	if err != nil {
		return err
	}
	embeddingModel := environmentOr("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
	defer cancel()
	db, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		return fmt.Errorf("conectar ao Neon: %w", err)
	}
	defer db.Close()

	fmt.Println("Aplicando migração do pgvector...")
	if err := runMigration(ctx, db, filepath.Join(root, "db/migrations/001_portfolio_rag.sql")); err != nil {
		return err
	}

	data, err := os.ReadFile(filepath.Join(root, "data/portfolio.json"))
	if err != nil {
		return fmt.Errorf("ler corpus: %w", err)
	}
	var chunks []portfolioChunk
	if err := json.Unmarshal(data, &chunks); err != nil {
		return fmt.Errorf("decodificar corpus: %w", err)
	}
	if len(chunks) == 0 {
		return fmt.Errorf("o corpus está vazio")
	}

	fmt.Printf("Gerando embeddings para %d trechos com %s...\n", len(chunks), embeddingModel)
	inputs := make([]string, len(chunks))
	for index, chunk := range chunks {
		inputs[index] = chunk.Title + "\n" + chunk.Content
	}
	openAI := capivara.NewOpenAIClient(apiKey, nil)
	embeddings, err := openAI.Embeddings(ctx, embeddingModel, inputs, embeddingDimensions)
	if err != nil {
		return fmt.Errorf("gerar embeddings: %w", err)
	}

	for index, chunk := range chunks {
		metadata, err := json.Marshal(chunk.Metadata)
		if err != nil {
			return fmt.Errorf("codificar metadata de %s: %w", chunk.Slug, err)
		}
		vector, err := json.Marshal(embeddings[index])
		if err != nil {
			return fmt.Errorf("codificar embedding de %s: %w", chunk.Slug, err)
		}
		_, err = db.Exec(ctx, `INSERT INTO portfolio_chunks (slug, title, content, source, metadata, embedding)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::vector)
       ON CONFLICT (slug) DO UPDATE SET
         title = EXCLUDED.title,
         content = EXCLUDED.content,
         source = EXCLUDED.source,
         metadata = EXCLUDED.metadata,
         embedding = EXCLUDED.embedding,
         updated_at = NOW()`, chunk.Slug, chunk.Title, chunk.Content, chunk.Source, string(metadata), string(vector))
		if err != nil {
			return fmt.Errorf("salvar %s: %w", chunk.Slug, err)
		}
		fmt.Printf("  ✓ %s\n", chunk.Slug)
	}

	var count int
	if err := db.QueryRow(ctx, "SELECT COUNT(*)::int FROM portfolio_chunks").Scan(&count); err != nil {
		return fmt.Errorf("contar trechos: %w", err)
	}
	fmt.Printf("RAG pronto: %d trechos disponíveis no Neon.\n", count)
	return nil
}

func runMigration(ctx context.Context, db *pgxpool.Pool, path string) error {
	contents, err := os.ReadFile(path)
	if err != nil {
		return fmt.Errorf("ler migração: %w", err)
	}
	for _, statement := range strings.Split(string(contents), ";") {
		statement = strings.TrimSpace(statement)
		if statement == "" {
			continue
		}
		if _, err := db.Exec(ctx, statement); err != nil {
			return fmt.Errorf("aplicar migração: %w", err)
		}
	}
	return nil
}

func projectRoot() (string, error) {
	directory, err := os.Getwd()
	if err != nil {
		return "", fmt.Errorf("obter diretório atual: %w", err)
	}
	for {
		if _, err := os.Stat(filepath.Join(directory, "go.mod")); err == nil {
			return directory, nil
		}
		parent := filepath.Dir(directory)
		if parent == directory {
			return "", fmt.Errorf("go.mod não encontrado")
		}
		directory = parent
	}
}

func loadEnvironment(path string) error {
	file, err := os.Open(path)
	if os.IsNotExist(err) {
		return nil
	}
	if err != nil {
		return fmt.Errorf("abrir %s: %w", path, err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		name, value, found := strings.Cut(line, "=")
		if !found {
			continue
		}
		name = strings.TrimSpace(strings.TrimPrefix(name, "export "))
		value = strings.Trim(strings.TrimSpace(value), "\"'")
		if name != "" && os.Getenv(name) == "" {
			if err := os.Setenv(name, value); err != nil {
				return fmt.Errorf("definir %s: %w", name, err)
			}
		}
	}
	if err := scanner.Err(); err != nil {
		return fmt.Errorf("ler %s: %w", path, err)
	}
	return nil
}

func requireEnvironment(name string) (string, error) {
	value := strings.TrimSpace(os.Getenv(name))
	if value == "" {
		return "", fmt.Errorf("defina %s antes de executar a ingestão", name)
	}
	return value, nil
}

func environmentOr(name, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(name)); value != "" {
		return value
	}
	return fallback
}
