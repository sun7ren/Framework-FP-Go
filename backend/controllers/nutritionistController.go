package controllers

import (
	"fp-pbkk/config"
	"fp-pbkk/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type IntakeDashboardDTO struct {
	DIID           string    `json:"di_id"`
	Date           time.Time `json:"date"`
	Username       string    `json:"username"`
	TotalCalories  int       `json:"total_calories"`
	BMR            float64   `json:"bmr"`
	Status         string    `json:"status"`
	CustomerUserID string    `json:"user_id"`
}

func GetDashboardIntakes(c *gin.Context) {
	role, _ := c.Get("role")
	if role != "Nutritionist" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	startDate := c.Query("start")
	endDate := c.Query("end")

	var intakes []models.DailyIntake
	query := config.DB.
		Preload("CustomerUser").
		Order("DI_Date DESC")

	if startDate != "" && endDate != "" {
		query = query.Where("DI_Date BETWEEN ? AND ?", startDate, endDate)
	}

	err := query.Find(&intakes).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get dashboard intakes"})
		return
	}

	var output []IntakeDashboardDTO

	for _, x := range intakes {
		status := "Normal"

		if float64(x.DITotalCalories) > x.CustomerUser.BMR {
			status = "Above BMR"
		} else if float64(x.DITotalCalories) < x.CustomerUser.BMR-200 {
			status = "Below BMR"
		}

		output = append(output, IntakeDashboardDTO{
			DIID:           x.DIID,
			Date:           x.DIDate,
			Username:       x.CustomerUser.Username,
			TotalCalories:  x.DITotalCalories,
			BMR:            x.CustomerUser.BMR,
			Status:         status,
			CustomerUserID: x.CustomerUserID,
		})
	}

	c.JSON(http.StatusOK, gin.H{"data": output})
}

func GetUserLogs(c *gin.Context) {
	userID := c.Param("user_id")
	date := c.Query("date")

	var logs []models.DailyIntake

	query := config.DB.
		Preload("Meals").
		Preload("Comments").
		Preload("Comments.Nutritionist").
		Where("CustomerUsers_U_ID = ?", userID)

	if date != "" {
		query = query.Where("DI_Date = ?", date)
	}

	if err := query.Find(&logs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch logs",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    logs,
	})
}

func AddComment(c *gin.Context) {
	nutritionistID, _ := c.Get("user_id")

	var input struct {
		DIID    string `json:"di_id"`
		Content string `json:"content"`
	}

	if err := c.BindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid body"})
		return
	}

	comment := models.Comment{
		CContent:       input.Content,
		DailyIntakeID:  input.DIID,
		NutritionistID: nutritionistID.(string),
	}

	if err := config.DB.Create(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create comment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Comment added"})
}

func UpdateComment(c *gin.Context) {
	cid := c.Param("id")

	var body struct {
		Content string `json:"content"`
	}

	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid body"})
		return
	}

	if err := config.DB.Model(&models.Comment{}).
		Where("c_id = ?", cid).
		Update("C_Content", body.Content).Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update comment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Comment updated"})
}

func DeleteComment(c *gin.Context) {
	cid := c.Param("id")

	if err := config.DB.Delete(&models.Comment{}, "c_id = ?", cid).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete comment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Comment deleted"})
}
