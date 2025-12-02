"use client";

import InsideHeader from "@/components/insideHeader";
import { useEffect, useState } from "react";
import { getIntakeByDate, getUserProfile } from "@/utils/statisticsApi";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

interface DayStat {
  day: string;
  calories: number;
}

export default function Statistics() {
  const [data, setData] = useState<DayStat[]>([]);
  const [bmi, setBMI] = useState<number | null>(null);
  const [bmr, setBMR] = useState<number | null>(null);
  const [avg, setAvg] = useState<number>(0);
  const [advice, setAdvice] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);

      const today = new Date();
      const yesterday = new Date();
      const twoDays = new Date();

      yesterday.setDate(yesterday.getDate() - 1);
      twoDays.setDate(twoDays.getDate() - 2);

      const format = (d: Date) => d.toISOString().split("T")[0];

      const [todayIntake, yesterdayIntake, twoDaysIntake, user] = await Promise.all([
        getIntakeByDate(format(today)),
        getIntakeByDate(format(yesterday)),
        getIntakeByDate(format(twoDays)),
        getUserProfile(),
      ]);

      if (user) {
        setBMI(user.bmi ?? null);
        setBMR(user.bmr ?? null);
      }

      const stats = [
        { day: "2 Days Ago", calories: twoDaysIntake?.total_calories ?? 0 },
        { day: "Yesterday", calories: yesterdayIntake?.total_calories ?? 0 },
        { day: "Today", calories: todayIntake?.total_calories ?? 0 },
      ];

      setData(stats);

      const sum = stats.reduce((t, x) => t + x.calories, 0);
      const average = sum / 3;
      setAvg(average);

      if (user?.bmr) {
        const diff = average - user.bmr;
        if (diff > 150) {
          setAdvice(
            "Your average calorie intake is significantly above your BMR. Consider reducing portion sizes or selecting lower-calorie meals."
          );
        } else if (diff < -150) {
          setAdvice(
            "Your average calorie intake is significantly below your BMR. Ensure you're consuming enough energy for your daily metabolism."
          );
        } else {
          setAdvice(
            "Your calorie intake is well-balanced and consistent with your BMR. Keep up the great work!"
          );
        }
      } else {
        setAdvice("Unable to calculate personalized advice because your BMR is unavailable.");
      }

      setLoading(false);
    }

    fetchStats();
  }, []);

  return (
    <>
      <InsideHeader />
      <main className="min-h-screen max-w-7xl mx-auto p-4 sm:p-6 md:p-8 lg:p-10">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-[#1F6805]">
          Nutrition Statistics 
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
             <p className="text-xl text-gray-600">Loading statistics...</p>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid md:grid-cols-3 gap-6">
                <MetricCard title="Avg. Calories (3 Days)" value={`${avg.toFixed(0)} kcal`} color="text-[#774D06]" />
                <MetricCard title="Your Estimated BMR" value={`${bmr?.toFixed(0) ?? "N/A"} kcal`} color="text-yellow-600" />
                <MetricCard title="Your Calculated BMI" value={bmi?.toFixed(1) ?? "N/A"} color="text-[#774D06]" />
            </div>

            <div className="grid lg:grid-cols-2 gap-10 bg-[#FFFEFB] border-1 border-[#774D06] py-5 rounded-md">
              <div className="p-6 rounded-2xl">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                  Daily Calorie Intake vs. BMR
                </h2>

                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} />
                    <YAxis />
                    <Tooltip 
                        formatter={(value) => [`${value} kcal`, 'Calories']} 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #ccc' }}
                    />
                    <Bar dataKey="calories" radius={[10, 10, 0, 0]}>
                      {data.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            bmr && entry.calories > bmr
                              ? "#dc2626" 
                              : "#16a34a"
                          }
                        />
                      ))}
                    </Bar>

                    {bmr && (
                        <Line
                            type="monotone"
                            dataKey={() => bmr}
                            stroke="#3b82f6" 
                            strokeDasharray="5 5"
                            dot={false}
                            legendType="line"
                            name="BMR"
                        />
                    )}
                  </BarChart>
                </ResponsiveContainer>
                </div>
                <div>
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                  3-Day Calorie Trend
                </h2>

                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} />
                    <YAxis />
                    <Tooltip 
                        formatter={(value) => [`${value} kcal`, 'Calories']} 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #ccc' }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="calories" 
                        stroke="#059669"
                        strokeWidth={4} 
                        dot={{ r: 6 }} 
                        activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
         <div className="p-6 rounded-2xl border border-green-800 bg-white max-w-7xl mx- mt-10">
              <h2 className="text-xl font-bold mb-3 text-green-800">
                Personalized Nutrition Feedback
              </h2>
              <p className="text-lg text-gray-700">
                {advice}
              </p>
            </div>
      </main>
    </>
  );
}

const MetricCard = ({ title, value, color }: { title: string, value: string, color: string }) => (
    <div className="p-5 bg-[#FFF6E8] border-1 border-[#774D06] rounded-xl text-center">
        <p className="text-sm font-medium text-[#A86C07] mb-1">{title}</p>
        <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
    </div>
);