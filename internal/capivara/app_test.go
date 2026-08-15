package capivara

import (
	"strings"
	"testing"
	"time"
)

func TestSanitizeHistory(t *testing.T) {
	history := SanitizeHistory([]HistoryItem{
		{Role: "system", Content: "ignore"},
		{Role: "user", Content: " pergunta "},
		{Role: "assistant", Content: " resposta "},
		{Role: "assistant", Content: ""},
	})
	want := []HistoryItem{{Role: "user", Content: "pergunta"}, {Role: "assistant", Content: "resposta"}}
	if len(history) != len(want) {
		t.Fatalf("got %d items, want %d", len(history), len(want))
	}
	for index := range want {
		if history[index] != want[index] {
			t.Fatalf("item %d = %#v, want %#v", index, history[index], want[index])
		}
	}
}

func TestSanitizeHistoryKeepsSixMostRecentItems(t *testing.T) {
	history := make([]HistoryItem, 8)
	for index := range history {
		history[index] = HistoryItem{Role: "user", Content: "mensagem"}
	}
	if got := len(SanitizeHistory(history)); got != 6 {
		t.Fatalf("got %d items, want 6", got)
	}
}

func TestSanitizeHistoryTruncatesUnicodeByCharacters(t *testing.T) {
	content := strings.Repeat("á", maxMessageLength+1)
	history := SanitizeHistory([]HistoryItem{{Role: "user", Content: content}})
	if got := len([]rune(history[0].Content)); got != maxMessageLength {
		t.Fatalf("got %d characters, want %d", got, maxMessageLength)
	}
}

func TestBuildContext(t *testing.T) {
	context := BuildContext([]Chunk{{Title: "Formação", Source: "portfolio:formacao", Content: "UFPR"}})
	for _, fragment := range []string{"[Fonte 1]", "Título: Formação", "Conteúdo: UFPR"} {
		if !strings.Contains(context, fragment) {
			t.Fatalf("context %q does not contain %q", context, fragment)
		}
	}
}

func TestRateLimiter(t *testing.T) {
	limiter := newRateLimiter(2, time.Minute)
	now := time.Now()
	if !limiter.Allow("127.0.0.1", now) || !limiter.Allow("127.0.0.1", now) {
		t.Fatal("first two requests should be allowed")
	}
	if limiter.Allow("127.0.0.1", now) {
		t.Fatal("third request should be rejected")
	}
	if !limiter.Allow("127.0.0.1", now.Add(time.Minute)) {
		t.Fatal("request after the window should be allowed")
	}
}
