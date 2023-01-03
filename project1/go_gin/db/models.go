package db

import (
	"context"
)

type UrlMap struct {
	ID   int `gorm:"primaryKey"`
	Lurl string
	Surl string
}

func (UrlMap) TableName() string {
	return "short_url_map"
}

func (u *UrlMap) Create(ctx context.Context) error {
	// if success, u.ID will be set
	return GetDBConn().WithContext(ctx).Create(u).Error
}

func (u *UrlMap) GetBySurl(ctx context.Context) error {
	return GetDBConn().WithContext(ctx).Where("surl = ?", u.Surl).First(u).Error
}

func (u *UrlMap) GetByLurl(ctx context.Context) error {
	return GetDBConn().WithContext(ctx).Where("lurl = ?", u.Lurl).First(u).Error
}

func (u *UrlMap) Update(ctx context.Context) error {
	return GetDBConn().WithContext(ctx).Save(u).Error
}

func FindAll(ctx context.Context) error {
	urls := make([]*UrlMap, 0)
	res := GetDBConn().WithContext(ctx).Find(&urls)
	if res.Error != nil {
		return res.Error
	}
	return nil
}

func FindRandom(ctx context.Context) (*UrlMap, error) {
	url := &UrlMap{}
	res := GetDBConn().WithContext(ctx).Order("random()").First(url)
	if res.Error != nil {
		return nil, res.Error
	}
	return url, nil
}

func TruncateTable(ctx context.Context) error {
	return GetDBConn().WithContext(ctx).Exec("TRUNCATE TABLE short_url_map").Error
}
