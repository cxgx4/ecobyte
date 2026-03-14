import { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";
import { CloudRain, Wind, ThermometerSun, AlertTriangle, Activity, Zap, Cpu } from "lucide-react";
import { fetchCityAQI } from "../utils/api";
import { generateHourlyData, generateDailyData } from "../utils/mockData";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Dashboard() {
  const [aqiData, setAqiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const hourlyData = generateHourlyData();
  const dailyData = generateDailyData();
  const [chartTab, setChartTab] = useState("today"); // today | week

  useEffect(() => {
    const getAqi = async () => {
      const data = await fetchCityAQI("kolkata");
      if (data) {
        setAqiData(data.aqi);
      } else {
        setAqiData(120); // Fallback mock
      }
      setLoading(false);
    };
    getAqi();
  }, []);

  if (loading) return <LoadingSpinner />;

  const aqiValue = aqiData || 0;
  const pieData = [
    { name: "AQI", value: aqiValue },
    { name: "Max", value: 500 - aqiValue }
  ];

  const getAqiColor = (aqi) => {
    if (aqi <= 50) return "#39FF14"; // Good - Neon Green
    if (aqi <= 100) return "#FFFF00"; // Moderate - Yellow
    if (aqi <= 150) return "#FFA500"; // Unhealthy for Sensitive - Orange
    return "#FF0000"; // Unhealthy - Red
  };

  const aqiColor = getAqiColor(aqiValue);
  const isHighPollution = aqiValue > 150;

  return (
    <div className="flex flex-col gap-6 pb-20">

      {/* Hero Section */}
      <div className="relative w-full h-80 lg:h-96 rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-lg bg-gray-900">
        <iframe
          src="https://my.spline.design/photorealearthanimationtoreveal-VKqh9A3tdKKnJI2VX0QnolB5/"
          frameBorder="0"
          width="100%"
          height="100%"
          className="absolute inset-0 z-0 pointer-events-none"
          title="Earth 3D"
        />

        {/* Weather Overlay */}
        <div className="absolute top-6 right-6 z-10 flex flex-col gap-3">
          <div className="glass-card bg-white/20 dark:bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-white flex items-center gap-4">
            <div className="flex flex-col items-center">
              <ThermometerSun className="w-5 h-5 text-orange-400 mb-1" />
              <span className="text-sm font-semibold">32°C</span>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="flex flex-col items-center">
              <CloudRain className="w-5 h-5 text-blue-400 mb-1" />
              <span className="text-sm font-semibold">65%</span>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="flex flex-col items-center">
              <Wind className="w-5 h-5 text-gray-300 mb-1" />
              <span className="text-sm font-semibold">12 km/h</span>
            </div>
          </div>
        </div>

        {/* Hero Title */}
        <div className="absolute bottom-8 left-8 z-10">
          <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Kolkata</h2>
          <p className="text-gray-300 font-medium">Urban Air Quality Command Center</p>
        </div>
      </div>

      {isHighPollution && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/50 rounded-2xl p-4 flex items-start gap-4 text-red-700 dark:text-red-400"
        >
          <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold">Health Alert: High Pollution</h3>
            <p className="text-sm opacity-90">Close windows and use indoor air purifiers immediately.</p>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* AQI Gauge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center relative overflow-hidden"
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 absolute top-4 left-6">Current AQI</h3>
          <div className="h-40 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="100%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={60}
                  outerRadius={80}
                  stroke="none"
                  dataKey="value"
                >
                  <Cell fill={getAqiColor(aqiValue)} />
                  <Cell fill="#334155" opacity={0.3} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute bottom-6 flex flex-col items-center">
            <span className="text-4xl font-bold dark:text-white" style={{ color: aqiColor }}>{aqiValue}</span>
            <span className="text-xs uppercase font-bold tracking-widest mt-1 text-gray-500">Live</span>
          </div>
        </motion.div>

        {/* Small Analytics Cards */}
        {[
          { title: "PM2.5", value: "45 µg/m³", icon: Wind, color: "#39FF14" },
          { title: "CO2", value: "410 ppm", icon: Activity, color: "#3B82F6" },
          { title: "Network Status", value: "98.2%", icon: Zap, color: "#EAB308" }
        ].map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-3xl p-6 shadow-sm flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                <card.icon className="w-5 h-5 dark:text-gray-300" />
              </div>
            </div>
            <div className="mt-auto">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</h4>
              <p className="text-2xl font-bold dark:text-white mt-1">{card.value}</p>
            </div>

            {/* Sparkline placeholder */}
            <div className="h-12 w-full mt-4 opacity-70">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <Area type="monotone" dataKey="pm25" stroke={card.color} fill={card.color} fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Temporal Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-3xl p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-neon-green" />
            Pollution Trends
          </h3>

          <div className="flex bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setChartTab("today")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${chartTab === "today" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
            >
              Today
            </button>
            <button
              onClick={() => setChartTab("week")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${chartTab === "week" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
            >
              5 Day Outlook
            </button>
          </div>
        </div>

        <div className="h-72 w-full">
          {chartTab === "today" ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPm25" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#39FF14" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#39FF14" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#39FF14' }}
                />
                <Area type="monotone" dataKey="pm25" stroke="#39FF14" strokeWidth={2} fillOpacity={1} fill="url(#colorPm25)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px', color: '#fff' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="avgAQI" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="peakAQI" fill="#FF0000" radius={[4, 4, 0, 0]} opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>

    </div>
  );
}