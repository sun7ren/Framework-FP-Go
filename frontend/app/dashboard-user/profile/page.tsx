"use client";

import InsideHeader from "@/components/insideHeader";
import { useState, ChangeEvent, useEffect } from "react";
import api, { getCurrentUser } from "@/utils/api";

const input_styles = "w-full border p-2 rounded bg-white border-2 border-[#B2A48C] mb-5"
const input_title = "font-semibold text-[#665944] text-lg"
const result_styles = "w-full border p-2 rounded bg-[#EBE0CD] border-2 border-[#B2A48C] mb-5 text-[#665944]"

export default function MyProfile() {
  const initialUserState = {
    height: 0, 
    weight: 0, 
    age: 0,
    gender: '', 
    bmi: 0,
    bmr: 0,
  };

  const [user, setUser] = useState(initialUserState);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: ["height", "weight", "bmi", "bmr", "age"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  useEffect(() => {
      const fetchUser = async () => {
        const data = await getCurrentUser();
        setUsername(data?.user?.username || "");
      };
      fetchUser();
    }, []);
  

  const handleCalculation = () => {
    if (!user.height || !user.weight || !user.age || !user.gender) {
      setError("Please fill in height, weight, age, and gender to calculate BMI and BMR.");
      return;
    }

    const heightM = user.height / 100;
    const bmi = user.weight / (heightM * heightM);

    let bmr = 0;
    if (user.gender.toLowerCase() === "male") {
      bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age + 5;
    } else if (user.gender.toLowerCase() === "female") {
      bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age - 161;
    }

    setUser((prev) => ({
      ...prev,
      bmi: Number(bmi.toFixed(2)),
      bmr: Number(bmr.toFixed(2)),
    }));

    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.put("/profile", user);
      alert("Profile change successful!");
    } catch (err: any) {
      setError(err.response?.data?.error || "Profile change failed. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <InsideHeader />
      <main className="min-h-screen mx-80 mt-10">
        <h1 className="text-3xl font-bold mb-6 text-[#1F6805] text-center">Welcome To {username}'s Profile</h1>
        {error && <p className="text-red-600 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-row gap-10 max-w-mx">
          <div className="flex flex-col w-full">
            <h2 className={input_title}>Your Height</h2>
            <input
              type="number"
              name="height"
              step="0.01"
              placeholder="Height (cm)"
              value={user.height}
              onChange={handleChange}
              className={input_styles}
            />

            <h2 className={input_title}>Your Weight</h2>
            <input
              type="number"
              name="weight"
              step="0.01"
              placeholder="Weight (kg)"
              value={user.weight}
              onChange={handleChange}
              className={input_styles}
            />

            <h2 className={input_title}>Age</h2>
            <input
              type="number"
              name="age"
              placeholder="Age"
              value={user.age}
              onChange={handleChange}
              className={input_styles}
            />
          
            <h2 className={input_title}>Your Gender</h2>
            <input
              type="text"
              name="gender"
              placeholder="(male/female)"
              value={user.gender}
              onChange={handleChange}
              className={input_styles}
            />

            <button
              type="button"
              onClick={handleCalculation}
              className="font-semibold text-lg w-full px-4 py-2 bg-[#FFC300] text-white rounded mr-2 hover:bg-yellow-600"
            >
              Calculate
            </button>
          </div>

          <div className="flex flex-col w-full">
            <p className={input_title}>Your Calculated BMI</p>
            <p className={result_styles}>{user.bmi}</p>
            <p className={input_title}>Your Calculated BMR</p>
            <p className={result_styles}>{user.bmr} kcal/day</p>
            <div className="bg-white rounded-xl p-5 border border-green-800 text-[#4A3A1E] space-y-3 mb-5">
              <h3 className="font-semibold text-lg text-green-800 mb-0 mt-0">BMI Categories (Adults)</h3>
              
              <ul className="list-disc list-inside">
                <li>Underweight: Below 18.5</li>
                <li>Healthy weight: 18.5 – 24.9</li>
                <li>Overweight: 25.0 – 29.9</li>
                <li>Obese: 30.0 and above</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="font-semibold text-lg px-4 py-2 bg-[#2B840B] text-white rounded hover:bg-green-800 transition"
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
