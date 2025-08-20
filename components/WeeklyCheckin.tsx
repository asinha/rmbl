import { useState } from "react";
import { CheckCircle, ChevronDown, ArrowRight } from "lucide-react";

export default function WeeklyCheckinSchedule() {
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const times = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
  ];

  const handleSubmit = () => {
    if (!selectedDay || !selectedTime) {
      alert("Please select both a day and time");
      return;
    }
    console.log("Schedule set:", { day: selectedDay, time: selectedTime });
    // Handle form submission here
  };

  const isFormValid = selectedDay && selectedTime;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 font-['Inter',sans-serif]">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-500">
            <CheckCircle className="text-white w-9 h-9" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Set Your Check-in Schedule
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Before we start, please set your preferred day and time for weekly
            accountability check-ins. This is required to personalize your
            experience.
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-8">
          <div className="space-y-6">
            <div>
              <label
                htmlFor="day"
                className="block text-sm font-medium text-gray-700 text-left mb-1"
              >
                Preferred Day *
              </label>
              <div className="relative">
                <select
                  id="day"
                  name="day"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                >
                  <option value="">Select a day</option>
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDown className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="time"
                className="block text-sm font-medium text-gray-700 text-left mb-1"
              >
                Preferred Time *
              </label>
              <div className="relative">
                <select
                  id="time"
                  name="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                >
                  <option value="">Select a time</option>
                  {times.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDown className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={!isFormValid}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-colors ${
                isFormValid
                  ? "bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Start Check-in
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          Both fields are required. You can change this anytime in your profile
          settings.
        </p>
      </div>
    </div>
  );
}
