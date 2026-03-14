import React, { useMemo } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Server, Activity, CheckCircle2, XCircle, Terminal } from "lucide-react";
import { generateIotNodes } from "../utils/mockData";

export default function SystemStatus() {
    const nodes = useMemo(() => generateIotNodes(), []);

    const onlineNodes = nodes.filter(n => n.status === 'online').length;
    const offlineNodes = nodes.length - onlineNodes;
    const avgUptime = (nodes.reduce((acc, curr) => acc + parseFloat(curr.uptime), 0) / nodes.length).toFixed(1);

    return (
        <div className="max-w-7xl mx-auto pb-20">

            <div className="mb-8">
                <h2 className="text-3xl font-bold dark:text-white flex items-center gap-3">
                    <Server className="w-8 h-8 text-neon-green" />
                    System Status
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Real-time diagnostics for the EcoByte localized IoT sensor array in Kolkata.
                </p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-green-500/10 rounded-2xl">
                        <CheckCircle2 className="w-8 h-8 text-neon-green" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold dark:text-white">{onlineNodes}</div>
                        <div className="text-sm text-gray-500 font-medium">Nodes Online</div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-red-500/10 rounded-2xl">
                        <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold dark:text-white">{offlineNodes}</div>
                        <div className="text-sm text-gray-500 font-medium">Nodes Offline</div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-blue-500/10 rounded-2xl">
                        <Activity className="w-8 h-8 text-blue-500" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold dark:text-white">{avgUptime}%</div>
                        <div className="text-sm text-gray-500 font-medium">Average Uptime</div>
                    </div>
                </div>

            </div>

            {/* Nodes Grid */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-3xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-gray-400" />
                        Sensor Array Logs
                    </h3>
                    <button className="text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-gray-200 px-4 py-2 rounded-lg transition-colors">
                        Run Diagnostics
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {nodes.map((node, i) => (
                        <motion.div
                            key={node.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className={`border p - 5 rounded - 2xl flex flex - col gap - 3 transition - all cursor -default ${node.status === 'online'
                                ? 'border-gray-200 dark:border-white/10 hover:border-neon-green/50 dark:hover:border-neon-green/50 bg-gray-50 dark:bg-slate-800/30'
                                : 'border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10'
                                } `}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-sm font-bold text-gray-700 dark:text-gray-300">
                                    {node.id}
                                </span>
                                <span className="relative flex h-3 w-3">
                                    {node.status === 'online' && (
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75"></span>
                                    )}
                                    <span className={`relative inline - flex rounded - full h - 3 w - 3 ${node.status === 'online' ? 'bg-neon-green' : 'bg-red-500'
                                        } `}></span>
                                </span>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                                <div className="text-xs text-gray-500 uppercase font-semibold">Uptime</div>
                                <div className={`text - sm font - bold ${node.status === 'online' ? 'text-gray-800 dark:text-gray-200' : 'text-red-500'
                                    } `}>
                                    {node.uptime}%
                                </div>
                            </div>

                            <div className="text-xs font-mono text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                {node.status === 'online' ? 'Sys.Nominal' : 'Conn.Refused'}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

        </div>
    );
}
