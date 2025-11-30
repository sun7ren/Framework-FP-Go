export default function Modal({ title, onCancel, onSubmit, mealForm, setMealForm }: any) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded w-80">
        <h2 className="font-bold text-lg mb-3">{title}</h2>

        <input
          className="w-full border p-2 mb-2 rounded-md"
          placeholder="Meal name"
          value={mealForm.food_name}
          onChange={(e) => setMealForm({ ...mealForm, food_name: e.target.value })}
        />

        <input
          className="w-full border p-2 mb-2 rounded-md"
          placeholder="Calories"
          type="number"
          value={mealForm.calories}
          onChange={(e) => setMealForm({ ...mealForm, calories: e.target.value })}
        />

        <input
          className="w-full border p-2 mb-2 rounded-md"
          placeholder="Time (optional)"
          value={mealForm.time}
          onChange={(e) => setMealForm({ ...mealForm, time: e.target.value })}
        />

        <div className="flex justify-end gap-4 mt-2">
          <button onClick={onCancel}>Cancel</button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-md" onClick={onSubmit}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
