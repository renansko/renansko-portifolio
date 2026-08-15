package capivara

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

const openAIBaseURL = "https://api.openai.com/v1"

type OpenAIClient struct {
	apiKey string
	client *http.Client
}

func NewOpenAIClient(apiKey string, client *http.Client) *OpenAIClient {
	if client == nil {
		client = &http.Client{Timeout: 25 * time.Second}
	}
	return &OpenAIClient{apiKey: apiKey, client: client}
}

func (c *OpenAIClient) Embedding(ctx context.Context, model, input string, dimensions int) ([]float32, error) {
	payload := map[string]any{
		"model": model, "input": input, "encoding_format": "float", "dimensions": dimensions,
	}
	var response struct {
		Data []struct {
			Embedding []float32 `json:"embedding"`
		} `json:"data"`
	}
	if err := c.post(ctx, "/embeddings", payload, &response); err != nil {
		return nil, err
	}
	if len(response.Data) == 0 || len(response.Data[0].Embedding) == 0 {
		return nil, fmt.Errorf("OpenAI returned an empty embedding")
	}
	return response.Data[0].Embedding, nil
}

func (c *OpenAIClient) Embeddings(ctx context.Context, model string, input []string, dimensions int) ([][]float32, error) {
	payload := map[string]any{
		"model": model, "input": input, "encoding_format": "float", "dimensions": dimensions,
	}
	var response struct {
		Data []struct {
			Index     int       `json:"index"`
			Embedding []float32 `json:"embedding"`
		} `json:"data"`
	}
	if err := c.post(ctx, "/embeddings", payload, &response); err != nil {
		return nil, err
	}
	result := make([][]float32, len(input))
	for _, item := range response.Data {
		if item.Index < 0 || item.Index >= len(result) {
			return nil, fmt.Errorf("OpenAI returned an invalid embedding index")
		}
		result[item.Index] = item.Embedding
	}
	for _, embedding := range result {
		if len(embedding) == 0 {
			return nil, fmt.Errorf("OpenAI returned an unexpected number of embeddings")
		}
	}
	return result, nil
}

func (c *OpenAIClient) Response(ctx context.Context, model, instructions string, input []HistoryItem) (string, error) {
	payload := map[string]any{
		"model": model, "instructions": instructions, "input": input,
		"max_output_tokens": 450, "store": false,
	}
	if strings.HasPrefix(model, "gpt-5.6") {
		payload["reasoning"] = map[string]string{"effort": "none"}
	}
	var response struct {
		Output []struct {
			Type    string `json:"type"`
			Content []struct {
				Type string `json:"type"`
				Text string `json:"text"`
			} `json:"content"`
		} `json:"output"`
	}
	if err := c.post(ctx, "/responses", payload, &response); err != nil {
		return "", err
	}
	var answer strings.Builder
	for _, output := range response.Output {
		if output.Type != "message" {
			continue
		}
		for _, content := range output.Content {
			if content.Type == "output_text" {
				answer.WriteString(content.Text)
			}
		}
	}
	if strings.TrimSpace(answer.String()) == "" {
		return "", fmt.Errorf("OpenAI returned an empty response")
	}
	return strings.TrimSpace(answer.String()), nil
}

func (c *OpenAIClient) post(ctx context.Context, path string, payload, target any) error {
	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("encode OpenAI request: %w", err)
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, openAIBaseURL+path, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("create OpenAI request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("Content-Type", "application/json")

	res, err := c.client.Do(req)
	if err != nil {
		return fmt.Errorf("call OpenAI: %w", err)
	}
	defer res.Body.Close()
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		message, _ := io.ReadAll(io.LimitReader(res.Body, 4096))
		return fmt.Errorf("OpenAI returned %s: %s", res.Status, strings.TrimSpace(string(message)))
	}
	if err := json.NewDecoder(res.Body).Decode(target); err != nil {
		return fmt.Errorf("decode OpenAI response: %w", err)
	}
	return nil
}
