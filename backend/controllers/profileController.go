package controllers

import (
	"fp-pbkk/config"
	"fp-pbkk/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ProfileInput struct {
	Height float64 `json:"height"`
	Weight float64 `json:"weight"`
	Age    int     `json:"age"`
	Gender string  `json:"gender"`
	BMI    float64 `json:"bmi"`
	BMR    float64 `json:"bmr"`
}

func UpdateProfile(c *gin.Context) {
	uidInterface, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	uid, ok := uidInterface.(string)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID in token"})
		return
	}

	var input ProfileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input format: " + err.Error()})
		return
	}

	var user models.User
	if err := config.DB.Where("U_ID = ?", uid).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User profile not found"})
		return
	}

	// Update
	user.Height = input.Height
	user.Weight = input.Weight
	user.Age = input.Age
	user.Gender = input.Gender

	// Recalculate BMI/BMR
	heightM := user.Height / 100
	user.BMI = user.Weight / (heightM * heightM)

	if user.Gender == "male" {
		user.BMR = 10*user.Weight + 6.25*user.Height - 5*float64(user.Age) + 5
	} else {
		user.BMR = 10*user.Weight + 6.25*user.Height - 5*float64(user.Age) - 161
	}

	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Profile change successful!",
		"data":    user,
	})
}
