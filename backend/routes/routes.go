package routes

import (
	"fp-pbkk/controllers"
	"fp-pbkk/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	// Public Routes (No Token Needed)
	public := r.Group("/api")
	{
		public.POST("/register", controllers.Register)
		public.POST("/login", controllers.Login)
	}

	// Protected Routes (Token Required)
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/me", controllers.GetCurrentUser)
		protected.PUT("/profile", controllers.UpdateProfile)

		// Intake Routes
		// protected.GET("/intake", controllers.GetDailyIntake)
		protected.GET("/intake", controllers.GetOrCreateTodayIntake)
		protected.POST("/intake/:di_id/meal", controllers.AddMeal)        // Add Meal to Log
		protected.PATCH("/intake/:di_id/lock", controllers.LockIntake)    // Lock the intake
		protected.DELETE("/intake/meal/:meal_id", controllers.DeleteMeal) // Delete Meal

		// Nutritionist Routes
		protected.GET("/nutritionist/intakes", controllers.GetAllIntakes)
		protected.POST("/nutritionist/comment", controllers.AddComment)
	}
}
