package routes

import (
	"fp-pbkk/controllers"
	"fp-pbkk/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	public := r.Group("/api")
	{
		public.POST("/register", controllers.Register)
		public.POST("/login", controllers.Login)
	}

	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/me", controllers.GetCurrentUser)
		protected.PUT("/profile", controllers.UpdateProfile)
		protected.GET("/profile/info", controllers.GetProfile)

		// Intake Routes
		protected.GET("/intake", controllers.GetDailyIntake)

		protected.POST("/intake/:di_id/meal", controllers.AddMeal)
		protected.PATCH("/intake/:di_id/lock", controllers.LockIntake)
		protected.DELETE("/intake/meal/:meal_id/delete", controllers.DeleteMeal)
		protected.PUT("/intake/meal/:meal_id/edit", controllers.EditMeal)

		// Nutritionist Routes
		protected.GET("/nutritionist/intakes", controllers.GetDashboardIntakes)
		protected.GET("/logs/:user_id", controllers.GetUserLogs)

		// protected.POST("/nutritionist/comment", controllers.AddComment)
	}
}
