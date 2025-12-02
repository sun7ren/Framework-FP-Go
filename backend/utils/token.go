package utils

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var SecretKey = []byte("CaloriSyncSuperSecretKey2025")

func GenerateToken(userId string, role string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userId,
		"role":    role,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(SecretKey)
}
