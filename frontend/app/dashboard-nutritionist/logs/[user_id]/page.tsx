"use client";

import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/utils/api";
import Header from "@/components/nutritionistHeader";
import Link from "next/link";

export default function UserLogsPage({ params }: any) {
  const { user_id } = use(params) as { user_id: string };
  const searchParams = useSearchParams();
  const date = searchParams.get("date");

  const [nutritionistId, setNutritionistId] = useState<string | null>(null);

  useEffect(() => {
    const id = window.localStorage.getItem("user_id");
    setNutritionistId(id);
  }, []);


  const [logs, setLogs] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const fetchLogs = async () => {
    try {
      const res = await api.get(`/logs/${user_id}`, { params: { date } });
      setLogs(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [user_id]);

  const handleAddComment = async (diId: string) => {
    if (!newComment.trim()) return;

    try {
      await api.post("/nutritionist/comments", {
        di_id: diId,
        content: newComment,
        nutritionist_id: nutritionistId,
      });

      setNewComment("");
      fetchLogs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditComment = async (cId: number) => {
    if (!editingContent.trim()) return;

    try {
      await api.put(`/nutritionist/comments/${cId}`, {
        content: editingContent,
      });

      setEditingId(null);
      setEditingContent("");
      fetchLogs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (cId: number) => {
    try {
      await api.delete(`/nutritionist/comments/${cId}`);
      fetchLogs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen mx-20 mt-10">
        <Link
          href="/dashboard-nutritionist"
          className="text-[#665944] font-semibold"
        >
          ◀ Go Back to Dashboard
        </Link>

        <h2 className="text-2xl font-bold mb-4 text-[#665944] text-center">
          <span className="text-[#ED9417] italic">User</span> Intake Logs
        </h2>

        {logs.map((log) => (
          <div key={log.di_id} className="mb-10">
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
                    className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100"
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
                <p className="text-gray-500 italic pt-2">
                  No meals logged for this period.
                </p>
              )}
            </div>


            <div className="mt-3 p-4 border rounded bg-white shadow">
              <p className="font-medium mb-2 text-[#665944]">Comments:</p>

              <ul className="ml-4 space-y-2">
                {log.comments?.map((c: any) => (
                  <li key={c.c_id} className="flex justify-between">
                    {editingId === c.c_id ? (
                      <div className="flex gap-2 flex-1">
                        <input
                          className="border px-2 py-1 rounded w-full"
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                        />
                        <button
                          onClick={() => handleEditComment(c.c_id)}
                          className="bg-green-600 text-white px-3 py-1 rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-gray-400 text-white px-3 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-[#ED9417] mb-1">
                            {c.nutritionist?.username || "Unknown Nutritionist"}
                          </span>
                          <span>{c.content}</span>
                        </div>
                        {nutritionistId === c.nutritionist_id && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingId(c.c_id);
                                setEditingContent(c.content);
                              }}
                              className="text-blue-600 underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteComment(c.c_id)}
                              className="text-red-600 underline"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </li>
                ))}
              </ul>


              <div className="mt-4 flex gap-2">
                <input
                  className="border px-3 py-2 rounded w-full"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                  onClick={() => handleAddComment(log.di_id)}
                  className="bg-[#665944] text-white px-4 rounded"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </main >
    </>
  );
}
