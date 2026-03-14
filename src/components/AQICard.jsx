export default function AQICard({ title, value }) {
  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-md">
      <h2 className="text-gray-400">{title}</h2>
      <p className="text-3xl font-bold text-green-400 mt-2">{value}</p>
    </div>
  );
}