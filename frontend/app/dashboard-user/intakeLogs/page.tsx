"use client";

import InsideHeader from "@/components/insideHeader";
import { useState, useEffect } from "react";
import Image from "next/image";
import api, { getCurrentUser } from "@/utils/api";

interface Meal {
  M_ID: string;
  food_name: string;
  calories: number;
  time: string;
}

interface IntakeResponse {
  di_id: string;
  di_date: string;
  di_total_calories: number;
  meals: Meal[];
}

export default function IntakeLogs() {
  const [username, setUsername] = useState("");
  const [intake, setIntake] = useState<IntakeResponse | null>(null);
  const [tab, setTab] = useState("today");
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const [mealName, setMealName] = useState("");
  const [calories, setCalories] = useState("");
  const [time, setTime] = useState("");
  const [search, setSearch] = useState("");
  const total = intake?.meals?.reduce((sum, meal) => sum + meal.calories, 0) ?? 0;

  const fetchIntake = async () => {
    try {
      const res = await api.get("/intake");
      setIntake(res.data);
    } catch (err) {
      console.error("Failed to fetch intake:", err);
    }
  };

  useEffect(() => {
    fetchIntake();

    const fetchUser = async () => {
      const data = await getCurrentUser();
      setUsername(data?.user?.username || "");
    };
    fetchUser();
  }, []);

  const submitMeal = async () => {
  if (!intake?.di_id) return;

  try {
    const res = await api.post(`/intake/${intake.di_id}/meal`, {
      food_name: mealName,
      calories: Number(calories),
      time: time,
    });

    setMealName("");
    setCalories("");
    setTime("");
    setIsAddMealOpen(false);
  } catch (err) {
    console.error("Failed to add meal:", err);
  }
};


  const deleteMeal = async (mealId: string) => {
    if (!intake) return;
    try {
      await api.delete(`/intake/meal/${mealId}`);
      fetchIntake();
    } catch (err) {
      console.error("Failed to delete meal:", err);
    }
  };

  const filteredMeals = (intake?.meals || []).filter((meal) =>
    meal.food_name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
  console.log("Intake data:", intake);
}, [intake]);


  return (
    <>
      <InsideHeader />
      <main className="min-h-screen mx-20 mt-10">
        <h1 className="font-bold text-4xl text-[#774D06]">
          Hi <span className="text-[#ED9417] italic">{username || "User"}</span>, your total calories today is {total ?? 0} kcal
        </h1>

        <div className="flex flex-row bg-[#F0E0C6] px-10 py-5 rounded-4xl mt-10 gap-10 content-center">
          <button onClick={() => setTab("today")} className="py-3 rounded-4xl w-100 gap-10 font-semibold border transition-all bg-[#FFC300] text-[#4A3A1E] border-[#B28B00]">Today</button>
          <button onClick={() => setTab("yesterday")} className="py-3 rounded-4xl w-100 gap-10 font-semibold border transition-all bg-[#FFF6E8] text-[#665944] border-[#B2A48C]">Yesterday</button>
          <button onClick={() => setTab("2_days")} className="py-3 rounded-4xl w-100 gap-10 font-semibold border transition-all bg-[#FFF6E8] text-[#665944] border-[#B2A48C]">2 Days Before</button>
        </div>

        <div className="overflow-x-auto mt-10">
          <div className="flex flex-row bg-white border-t border-l border-r border-[#B2A48C] rounded-lg p-5 justify-between items-center">
            <div className="flex items-center bg-[#F8F6F3] border border-[#B2A48C] rounded-lg px-4 py-2 gap-3 w-[350px]">
              <input
                type="text"
                placeholder="Search Keyword"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-lg focus:outline-none"
              />
            </div>

            <div className="flex flex-row gap-4">
              <button
                onClick={() => intake?.di_id && setIsAddMealOpen(true)}
                className="bg-[#FFC300] text-[#8A5203] px-6 py-3 rounded-lg font-semibold hover:bg-[#FFD643] transition"
              >
                + Add New Meal
              </button>
              <button className="bg-[#2B840B] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#3F9A1A] transition">
                Done Today
              </button>
            </div>
          </div>

          <table className="table bg-white border border-[#B2A48C]">
            <thead className="text-center bg-[#FFF1C5] text-[#9C5C03] font-semibold">
              <tr>
                <th>Index</th>
                <th>Meal</th>
                <th>Calories</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody className="text-center">
              {filteredMeals.length === 0 ? (
                <tr key="no-meals">
                  <td colSpan={5} className="py-6 text-[#9C5C03] italic">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Image src="/logo/ModalLogo.png" alt="No meals" width={100} height={60} />
                      <span className="text-xl">No meals added yet.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMeals.map((meal, index) => (
                  <tr key={meal.M_ID}>
                    <th>{index + 1}</th>
                    <td>{meal.food_name}</td>
                    <td>{meal.calories}</td>
                    <td>{meal.time}</td>
                    <td className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => deleteMeal(meal.M_ID)}
                        className="px-3 py-1 bg-red-600 text-white rounded-md"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {isAddMealOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-md w-[350px] space-y-4">
              <h2 className="text-xl font-semibold">Add Meal</h2>

              <input
                type="text"
                placeholder="Meal Name"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                className="w-full border p-2 rounded"
              />

              <input
                type="number"
                placeholder="Calories"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full border p-2 rounded"
              />

              <input
                type="time"
                placeholder="Time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full border p-2 rounded"
              />

              <div className="flex justify-end gap-3">
                <button onClick={() => setIsAddMealOpen(false)} className="px-3 py-1 border rounded">
                  Cancel
                </button>
                <button
                  onClick={submitMeal}
                  className="px-4 py-1 bg-blue-600 text-white rounded"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
