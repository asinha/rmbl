import { useState } from "react";
import {
  TrendingUp,
  Plus,
  Target,
  BarChart3,
  Flame,
  Clock,
  Calendar,
  ChevronRight,
} from "lucide-react";

export default function ProgressDashboard() {
  const [activeTab, setActiveTab] = useState("weekly");

  const stats = [
    {
      icon: Target,
      value: "3",
      label: "Check-ins",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      icon: BarChart3,
      value: "78%",
      label: "Avg. Progress",
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      icon: Flame,
      value: "3",
      label: "Week Streak",
      bgColor: "bg-orange-100",
      iconColor: "text-orange-500",
    },
    {
      icon: Clock,
      value: "1h 5m",
      label: "Total Time",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  const checkins = [
    {
      id: 1,
      dateRange: "Jan 15 - Jan 21, 2024",
      completed: "2024-01-21",
      questions: "5/5 questions",
      tag: "Productive",
      tagColor: "bg-blue-100 text-blue-800",
    },
    {
      id: 2,
      dateRange: "Jan 8 - Jan 14, 2024",
      completed: "2024-01-14",
      questions: "5/5 questions",
      tag: "Focused",
      tagColor: "bg-indigo-100 text-indigo-800",
    },
    {
      id: 3,
      dateRange: "Jan 1 - Jan 7, 2024",
      completed: "2024-01-07",
      questions: "4/5 questions",
      tag: "Motivated",
      tagColor: "bg-yellow-100 text-yellow-800",
    },
  ];

  const tabs = [
    { id: "weekly", label: "Weekly Check-ins" },
    { id: "recordings", label: "All Recordings" },
    { id: "insights", label: "Insights" },
  ];

  return (
    <div className="bg-gray-50 min-h-screen p-8 font-['Inter',sans-serif]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg mr-4">
              <TrendingUp className="text-green-600 w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Progress Dashboard
              </h1>
              <p className="text-gray-500">
                Track your growth and accountability journey
              </p>
            </div>
          </div>
          <button className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center shadow-sm hover:bg-green-700 transition-colors">
            <Plus className="w-5 h-5 mr-2" />
            New Check-in
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className="bg-white p-6 rounded-xl border border-gray-200 flex items-center"
              >
                <div className={`${stat.bgColor} p-3 rounded-full mr-4`}>
                  <IconComponent className={`${stat.iconColor} w-6 h-6`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {stat.value}
                  </p>
                  <p className="text-gray-500">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 p-1 mb-8">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-6 text-center font-semibold rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "text-gray-800 bg-white shadow-sm"
                    : "font-medium text-gray-500 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Check-ins List */}
        <div className="space-y-4">
          {checkins.map((checkin) => (
            <div
              key={checkin.id}
              className="bg-white p-5 rounded-xl border border-gray-200 flex items-center justify-between hover:shadow-sm transition-shadow cursor-pointer"
            >
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg mr-4">
                  <Calendar className="text-green-600 w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {checkin.dateRange}
                  </p>
                  <p className="text-sm text-gray-500">
                    Completed {checkin.completed}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {checkin.questions}
                </span>
                <span
                  className={`${checkin.tagColor} text-sm font-medium px-3 py-1 rounded-full`}
                >
                  {checkin.tag}
                </span>
                <ChevronRight className="text-gray-400 w-5 h-5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
