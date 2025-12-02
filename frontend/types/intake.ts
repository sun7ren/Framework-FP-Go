export interface Meal {
  M_ID: string;
  food_name: string;
  calories: number;
  time: string;
}

export interface IntakeResponse {
  di_id: string;
  di_date: string; 
  total_calories: number;
  is_locked?: boolean;
  user_id?: string;
  meals: Meal[];
}