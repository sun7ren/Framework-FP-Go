package controllers

import (
	"fp-pbkk/config"
	"fp-pbkk/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GET /api/nutritionist/intakes
// View all daily intakes (Dashboard)
func GetAllIntakes(c *gin.Context) {
	// 1. Role Check
	role, _ := c.Get("role")
	if role != "Nutritionist" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied. Nutritionists only."})
		return
	}

	// 2. Fetch all intakes with User details
	var intakes []models.DailyIntake

	// We preload 'Meals' and 'Comments' so the dashboard sees everything
	if err := config.DB.Preload("Meals").Preload("Comments").Find(&intakes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch intakes"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": intakes})
}

// POST /api/nutritionist/comment
type CommentInput struct {
	DailyIntakeID string `json:"di_id" binding:"required"`
	Content       string `json:"content" binding:"required"`
}

func AddComment(c *gin.Context) {
	// 1. Role Check
	role, _ := c.Get("role")
	userID, _ := c.Get("user_id") // This is the Nutritionist's ID

	if role != "Nutritionist" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied. Nutritionists only."})
		return
	}

	var input CommentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 2. Check if Nutritionist already commented on THIS specific intake
	var existingComment models.Comment
	err := config.DB.Where("NutritionistUsers_U_ID = ? AND Daily_Intakes_DI_ID = ?", userID, input.DailyIntakeID).First(&existingComment).Error

	if err == nil {
		// If err is nil, it means a record WAS found
		c.JSON(http.StatusBadRequest, gin.H{"error": "You have already commented on this intake log."})
		return
	}

	// 3. Create the Comment
	comment := models.Comment{
		CContent:       input.Content,
		NutritionistID: userID.(string),
		DailyIntakeID:  input.DailyIntakeID,
	}

	if err := config.DB.Create(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save comment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Comment added successfully!", "data": comment})
}
