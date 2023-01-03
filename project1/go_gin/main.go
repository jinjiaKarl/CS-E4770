package main

import (
	"math/rand"
	"net/http"
	"shortener/db"
	"shortener/routers"
	"time"
)

func main() {
	rand.Seed(time.Now().UnixNano())
	db.ParseCfg()
	cfg := db.GetCfg()
	db.ConnectToDB()

	r := routers.NewRouter()
	// r.Run(":" + cfg.ServerPort)
	s := &http.Server{
		Addr:    ":" + cfg.ServerPort,
		Handler: r,
	}
	s.ListenAndServe()
}
