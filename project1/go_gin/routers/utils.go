package routers

import (
	"context"
	"errors"
	"fmt"
	"math/rand"
	"shortener/db"

	"math/big"

	"gorm.io/gorm"
)

func getLongUrlBySurl(surl string) (string, error) {
	um := &db.UrlMap{Surl: surl}
	ctx := context.Background()
	err := um.GetBySurl(ctx)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	return um.Lurl, nil
}

func generateShortendUrlByDB(lurl string) (string, error) {
	um := &db.UrlMap{Lurl: lurl}
	ctx := context.Background()
	err := um.GetByLurl(ctx)
	if err == nil && um.Surl != "" {
		surl := db.GetCfg().Protocol + "://" + db.GetCfg().ShortenedDomain + "/" + um.Surl
		return surl, nil
	}
	//
	if errors.Is(err, gorm.ErrRecordNotFound) {
		err = um.Create(ctx)
		if err != nil {
			fmt.Println(err)
			return "", err
		}
	}
	id := big.NewInt(int64(um.ID)).Text(62)
	um.Surl = id
	surl := db.GetCfg().Protocol + "://" + db.GetCfg().ShortenedDomain + "/" + id
	err = um.Update(ctx)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	return surl, nil
}

func generateShortendUrlByRandomString(lurl string) (string, error) {
	um := &db.UrlMap{Lurl: lurl}
	ctx := context.Background()
	err := um.GetByLurl(ctx)
	if err == nil && um.Surl != "" {
		surl := db.GetCfg().Protocol + "://" + db.GetCfg().ShortenedDomain + "/" + um.Surl
		return surl, nil
	}
	// generate random string
	str := getRandomString(8)
	um.Surl = str
	surl := db.GetCfg().Protocol + "://" + db.GetCfg().ShortenedDomain + "/" + str
	err = um.Create(ctx)
	if err == nil {
		return surl, nil

	}
	fmt.Println(err)
	return "", err
	// TODO: conflict, try again
}

func getRandomString(size int) string {
	letters := []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
	b := make([]rune, size)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}
