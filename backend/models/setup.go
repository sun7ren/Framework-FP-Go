package models

import (
	"time"
)

type User struct {
	UID      string  `gorm:"primaryKey;column:U_ID;type:varchar(36)" json:"u_id"`
	Username string  `gorm:"column:U_Username;type:varchar(50);unique" json:"username"`
	Password string  `gorm:"column:U_Password;type:varchar(255)" json:"-"`
	Role     string  `gorm:"column:U_Role;type:varchar(20)" json:"role"`
	Height   float64 `gorm:"column:U_Height;type:decimal(5,2)" json:"height"`
	Weight   float64 `gorm:"column:U_Weight;type:decimal(5,2)" json:"weight"`
	Age      int     `gorm:"column:U_Age;type:int" json:"age"`
	Gender   string  `gorm:"column:U_Gender;type:varchar(10)" json:"gender"`
	BMI      float64 `gorm:"column:U_BMI;type:decimal(5,2)" json:"bmi"`
	BMR      float64 `gorm:"column:U_BMR;type:decimal(8,2)" json:"bmr"`
}

type DailyIntake struct {
	DIID            string    `gorm:"primaryKey;column:DI_ID;type:varchar(50)" json:"di_id"`
	DIDate          time.Time `gorm:"column:DI_Date;type:date" json:"di_date"`
	DITotalCalories int       `gorm:"column:DI_TotalCalories;type:int;default:0" json:"total_calories"`
	DIIsLocked      bool      `gorm:"column:DI_isLocked;type:boolean;default:false" json:"is_locked"`
	CustomerUserID  string    `gorm:"column:CustomerUsers_U_ID;type:varchar(50)" json:"user_id"`

	CustomerUser User      `gorm:"foreignKey:CustomerUserID;references:UID" json:"customer_user"`
	Meals        []Meal    `gorm:"foreignKey:DailyIntakeID" json:"meals"`
	Comments     []Comment `gorm:"foreignKey:DailyIntakeID" json:"comments"`
}

type Meal struct {
	MID           string `gorm:"primaryKey;column:M_ID;type:varchar(50)" json:"M_ID"`
	MFoodName     string `gorm:"column:M_FoodName;type:varchar(100)" json:"food_name"`
	MCalories     int    `gorm:"column:M_Calories;type:int" json:"calories"`
	DailyIntakeID string `gorm:"column:Daily_Intakes_DI_ID;type:varchar(20)" json:"di_id"`
	Time          string `json:"time" gorm:"column:time"`
	UID           string `gorm:"column:U_ID" json:"user_id"`
}

type Comment struct {
	CID            uint   `gorm:"primaryKey;autoIncrement" json:"c_id"`
	CContent       string `gorm:"column:C_Content;type:varchar(150)" json:"content"`
	NutritionistID string `gorm:"column:NutritionistUsers_U_ID;type:varchar(20)" json:"nutritionist_id"`
	DailyIntakeID  string `gorm:"column:Daily_Intakes_DI_ID;type:varchar(20)" json:"di_id"`

	Nutritionist User `gorm:"foreignKey:NutritionistID;references:UID" json:"nutritionist"`
}
