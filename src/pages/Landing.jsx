import { useNavigate } from "react-router-dom";

export default function Landing() {

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
      
      <h1 className="text-6xl font-bold text-green-400">
        EcoByte
      </h1>

      <p className="mt-4 text-gray-400">
        Making Invisible Pollution Visible
      </p>

      <button
        onClick={() => navigate("/dashboard")}
        className="mt-6 px-6 py-3 bg-green-400 text-black rounded-lg"
      >
        Get Started
      </button>

    </div>
  );
}