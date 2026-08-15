package handler

import (
	"log"
	"net/http"
	"sync"

	"github.com/renansko/renansko-portfolio/internal/capivara"
)

var (
	appOnce sync.Once
	app     *capivara.App
	appErr  error
)

// Handler is the entry point detected by Vercel's Go runtime.
func Handler(w http.ResponseWriter, r *http.Request) {
	appOnce.Do(func() {
		app, appErr = capivara.NewFromEnvironment(r.Context())
	})

	if appErr != nil {
		log.Printf("Capivara initialization error: %v", appErr)
		capivara.WriteUnavailable(w)
		return
	}

	app.ServeHTTP(w, r)
}
