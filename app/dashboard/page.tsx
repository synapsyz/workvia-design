"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { Bell } from "lucide-react";

/* --------------------------
   Sample data (same as before)
   -------------------------- */
const revenueData = [
  { month: "Jan", revenue: 4200 },
  { month: "Feb", revenue: 3800 },
  { month: "Mar", revenue: 5000 },
  { month: "Apr", revenue: 4700 },
  { month: "May", revenue: 5600 },
  { month: "Jun", revenue: 6100 },
  { month: "Jul", revenue: 7200 },
  { month: "Aug", revenue: 6800 },
  { month: "Sep", revenue: 7400 },
];

const activity = [
  { id: 1, text: "New user signed up", time: "2m ago" },
  { id: 2, text: "Payment received: $299", time: "1h ago" },
  { id: 3, text: "Project 'Apollo' updated", time: "3h ago" },
  { id: 4, text: "Server backup completed", time: "1d ago" },
];

export default function DashboardPage() {
  const cardBg = "bg-white border-gray-100 shadow-sm";
  const softBg = "bg-gray-50";
  const textMuted = "text-gray-500";
  const textStrong = "text-gray-800";
  const borderColor = "border-gray-200";
  const chartStroke = "#0A236E";
  const chartFillId = "areaFill";
  const gridColor = "#e5e7eb";
  const axisTextColor = "#6B7280";

  return (
    <div className="space-y-6">
      {/* GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Small Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 rounded-2xl ${cardBg} border`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className={`text-xs ${textMuted}`}>Monthly revenue</div>
                  <div className="text-2xl font-semibold">$7,400</div>
                </div>
                <div className="text-sm text-green-500 font-medium">+8.6%</div>
              </div>
              <div className="mt-4 h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <XAxis dataKey="month" hide tick={{ fill: axisTextColor }} stroke={axisTextColor} />
                    <YAxis hide tick={{ fill: axisTextColor }} stroke={axisTextColor} />
                    <Tooltip
                      contentStyle={{
                        background: "white",
                        border: `1px solid #e5e7eb`,
                        color: "#111827",
                      }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke={chartStroke} strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 rounded-2xl ${cardBg} border`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className={`text-xs ${textMuted}`}>Active users</div>
                  <div className="text-2xl font-semibold">5,432</div>
                </div>
                <div className="text-sm text-red-400 font-medium">-1.2%</div>
              </div>
              <div className="mt-4 h-36 flex items-center justify-center">
                <div className={`text-sm ${textMuted}`}>Stable growth — 30-day window</div>
              </div>
            </motion.div>
          </div>

          {/* Revenue Trend */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-6 rounded-2xl ${cardBg} border`}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Revenue trend</h3>
              <div className={`text-sm ${textMuted}`}>Last 9 months</div>
            </div>

            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={chartFillId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartStroke} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={chartStroke} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke={axisTextColor} tick={{ fill: axisTextColor }} />
                  <YAxis stroke={axisTextColor} tick={{ fill: axisTextColor }} />
                  <CartesianGrid stroke={gridColor} />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: `1px solid #e5e7eb`,
                      color: "#111827",
                    }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke={chartStroke} fillOpacity={1} fill={`url(#${chartFillId})`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Recent Customers */}
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`p-6 rounded-2xl ${cardBg} border`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Recent customers</h3>
              <div className={`text-sm ${textMuted}`}>Most recent 7</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {["Tata Electronics.", "Amazon", "Boeing", "Reliance", "Walmart", "Royal Enfield.", "RingsnRoses"]
                .slice(0, 6)
                .map((c) => (
                  <div
                    key={c}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${borderColor} bg-white`}
                  >
                    <div className="w-10 h-10 rounded-md bg-[#0A236E] text-white flex items-center justify-center">
                      {c[0]}
                    </div>
                    <div>
                      <div className="font-medium">{c}</div>
                      <div className={`text-xs ${textMuted}`}>Signed up 3 days ago</div>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <aside className="space-y-6">
          {/* Quick Stats */}
          <motion.div initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} className={`p-5 rounded-2xl ${cardBg} border w-full`}>
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Quick stats</h4>
              <div className={`text-xs ${textMuted}`}>Updated now</div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg ${softBg} border ${borderColor}`}>
                <div className={`text-xs ${textMuted}`}>MRR</div>
                <div className="text-lg font-semibold">$24.3k</div>
              </div>
              <div className={`p-3 rounded-lg ${softBg} border ${borderColor}`}>
                <div className={`text-xs ${textMuted}`}>Churn</div>
                <div className="text-lg font-semibold">2.1%</div>
              </div>
              <div className={`p-3 rounded-lg ${softBg} border ${borderColor}`}>
                <div className={`text-xs ${textMuted}`}>Avg. Order</div>
                <div className="text-lg font-semibold">$129</div>
              </div>
              <div className={`p-3 rounded-lg ${softBg} border ${borderColor}`}>
                <div className={`text-xs ${textMuted}`}>Trials</div>
                <div className="text-lg font-semibold">320</div>
              </div>
            </div>
          </motion.div>

          {/* Activity */}
          <motion.div initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} className={`p-5 rounded-2xl ${cardBg} border w-full`}>
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Activity</h4>
              <div className={`text-xs ${textMuted}`}>Recent</div>
            </div>

            <ul className="mt-4 space-y-3">
              {activity.map((a) => (
                <li key={a.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-md ${softBg} flex items-center justify-center border ${borderColor}`}>
                      <Bell className={`w-4 h-4 text-gray-500`} />
                    </div>
                    <div>
                      <div className={`text-sm ${textStrong}`}>{a.text}</div>
                      <div className={`text-xs ${textMuted}`}>{a.time}</div>
                    </div>
                  </div>
                  <div className={`text-xs ${textMuted}`}>View</div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Upcoming */}
          <motion.div initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} className={`p-5 rounded-2xl ${cardBg} border w-full`}>
            <h4 className="font-semibold mb-3">Upcoming</h4>
            <div className={`text-sm ${textMuted}`}>No upcoming events — create one</div>
          </motion.div>
        </aside>
      </div>

      {/* Recent Invoices table */}
      <div className="mt-8">
        <div className={`p-6 rounded-2xl ${cardBg} border`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent invoices</h3>
            <div className={`text-sm ${textMuted}`}>Showing last 8</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm">
              <thead className={`text-xs ${textMuted} text-left`}>
                <tr>
                  <th className="pb-3">Invoice</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Due</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <tr key={i} className={`border-t ${borderColor} transition-colors`}>
                    <td className="py-3 font-medium">#00{100 + i}</td>
                    <td className="py-3">Company {i}</td>
                    <td className="py-3">${(100 + i * 20).toFixed(2)}</td>
                    <td className="py-3 text-sm text-green-500">Paid</td>
                    <td className={`py-3 ${textMuted}`}>{i} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      
    </div>
  );
}
