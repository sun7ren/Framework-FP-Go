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

// GET TODAY INTAKE
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
		config.DB.Create(&intake)
		config.DB.Preload("Meals").Preload("Comments").First(&intake, "DI_ID = ?", intake.DIID)
		c.JSON(http.StatusOK, intake)
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, intake)
}

// GET INTAKE BY DATE
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
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date format"})
		return
	}

	var intake models.DailyIntake
	err := config.DB.
		Preload("Meals").
		Preload("Comments").
		Where("CustomerUsers_U_ID = ? AND DATE(DI_Date) = ?", userID, dateStr).
		First(&intake).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		parsed, _ := time.Parse("2006-01-02", dateStr)
		newIntake := models.DailyIntake{
			DIID:            uuid.New().String(),
			DIDate:          parsed,
			DITotalCalories: 0,
			DIIsLocked:      false,
			CustomerUserID:  userID,
		}
		config.DB.Create(&newIntake)
		config.DB.Preload("Meals").Preload("Comments").First(&newIntake)
		c.JSON(http.StatusOK, newIntake)
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, intake)
}

// ADD MEAL
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
	err := config.DB.Where("DI_ID = ? AND CustomerUserID = ?", diID, userID).First(&intake).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": "intake not found"})
		return
	}

	if intake.DIIsLocked {
		c.JSON(http.StatusForbidden, gin.H{"error": "intake locked"})
		return
	}

	var input MealInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
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
		Time:          mealTime,
		DailyIntakeID: diID,
		UID:           userID,
	}

	config.DB.Create(&newMeal)

	config.DB.Model(&models.DailyIntake{}).
		Where("DI_ID = ?", diID).
		Update("DI_TotalCalories", gorm.Expr("DI_TotalCalories + ?", newMeal.MCalories))

	var updated models.DailyIntake
	config.DB.Preload("Meals").Preload("Comments").First(&updated, "DI_ID = ?", diID)

	c.JSON(http.StatusCreated, updated)
}

// DELETE MEAL
func DeleteMeal(c *gin.Context) {
	userID := c.GetString("user_id")
	mealID := c.Param("meal_id")

	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthenticated"})
		return
	}

	var meal models.Meal
	err := config.DB.Where("M_ID = ? AND U_ID = ?", mealID, userID).First(&meal).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	var intake models.DailyIntake
	config.DB.First(&intake, "DI_ID = ?", meal.DailyIntakeID)

	if intake.DIIsLocked {
		c.JSON(http.StatusForbidden, gin.H{"error": "intake locked"})
		return
	}

	config.DB.Model(&models.DailyIntake{}).
		Where("DI_ID = ?", intake.DIID).
		Update("DI_TotalCalories", gorm.Expr("GREATEST(DI_TotalCalories - ?, 0)", meal.MCalories))

	config.DB.Delete(&meal)

	config.DB.Preload("Meals").First(&intake)
	c.JSON(http.StatusOK, gin.H{"message": "meal deleted", "intake": intake})
}

// EDIT MEAL
func EditMeal(c *gin.Context) {
	userID := c.GetString("user_id")
	mealID := c.Param("meal_id")

	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthenticated"})
		return
	}

	var meal models.Meal
	err := config.DB.Where("M_ID = ? AND U_ID = ?", mealID, userID).First(&meal).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": "meal not found"})
		return
	}

	var input MealInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	meal.MFoodName = input.FoodName
	meal.MCalories = input.Calories
	meal.Time = input.Time

	config.DB.Save(&meal)

	var intake models.DailyIntake
	config.DB.Preload("Meals").Preload("Comments").First(&intake, "DI_ID = ?", meal.DailyIntakeID)

	c.JSON(http.StatusOK, intake)
}

// LOCK INTAKE
func LockIntake(c *gin.Context) {
	userID := c.GetString("user_id")
	diID := c.Param("di_id")

	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthenticated"})
		return
	}

	var intake models.DailyIntake
	err := config.DB.Where("DI_ID = ? AND CustomerUsers_U_ID = ?", diID, userID).First(&intake).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": "intake not found"})
		return
	}

	if intake.DIIsLocked {
		c.JSON(http.StatusBadRequest, gin.H{"message": "already locked"})
		return
	}

	intake.DIIsLocked = true
	config.DB.Save(&intake)

	c.JSON(http.StatusOK, gin.H{"message": "locked"})
}
