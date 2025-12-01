"use client";

import { useEffect, useState } from "react";
import api from "@/utils/api";
import { useRouter } from "next/navigation";
import Header from "@/components/nutritionistHeader"

interface Intake {
  di_id: string;
  date: string;
  username: string;
  total_calories: number;
  bmr: number;
  status: string;
  user_id: string;
}

export default function NutritionistDashboard() {
  const router = useRouter();
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;


  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = intakes.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(intakes.length / itemsPerPage);

  const nextPage = () => {
   if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
   if (currentPage > 1) setCurrentPage(currentPage - 1);
  };


  const fetchData = async () => {
    try {
      const response = await api.get("/nutritionist/intakes", {
        params: {
          start: start || undefined,
          end: end || undefined,
        },
      });
      setIntakes(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statusColor = (status: string) => {
    if (status === "Above BMR") return "text-red-500 font-semibold";
    if (status === "Below BMR") return "text-yellow-500 font-semibold";
    return "text-green-600 font-semibold";
  };

  return (
    <>
        <Header/>
        <main className="min-h-screen mx-20 mt-10">
            <h1 className="text-3xl font-bold mb-6 text-[#665944]"><span className="text-[#ED9417] italic">Nutritionist</span> Dashboard</h1>

            <div className="bg-white flex items-center gap-4 py-3 px-5 border border-t-[#B2A48C] border-r-[#B2A48C] border-l-[#B2A48C] rounded-md">
                <div>
                <label className="block text-sm text-gray-600">Start Date</label>
                <input
                    type="date"
                    className="bg-[#F8F6F3] border px-3 py-2 rounded"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                />
                </div>

                <div>
                <label className="block text-sm text-gray-600">End Date</label>
                <input
                    type="date"
                    className="bg-[#F8F6F3] border px-3 py-2 rounded"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                />
                </div>

                <button
                onClick={fetchData}
                className="bg-yellow-600 text-white px-4 py-2 mt-4 rounded"
                >
                Apply
                </button>
            </div>

            <table className="table bg-white border border-[#B2A48C] text-md">
                <thead className="text-center bg-[#FFF1C5] text-[#9C5C03] font-semibold">
                <tr>
                    <th>Date</th>
                    <th>Username</th>
                    <th>Calories</th>
                    <th>BMR</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                    {currentItems.map((item) => (
                        <tr key={item.di_id}>
                        <td>
                            {new Date(item.date).toLocaleDateString()}
                        </td>
                        <td className="text-center text-md">{item.username}</td>
                        <td className="text-center text-md">{item.total_calories}</td>
                        <td className="text-center text-md">{item.bmr}</td>
                        <td className={`text-center text-md ${statusColor(item.status)}`}>
                            {item.status}
                        </td>
                        <td className="text-center">
                            <button
                            onClick={() =>
                                router.push(`/dashboard-nutritionist/logs/${item.user_id}?date=${item.date}`)
                            }
                            className="bg-green-600 text-white px-3 py-1 rounded"
                            >
                            View Logs
                            </button>
                        </td>
                        </tr>
                    ))}

                    {currentItems.length === 0 && (
                        <tr>
                        <td className="text-center p-6 text-gray-500" colSpan={6}>
                            No records found.
                        </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <div className="flex justify-center items-center gap-4 mt-6 pb-10">
                <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-yellow-600 rounded disabled:opacity-50 text-white"
                >
                    Previous
                </button>

                <span className="text-lg font-semibold text-[#665944]">
                    Page {currentPage} of {totalPages}
                </span>

                <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-yellow-600 rounded disabled:opacity-50 text-white"
                >
                    Next
                </button>
            </div>
      </main>
    </>
  );
}
