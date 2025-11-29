package controllers

import (
	"errors"
	"fp-pbkk/config"
	"fp-pbkk/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MealInput struct {
	FoodName string `json:"food_name" binding:"required"`
	Calories int    `json:"calories" binding:"required"`
	Time     string `json:"time"`
}

// GET /api/intake
func GetOrCreateTodayIntake(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthenticated"})
		return
	}

	todayStr := time.Now().Format("2006-01-02")

	var intake models.DailyIntake
	err := config.DB.
		Preload("Meals").
		Preload("Comments").
		Where("CustomerUsers_U_ID = ? AND DATE(DI_Date) = ?", userID, todayStr).
		First(&intake).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		intake = models.DailyIntake{
			DIID:            uuid.New().String(),
			DIDate:          time.Now(),
			DITotalCalories: 0,
			DIIsLocked:      false,
			CustomerUserID:  userID,
		}
		if createErr := config.DB.Create(&intake).Error; createErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create intake: " + createErr.Error()})
			return
		}
		// reload with preloads (meals empty)
		config.DB.Preload("Meals").Preload("Comments").First(&intake, "DI_ID = ?", intake.DIID)
		c.JSON(http.StatusOK, intake)
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, intake)
}

// GetDailyIntake (get intake by date query)
// GET /api/intake?date=YYYY-MM-DD
func GetDailyIntake(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthenticated"})
		return
	}

	dateStr := c.Query("date")
	if dateStr == "" {
		dateStr = time.Now().Format("2006-01-02")
	}

	if _, err := time.Parse("2006-01-02", dateStr); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date format, use YYYY-MM-DD"})
		return
	}

	var intake models.DailyIntake
	err := config.DB.
		Preload("Meals").
		Preload("Comments").
		Where("CustomerUsers_U_ID = ? AND DATE(DI_Date) = ?", userID, dateStr).
		First(&intake).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		parsedDate, _ := time.Parse("2006-01-02", dateStr)
		newIntake := models.DailyIntake{
			DIID:            uuid.New().String(),
			DIDate:          parsedDate,
			DITotalCalories: 0,
			DIIsLocked:      false,
			CustomerUserID:  userID,
		}
		if err := config.DB.Create(&newIntake).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create intake: " + err.Error()})
			return
		}
		config.DB.Preload("Meals").Preload("Comments").First(&newIntake, "DI_ID = ?", newIntake.DIID)
		c.JSON(http.StatusOK, newIntake)
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, intake)
}

// AddMeal
// POST /api/intake/:di_id/meal
func AddMeal(c *gin.Context) {
	diID := c.Param("di_id")
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthenticated"})
		return
	}
	if diID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "di_id required"})
		return
	}

	var intake models.DailyIntake
	if err := config.DB.Where("DI_ID = ? AND CustomerUsers_U_ID = ?", diID, userID).First(&intake).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "daily intake not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if intake.DIIsLocked {
		c.JSON(http.StatusForbidden, gin.H{"error": "this intake is locked"})
		return
	}

	var input MealInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload: " + err.Error()})
		return
	}

	mealTime := input.Time
	if mealTime == "" {
		mealTime = time.Now().Format("15:04")
	}

	newMeal := models.Meal{
		MID:           uuid.New().String(),
		MFoodName:     input.FoodName,
		MCalories:     input.Calories,
		DailyIntakeID: intake.DIID,
		Time:          mealTime,
		UID:           userID,
	}

	if err := config.DB.Create(&newMeal).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create meal: " + err.Error()})
		return
	}

	if err := config.DB.Model(&models.DailyIntake{}).
		Where("DI_ID = ?", intake.DIID).
		UpdateColumn("DI_TotalCalories", gorm.Expr("DI_TotalCalories + ?", newMeal.MCalories)).Error; err != nil {
		_ = config.DB.Delete(&newMeal).Error
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update intake calories: " + err.Error()})
		return
	}

	var updated models.DailyIntake
	if err := config.DB.Preload("Meals").Preload("Comments").First(&updated, "DI_ID = ?", intake.DIID).Error; err != nil {
		c.JSON(http.StatusCreated, gin.H{"message": "meal created but failed to fetch updated intake", "meal": newMeal})
		return
	}

	c.JSON(http.StatusCreated, updated)
}

// DeleteMeal
// DELETE /api/intake/meal/:meal_id
func DeleteMeal(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthenticated"})
		return
	}

	mealID := c.Param("meal_id")
	if mealID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "meal_id required"})
		return
	}

	var meal models.Meal
	if err := config.DB.Where("M_ID = ? AND U_ID = ?", mealID, userID).First(&meal).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "meal not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var intake models.DailyIntake
	if err := config.DB.First(&intake, "DI_ID = ?", meal.DailyIntakeID).Error; err != nil {
		if delErr := config.DB.Delete(&meal).Error; delErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete meal: " + delErr.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "meal deleted (parent intake missing)"})
		return
	}

	if intake.DIIsLocked {
		c.JSON(http.StatusForbidden, gin.H{"error": "this intake is locked; cannot delete meal"})
		return
	}

	if err := config.DB.Model(&models.DailyIntake{}).
		Where("DI_ID = ?", intake.DIID).
		UpdateColumn("DI_TotalCalories", gorm.Expr("GREATEST(DI_TotalCalories - ?, 0)", meal.MCalories)).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update intake calories: " + err.Error()})
		return
	}

	if err := config.DB.Delete(&meal).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete meal: " + err.Error()})
		return
	}

	if err := config.DB.Preload("Meals").First(&intake, "DI_ID = ?", meal.DailyIntakeID).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "meal deleted", "new_total_calories": intake.DITotalCalories})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "meal deleted", "intake": intake})
}

// LockIntake
// PATCH /api/intake/:di_id/lock
// Locks an intake (only owner) so it cannot be edited later.
func LockIntake(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthenticated"})
		return
	}

	diID := c.Param("di_id")
	if diID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "di_id required"})
		return
	}

	var intake models.DailyIntake
	if err := config.DB.Where("DI_ID = ? AND CustomerUsers_U_ID = ?", diID, userID).First(&intake).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "daily intake not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if intake.DIIsLocked {
		c.JSON(http.StatusBadRequest, gin.H{"message": "this intake is already locked"})
		return
	}

	intake.DIIsLocked = true
	if err := config.DB.Save(&intake).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to lock intake: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "daily intake locked successfully"})
}
