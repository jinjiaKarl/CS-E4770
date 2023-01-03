package routers

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"shortener/db"

	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
)

func NewRouter() *gin.Engine {
	r := gin.New()
	r.Use(static.Serve("/", static.LocalFile("build", true))) // load index.html

	r.POST("/shorten", shorten)
	r.GET("/:shortenid", redirect)
	r.GET("/random", random)
	r.GET("/testing", testing)

	return r
}

func shorten(c *gin.Context) {
	body, _ := ioutil.ReadAll(c.Request.Body)
	data := make(map[string]string)
	err := json.Unmarshal(body, &data)
	if err != nil {
		fmt.Println(err)
		c.JSON(500, gin.H{
			"message": "invalid json",
		})
		return
	}
	if lurl, ok := data["url"]; ok {
		var surl string
		var err error
		if db.GetCfg().Method == "db" {
			surl, err = generateShortendUrlByDB(lurl)
		} else {
			surl, err = generateShortendUrlByRandomString(lurl)
		}
		if err != nil {
			fmt.Println(err)
			c.JSON(500, gin.H{
				"message": "internal error",
			})
			return
		}
		c.JSON(200, gin.H{
			"url": surl,
		})
		return
	}
	c.JSON(500, gin.H{
		"message": "ineranl error",
	})
}

func redirect(c *gin.Context) {
	//surl := db.GetCfg().Protocol + "://" + c.Request.Host + c.Request.URL.Path // 如果数据库存储整个url
	surl := c.Param("shortenid")
	lurl, err := getLongUrlBySurl(surl)
	if err != nil {
		fmt.Println(err)
		c.JSON(500, gin.H{
			"message": "internal error",
		})
		return
	}
	c.Redirect(302, lurl)
}

func random(c *gin.Context) {
	urlMap, err := db.FindRandom(context.Background())
	if err != nil {
		fmt.Println(err)
		c.JSON(500, gin.H{
			"message": "internal error",
		})
		return
	}
	c.Redirect(302, urlMap.Lurl)
}

func testing(c *gin.Context) {
	err := db.TruncateTable(context.Background())
	if err != nil {
		fmt.Println(err)
		c.JSON(500, gin.H{
			"message": "internal error",
		})
		return
	}
	c.JSON(200, gin.H{
		"message": "ok",
	})
}
