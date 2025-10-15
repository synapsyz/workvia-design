"use client";

import React, { useEffect, useState, useRef } from "react";
import Head from "next/head";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Calendar,
  momentLocalizer,
  Event as RBCEvent,
  View,
  EventPropGetter,
  SlotInfo,
} from "react-big-calendar";
import withDragAndDrop, { EventInteractionArgs } from "react-big-calendar/lib/addons/dragAndDrop";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

/* ---------- Calendar Setup ---------- */
const DnDCalendar = withDragAndDrop<MyEvent>(Calendar);
const localizer = momentLocalizer(moment);

interface MyEvent extends RBCEvent {
  id: number;
  type: "meeting" | "deadline" | "personal";
}

const initialEvents: MyEvent[] = [
  { id: 1, title: "Team Meeting", start: new Date(2025, 9, 6, 10), end: new Date(2025, 9, 6, 11), type: "meeting" },
  { id: 2, title: "Project Deadline", start: new Date(2025, 9, 7, 14), end: new Date(2025, 9, 7, 15), type: "deadline" },
  { id: 3, title: "Lunch with Sarah", start: new Date(2025, 9, 8, 12), end: new Date(2025, 9, 8, 13), type: "personal" },
];

export default function DashboardCalendar() {
  const [events, setEvents] = useState<MyEvent[]>(initialEvents);
  const [view, setView] = useState<View>("month");
  const [darkMode, setDarkMode] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);

  /* ---------- Theme Persistence ---------- */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "dark") setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  /* ---------- Theme Tokens ---------- */
  const cardBg = darkMode
    ? "bg-[#1E293B] border-[#334155] shadow-[0_8px_24px_rgba(2,6,23,0.35)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
    : "bg-white border-gray-100 shadow-sm";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-[#334155]" : "border-gray-200";

  /* ---------- Calendar Event Handlers ---------- */
  const handleSelectSlot = (slotInfo: SlotInfo) => {
    const title = prompt("Enter event title:");
    if (!title) return;
    const type = (prompt("Enter event type (meeting, deadline, personal):") as MyEvent["type"]) || "meeting";
    setEvents([...events, { id: events.length + 1, title, start: slotInfo.start, end: slotInfo.end, type }]);
  };

  const handleEventDrop = ({ event, start, end }: EventInteractionArgs<MyEvent>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === event.id ? { ...e, start: new Date(start), end: new Date(end) } : e))
    );
  };

  const handleEventResize = ({ event, start, end }: EventInteractionArgs<MyEvent>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === event.id ? { ...e, start: new Date(start), end: new Date(end) } : e))
    );
  };

  const handleSelectEvent = (event: MyEvent) => {
    const newTitle = prompt("Edit event title:", event.title) || event.title;
    setEvents((prev) => prev.map((e) => (e.id === event.id ? { ...e, title: newTitle } : e)));
  };

  const eventPropGetter: EventPropGetter<MyEvent> = (event) => {
    let backgroundColor = "#0A236E";
    if (event.type === "deadline") backgroundColor = "#E53E3E";
    if (event.type === "personal") backgroundColor = "#22C55E";
    return {
      style: {
        backgroundColor,
        color: "white",
        borderRadius: "8px",
        padding: "4px 6px",
        border: darkMode ? "1px solid #334155" : "1px solid #E5E7EB",
        boxShadow: darkMode ? "0 2px 6px rgba(59,130,246,0.2)" : "0 2px 6px rgba(10,35,110,0.15)",
      },
    };
  };

  /* ---------- Custom Toolbar ---------- */
  const CustomToolbar = (toolbar: any) => {
    const goToBack = () => toolbar.onNavigate("PREV");
    const goToNext = () => toolbar.onNavigate("NEXT");
    const goToToday = () => toolbar.onNavigate("TODAY");

    const btnClass = (active: boolean) =>
      `px-4 py-2 rounded-lg text-sm font-medium transition-all border ${borderColor} ${
        active
          ? "bg-[#0A236E] text-white shadow-md"
          : `${darkMode ? "bg-[#1E293B] text-gray-200 hover:bg-[#0A236E]/20" : "bg-white text-gray-700 hover:bg-[#0A236E]/10"}`
      }`;

    return (
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={goToBack} className={btnClass(false)}>
            <ChevronLeft className="w-4 h-4 inline-block mr-1" />
            Back
          </button>
          <button onClick={goToToday} className={btnClass(false)}>Today</button>
          <button onClick={goToNext} className={btnClass(false)}>
            Next
            <ChevronRight className="w-4 h-4 inline-block ml-1" />
          </button>
        </div>

        <div className="text-sm font-semibold">
          {typeof toolbar.label === "string" ? toolbar.label : String(toolbar.label ?? "")}
        </div>

        <div className="flex items-center gap-3">
          {["month", "week", "day"].map((v) => (
            <button
              key={v}
              onClick={() => toolbar.onView(v)}
              className={btnClass(toolbar.view === v)}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>Calendar — Workvia</title>
      </Head>

      <div
        className={`min-h-screen ${
          darkMode ? "bg-[#0A0F1E] text-white" : "bg-gray-50 text-gray-900"
        } transition-colors`}
      >
        <div className="flex">

          <main className="flex-1 p-6" ref={notifRef}>

            {/* Calendar Card */}
            <div className={`rounded-2xl border ${borderColor} ${cardBg} p-6`}>
              <div
                className={`mb-4 py-3 px-5 rounded-xl font-semibold text-lg text-white bg-gradient-to-r ${
                  darkMode ? "from-blue-800 to-blue-600" : "from-[#0A236E] to-blue-700"
                } shadow-md flex items-center justify-between`}
              >
                <span>Your Schedule</span>
              </div>

              <DnDCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 700 }}
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                onEventDrop={handleEventDrop}
                onEventResize={handleEventResize}
                resizable
                views={["month", "week", "day"]}
                view={view}
                onView={(v: View) => setView(v)}
                eventPropGetter={eventPropGetter}
                components={{ toolbar: CustomToolbar }}
              />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
