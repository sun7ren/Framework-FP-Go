import api from "@/utils/api";
import type { IntakeResponse, Meal } from "@/types/intake";

export async function getTodayIntake(): Promise<IntakeResponse | null> {
  const res = await api.get("/intake/today");
  return res.data;
}

export async function getIntakeByDate(date: string): Promise<IntakeResponse | null> {
  const res = await api.get(`/intake?date=${date}`);
  return res.data;
}

export async function addMeal(intakeId: number, body: any) {
  const res = await api.post(`/intake/${intakeId}/meal`, body);
  return res.data;
}

export async function updateMeal(mealId: number, body: any) {
  const res = await api.put(`/intake/meal/${mealId}/edit`, body);
  return res.data;
}

export async function deleteMeal(mealId: number) {
  const res = await api.delete(`/intake/meal/${mealId}/delete`);
  return res.data;
}

export async function lockIntake(intakeId: number) {
    const res = await api.patch(`/intake/${intakeId}/lock`)
}

export type { IntakeResponse, Meal };
