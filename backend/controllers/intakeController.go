package controllers

import (
	"fp-pbkk/config"
	"fp-pbkk/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// Input for adding a meal
type MealInput struct {
	FoodName string `json:"food_name" binding:"required"`
	Calories int    `json:"calories" binding:"required"`
}

// GET /api/intake?date=2023-11-22
func GetDailyIntake(c *gin.Context) {
	userID, _ := c.Get("user_id")
	dateStr := c.Query("date") // Expected format: YYYY-MM-DD

	// Parse the date
	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format (Use YYYY-MM-DD)"})
		return
	}

	var intake models.DailyIntake

	// Try to find the intake record for this User + Date
	err = config.DB.Preload("Meals").Preload("Comments").
		Where("CustomerUsers_U_ID = ? AND DI_Date = ?", userID, date).
		First(&intake).Error

	if err != nil {
		// IF not found AND the requested date is TODAY, create it automatically!
		today := time.Now().Truncate(24 * time.Hour)
		requestedDate := date.Truncate(24 * time.Hour)

		if requestedDate.Equal(today) {
			// Create new Daily Intake
			newIntake := models.DailyIntake{
				DIID:            "DI" + time.Now().Format("020106") + userID.(string), // Simple ID generation
				DIDate:          date,
				DITotalCalories: 0,
				DIIsLocked:      false,
				CustomerUserID:  userID.(string),
			}
			config.DB.Create(&newIntake)
			c.JSON(http.StatusOK, newIntake)
			return
		}

		// If it's a past date and doesn't exist, return 404
		c.JSON(http.StatusNotFound, gin.H{"message": "No log found for this date"})
		return
	}

	c.JSON(http.StatusOK, intake)
}

// POST /api/intake/:di_id/meal
func AddMeal(c *gin.Context) {
	diID := c.Param("di_id")
	var input MealInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 1. Check if Intake exists and is NOT locked
	var intake models.DailyIntake
	if err := config.DB.First(&intake, "DI_ID = ?", diID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Daily Intake not found"})
		return
	}

	if intake.DIIsLocked {
		c.JSON(http.StatusForbidden, gin.H{"error": "This log is locked and cannot be edited"})
		return
	}

	// 2. Create the Meal
	meal := models.Meal{
		MID:           "M" + time.Now().Format("150405"), // Simple ID based on time
		MFoodName:     input.FoodName,
		MCalories:     input.Calories,
		DailyIntakeID: diID,
	}

	if err := config.DB.Create(&meal).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add meal"})
		return
	}

	// 3. Update Total Calories in DailyIntake
	intake.DITotalCalories += input.Calories
	config.DB.Save(&intake)

	c.JSON(http.StatusOK, gin.H{"message": "Meal added", "data": meal})
}

// PATCH /api/intake/:di_id/lock
func LockIntake(c *gin.Context) {
	diID := c.Param("di_id")

	// 1. Find the Intake
	var intake models.DailyIntake
	if err := config.DB.First(&intake, "DI_ID = ?", diID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Daily Intake not found"})
		return
	}

	// 2. Check if already locked
	if intake.DIIsLocked {
		c.JSON(http.StatusBadRequest, gin.H{"message": "This log is already locked"})
		return
	}

	// 3. Lock it
	intake.DIIsLocked = true
	config.DB.Save(&intake)

	c.JSON(http.StatusOK, gin.H{"message": "Daily intake locked successfully. Good job today!"})
}

// DELETE /api/intake/meal/:meal_id
func DeleteMeal(c *gin.Context) {
	mealID := c.Param("meal_id")

	// 1. Find the Meal
	var meal models.Meal
	if err := config.DB.First(&meal, "M_ID = ?", mealID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Meal not found"})
		return
	}

	// 2. Find the associated Intake to check if it's locked
	var intake models.DailyIntake
	config.DB.First(&intake, "DI_ID = ?", meal.DailyIntakeID)

	if intake.DIIsLocked {
		c.JSON(http.StatusForbidden, gin.H{"error": "This log is locked. You cannot delete items."})
		return
	}

	// 3. Deduct calories from the daily total
	intake.DITotalCalories -= meal.MCalories
	config.DB.Save(&intake)

	// 4. Delete the meal
	config.DB.Delete(&meal)

	c.JSON(http.StatusOK, gin.H{"message": "Meal deleted successfully", "new_total_calories": intake.DITotalCalories})
}
