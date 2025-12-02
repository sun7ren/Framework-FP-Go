package config

import (
	"fmt"
	"log"
	"os"

	"fp-pbkk/models"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	user := os.Getenv("DB_USER")
	pass := os.Getenv("DB_PASS")
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	name := os.Getenv("DB_NAME")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		user, pass, host, port, name,
	)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to DB: ", err)
	}

	DB = db

	db.AutoMigrate(
		&models.User{},
		&models.DailyIntake{},
		&models.Meal{},
		&models.Comment{},
	)

	fmt.Println("Database connected!")
}
