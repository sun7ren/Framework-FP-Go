"use client";

import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/utils/api";
import Header from "@/components/nutritionistHeader"
import Link from "next/link";

export default function UserLogsPage({ params }: any) {
  const { user_id } = use(params) as { user_id: string };
  const searchParams = useSearchParams();
  const date = searchParams.get("date");

  const [logs, setLogs] = useState<any[]>([]);

  const fetchLogs = async () => {
    try {
      const res = await api.get(`/logs/${user_id}`, {
        params: { date },
      });

      setLogs(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [user_id]);

  return (
    <>
        <Header/>
        <main className="min-h-screen mx-20 mt-10">
            <Link href="/dashboard-nutritionist" className="text-[#665944] font-semibold"> ◀ Go Back to Dashboard</Link>
            <h2 className="text-2xl font-bold mb-4 text-[#665944] text-center"><span className="text-[#ED9417] italic">User</span> Intake Logs</h2>

            {logs.map((log) => (
                <div key={log.di_id}>
                    <div className="flex flex-row gap-5 items-center justify-center">
                        <p className="font-semibold text-lg text-white py-2 bg-[#665944] w-28 text-center rounded-md">
                            {new Date(log.di_date).toLocaleDateString()}
                        </p>

                        <p className="font-semibold text-lg text-white py-2 bg-yellow-600 w-50 text-center rounded-md">
                            Total Calories: {log.total_calories}
                        </p>
                    </div>

                    <div className="mt-3 border p-4 rounded mb-4 bg-white shadow-md">
                        <p className="font-semibold text-lg text-[#665944] border-b pb-2 mb-3">
                            Meals Log:
                        </p>
                        <ul className="space-y-3"> 
                            {log.meals?.map((meal: any) => (
                                <li 
                                    key={meal.M_ID}
                                    className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-lg transition duration-200 hover:bg-gray-100"
                                >
                                    <div className="flex-1 font-medium text-gray-700 truncate mr-4">
                                        {meal.food_name}
                                    </div>

                                    <div className="text-lg font-bold text-yellow-600 w-24 text-right">
                                        {meal.calories} cal
                                    </div>

                                    <div className="text-md text-gray-500 w-16 text-right ml-4">
                                        ({meal.time})
                                    </div>
                                </li>
                            ))}
                        </ul>
                        {log.meals?.length === 0 && (
                            <p className="text-gray-500 italic pt-2">No meals logged for this period.</p>
                        )}
                    </div>

                    <div className="mt-3">
                        <p className="font-medium">Comments:</p>
                        <ul className="ml-4 list-disc">
                        {log.comments?.map((c: any) => (
                            <li key={c.c_id}>{c.content}</li>
                        ))}
                        </ul>
                    </div>
                </div>
            ))}
      </main>
    </>
  );
}
