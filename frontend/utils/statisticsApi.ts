import api from "./api";
import { IntakeResponse } from "@/types/intake";

export async function getIntakeByDate(date: string): Promise<IntakeResponse | null> {
  try {
    const res = await api.get(`/intake?date=${date}`);
    return res.data;
  } catch (err) {
    console.error("Failed to fetch intake:", err);
    return null;
  }
}

export async function getUserProfile() {
  try {
    const res = await api.get("/profile/info");
    return res.data.data; 
  } catch (err) {
    console.error("Failed to fetch profile:", err);
    return null;
  }
}

