package db

import (
	"encoding/json"
	"io/ioutil"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var cfg *config
var db *gorm.DB
var err error

type postgresConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Database string
}

type config struct {
	Postgres        postgresConfig
	ServerPort      string
	ShortenedDomain string
	Protocol        string
	Method          string
	Env             string
}

func ParseCfg() {
	bytes, err := ioutil.ReadFile("./cfg.json")
	if err != nil {
		panic(err)
	}
	cfg = &config{}
	err = json.Unmarshal(bytes, cfg)
	if err != nil {
		panic(err)
	}
}

func ConnectToDB() {
	if cfg.Env == "docker" {
		cfg.Postgres.Host = "postgres-database"
	}
	dsn := "host=" + cfg.Postgres.Host + " user=" + cfg.Postgres.User + " password=" + cfg.Postgres.Password + " dbname=" + cfg.Postgres.Database + " port=" + cfg.Postgres.Port + " sslmode=disable TimeZone=Europe/Moscow"
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		//Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		panic(err)
	}
}

func GetDBConn() *gorm.DB {
	return db
}

func GetCfg() *config {
	return cfg
}
