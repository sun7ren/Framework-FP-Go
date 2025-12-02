export interface Meal {
  M_ID: string;
  food_name: string;
  calories: number;
  time: string;
}

export interface Comment {
  c_id: number;
  content: string;
  nutritionist_id: string;
  di_id: string;
  nutritionist: {
    username: string;
  };
}

export interface IntakeResponse {
  di_id: string;
  di_date: string;
  total_calories: number;
  is_locked?: boolean;
  user_id?: string;
  meals: Meal[];
  comments: Comment[];
}