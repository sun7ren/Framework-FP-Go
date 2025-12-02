"use client";

import { useEffect, useState } from "react";
import Header from "@/components/insideHeader";
import { getCurrentUser } from "@/utils/api";
import Image from "next/image";
import Modal from "./Modal"
import {
  getIntakeByDate,
  addMeal,
  updateMeal,
  deleteMeal,
  IntakeResponse,
  Meal,
  lockIntake,
} from "@/utils/intakeApi";

const tab_style = "py-3 rounded-4xl w-100 gap-10 font-semibold border transition-all bg-[#FFF6E8] text-[#4A3A1E] border-[#B28B00]"
const activeTab_style = "py-3 rounded-4xl w-100 gap-10 font-semibold border transition-all bg-[#FFC300] text-[#4A3A1E] border-[#B28B00]"
const button_styles = "px-6 py-2 rounded-lg font-semibold"

export default function IntakeLogsPage() {
  const [activeTab, setActiveTab] = useState<"Today" | "Yesterday" | "2 Days Ago">("Today");
  const [selectedDate, setSelectedDate] = useState("");
  const [username, setUsername] = useState("");

  const [intake, setIntake] = useState<IntakeResponse | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const isLocked = intake?.is_locked === true;


  const [mealForm, setMealForm] = useState({
    food_name: "",
    calories: "",
    time: "",
  });

  const [editingMealId, setEditingMealId] = useState<string | null>(null);

  const filteredMeals = meals.filter((m) =>
    m.food_name.toLowerCase().includes(search.toLowerCase())
  );

  const computeDate = () => {
    const d = new Date();
    if (activeTab === "Yesterday") d.setDate(d.getDate() - 1);
    if (activeTab === "2 Days Ago") d.setDate(d.getDate() - 2);
    return d.toISOString().split("T")[0];
  };

  const fetchIntake = async () => {
    setLoading(true);
    try {
      const date = computeDate();
      setSelectedDate(date);

      const data = await getIntakeByDate(date);
      if (activeTab === "Yesterday" || activeTab === "2 Days Ago") {
        if (data && !data.is_locked) {
          await lockIntake(data.di_id);
          data.is_locked = true;
        }
      }
      setIntake(data ?? null);
      setMeals(data?.meals ?? []);
    } catch (err) {
      console.error(err);
      setIntake(null);
      setMeals([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchIntake();
    getCurrentUser().then((data) => {
      setUsername(data?.user?.username || "");
    });
  }, [activeTab]);

  const handleAddMeal = async () => {
    if (!intake?.di_id) return;

    await addMeal(intake.di_id, {
      food_name: mealForm.food_name,
      calories: Number(mealForm.calories),
      time: mealForm.time || undefined,
    });

    setShowAddModal(false);
    setMealForm({ food_name: "", calories: "", time: "" });

    fetchIntake();
  };

  const openEditModal = (meal: Meal) => {
    setEditingMealId(meal.M_ID);
    setMealForm({
      food_name: meal.food_name,
      calories: String(meal.calories),
      time: meal.time ?? "",
    });
    setShowEditModal(true);
  };

  const handleEditMeal = async () => {
    if (editingMealId === null) return;

    await updateMeal(editingMealId, {
      food_name: mealForm.food_name,
      calories: Number(mealForm.calories),
      time: mealForm.time || undefined,
    });

    setShowEditModal(false);
    setEditingMealId(null);
    setMealForm({ food_name: "", calories: "", time: "" });

    fetchIntake();
  };

  const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);

  return (
    <>
      <Header />
      <main className="min-h-screen mx-20 mt-10">
        <h1 className="font-bold text-4xl text-[#774D06]">
          Hi <span className="text-[#ED9417] italic">{username}, </span>you've consumed
          <span className="text-[#ED9417]"> {totalCalories} Calories</span> {activeTab} ({selectedDate})
        </h1>

        {/* Tabs */}
        <div className="flex gap-5 bg-[#F0E0C6] px-10 py-5 rounded-4xl mt-5">
          <button
            className={activeTab === "Today" ? activeTab_style : tab_style}
            onClick={() => setActiveTab("Today")} >Today</button>

          <button
            className={activeTab === "Yesterday" ? activeTab_style : tab_style}
            onClick={() => setActiveTab("Yesterday")}>Yesterday</button>

          <button
            className={activeTab === "2 Days Ago" ? activeTab_style : tab_style}
            onClick={() => setActiveTab("2 Days Ago")}>2 Days Before</button>
        </div>

        {/* Search + Buttons */}
        <div className="border-t-[#B2A48C] border-r-[#B2A48C] border-l-[#B2A48C] mt-10 bg-white border p-5 rounded-lg flex justify-between items-center">
          <input
            type="text"
            placeholder="Search"
            value={search}
            className="border border-[#B2A48C] px-3 py-2 rounded-lg w-80"
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex flex-row gap-4">
            <button
              onClick={() => {
                setMealForm({ food_name: "", calories: "", time: "" });
                setEditingMealId(null);
                setShowEditModal(false);
                setShowAddModal(true);
              }}
              className="bg-[#FFC300] text-[#8A5203] px-6 py-3 rounded-lg font-semibold hover:bg-[#FFD643] transition"
            >
              Add Meal
            </button>
            {activeTab === "Today" && !isLocked && (
              <button
                onClick={async () => {
                  if (!intake?.di_id) return;
                  await lockIntake(intake.di_id);
                  fetchIntake();
                }}
                className="bg-green-600 text-white px-6 py-3 rounded-lg"
              >
                Done for Today
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <table className="table bg-white border border-[#B2A48C] text-md">
          <thead className="text-center bg-[#FFF1C5] text-[#9C5C03] font-semibold">
            <tr>
              <th>Index</th>
              <th>Meal</th>
              <th>Calories</th>
              <th>Time</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-5">Loading...</td>
              </tr>
            ) : filteredMeals.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-[#9C5C03] italic">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Image src="/logo/ModalLogo.png" alt="No meals" width={100} height={60} />
                    <span className="text-xl">No Intake Here</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredMeals.map((m, i) => (
                <tr key={m.M_ID}>
                  <td className="text-center text-md">{i + 1}</td>
                  <td className="text-center text-md">{m.food_name}</td>
                  <td className="text-center text-md">{m.calories}</td>
                  <td className="text-center text-md">{m.time}</td>
                  <td className="flex items-center justify-center gap-2">
                    <button
                      disabled={isLocked}
                      className={`${button_styles} ${isLocked ? "bg-gray-400" : "bg-[#FFC300] text-[#8A5203] hover:bg-[#FFD643] transition"}`}
                      onClick={() => !isLocked && openEditModal(m)}
                    >
                      Edit
                    </button>
                    <button
                      disabled={isLocked}
                      className={`${button_styles} ${isLocked ? "bg-gray-400" : "bg-red-600 text-white hover:bg-green-800 transition"}`}
                      onClick={() => !isLocked && deleteMeal(m.M_ID).then(fetchIntake)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Comments Section */}
        {intake?.comments && intake.comments.length > 0 && (
          <div className="mt-8 mb-10">
            <h2 className="text-2xl font-bold text-[#774D06] mb-4">Nutritionist Comments</h2>
            <div className="flex flex-col gap-4">
              {intake.comments.map((comment) => (
                <div key={comment.c_id} className="bg-white border border-[#B2A48C] rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-[#ED9417]">{comment.nutritionist?.username || "Nutritionist"}</span>
                    <span className="text-sm text-gray-500">commented:</span>
                  </div>
                  <p className="text-[#4A3A1E]">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modals */}
        {showAddModal && (
          <Modal
            title="Add Meal"
            onCancel={() => setShowAddModal(false)}
            onSubmit={handleAddMeal}
            mealForm={mealForm}
            setMealForm={setMealForm}
          />
        )}

        {showEditModal && (
          <Modal
            title="Edit Meal"
            onCancel={() => setShowEditModal(false)}
            onSubmit={handleEditMeal}
            mealForm={mealForm}
            setMealForm={setMealForm}
          />
        )}
      </main>
    </>
  );
}