"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  Plus,
  Clock,
  Eye,
  Layers,
  Calendar,
  Search,
  Filter,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Info,
  FileText,
  Play,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ============== Types ============== */
// Defined a specific type for a section
interface Section {
  title: string;
  duration: string | number;
}

interface Question {
  id: number;
  question: string;
  options?: string[];
  type: "single" | "multi" | "fill" | "match";
}

interface Exam {
  id: number;
  title: string;
  description: string;
  duration: string;
  marksPerQuestion: number;
  negativeMarks: number;
  scheduleStart: string;
  scheduleEnd: string;
  visibility: "public" | "private";
  hasSections: boolean;
  sections?: Section[]; // Used the new Section interface
  totalQuestions: number;
  date: string;
  questions?: Question[];
}

// Defined types for filter states to avoid using 'any'
type FilterTab = "today" | "upcoming" | "completed";
type VisibilityFilter = "all" | "public" | "private";
type HasSectionsFilter = "all" | "yes" | "no";

export default function ExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<FilterTab>("today");
  const [visibilityFilter, setVisibilityFilter] =
    useState<VisibilityFilter>("all");
  const [hasSectionsFilter, setHasSectionsFilter] =
    useState<HasSectionsFilter>("all");

  const [previewExam, setPreviewExam] = useState<Exam | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [previewStep, setPreviewStep] = useState<"info" | "description" | "exam">(
    "info"
  );

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("exams") || "[]");
    setExams(saved);
  }, []);

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this exam?")) return;
    const updated = exams.filter((e) => e.id !== id);
    setExams(updated);
    localStorage.setItem("exams", JSON.stringify(updated));
  };

  const today = new Date();

  /* ============== Filtering Logic ============== */
  const filteredExams = exams.filter((exam) => {
    const textMatch =
      exam.title.toLowerCase().includes(search.toLowerCase()) ||
      exam.description.toLowerCase().includes(search.toLowerCase());

    if (visibilityFilter !== "all" && exam.visibility !== visibilityFilter)
      return false;
    if (hasSectionsFilter === "yes" && !exam.hasSections) return false;
    if (hasSectionsFilter === "no" && exam.hasSections) return false;
    return textMatch;
  });

  const todayExams = filteredExams.filter((e) => {
    const start = new Date(e.scheduleStart);
    const end = new Date(e.scheduleEnd);
    return (
      start.toDateString() === today.toDateString() ||
      (start <= today && end >= today)
    );
  });

  const upcomingExams = filteredExams.filter(
    (e) => new Date(e.scheduleStart) > today
  );

  const completedExams = filteredExams.filter(
    (e) => new Date(e.scheduleEnd) < today
  );

  const getFilteredList = () => {
    if (filterTab === "today") return todayExams;
    if (filterTab === "upcoming") return upcomingExams;
    if (filterTab === "completed") return completedExams;
    return [];
  };

  const examsToShow = getFilteredList();

  /* ============== Preview Modal ============== */
  const renderExamPreview = () => {
    if (!previewExam) return null;

    const questions: Question[] = previewExam.questions?.length
      ? previewExam.questions
      : [
          {
            id: 1,
            question: "Example Question 1: What is 2 + 2?",
            options: ["1", "2", "3", "4"],
            type: "single",
          },
          {
            id: 2,
            question: "Example Question 2: Which are prime numbers?",
            options: ["2", "3", "4", "5"],
            type: "multi",
          },
          {
            id: 3,
            question: "Example Question 3: The capital of India is _____.",
            type: "fill",
          },
        ];

    const current = questions[currentQuestionIndex];

    return (
      <motion.div
        key="jee-preview"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-[#0A0F1E] text-white flex flex-col"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center bg-[#13294B] px-6 py-3 border-b border-[#1E3A8A]">
          <h3 className="text-lg font-semibold">{previewExam.title}</h3>
          <button
            onClick={() => {
              setPreviewExam(null);
              setPreviewStep("info");
            }}
            className="flex items-center gap-1 text-sm bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md transition"
          >
            <X className="w-4 h-4" /> Exit
          </button>
        </div>

        {/* STEP 1 — Exam Info */}
        {previewStep === "info" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <Info className="w-10 h-10 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {previewExam.title} — Exam Details
            </h3>
            <div className="text-sm text-gray-300 max-w-md space-y-2">
              <p>
                <strong>Start Date:</strong>{" "}
                {new Date(previewExam.scheduleStart).toLocaleString()}
              </p>
              <p>
                <strong>End Date:</strong>{" "}
                {new Date(previewExam.scheduleEnd).toLocaleString()}
              </p>
              <p>
                <strong>Duration:</strong> {previewExam.duration} minutes
              </p>
              <p>
                <strong>Marking Scheme:</strong> +{previewExam.marksPerQuestion}{" "}
                / -{previewExam.negativeMarks}
              </p>
              <p>
                <strong>Sections:</strong>{" "}
                {previewExam.hasSections
                  ? `${previewExam.sections?.length || 0} sections`
                  : "No sections"}
              </p>
              {previewExam.sections?.map((s: Section, i: number) => (
                <p key={i}>
                  Section {i + 1}: {s.title || "Untitled"} —{" "}
                  {s.duration || "N/A"} min
                </p>
              ))}
            </div>

            <button
              onClick={() => setPreviewStep("description")}
              className="mt-6 bg-[#1E3A8A] hover:bg-[#0A236E] px-6 py-2 rounded-lg text-sm font-medium"
            >
              Next
            </button>
          </div>
        )}

        {/* STEP 2 — Exam Description + Start */}
        {previewStep === "description" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <FileText className="w-10 h-10 text-yellow-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Exam Instructions</h3>
            <p className="text-sm text-gray-300 max-w-xl mb-6 leading-relaxed">
              {previewExam.description || "No description provided."}
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Please ensure you have a stable internet connection. Once started,
              the timer will not stop. Do you want to begin the exam now?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setPreviewStep("info")}
                className="px-5 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-sm"
              >
                Back
              </button>
              <button
                onClick={() => setPreviewStep("exam")}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-sm"
              >
                <Play className="w-4 h-4" /> Start Exam
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Full Exam Screen */}
        {previewStep === "exam" && (
          <div className="flex flex-1">
            {/* Left Panel — Question Palette */}
            <div className="w-1/4 bg-[#1E293B] border-r border-[#334155] p-4 flex flex-col">
              <h4 className="text-sm font-semibold mb-3 border-b border-[#334155] pb-2">
                Question Palette
              </h4>
              <div className="grid grid-cols-5 gap-2 overflow-y-auto">
                {questions.map((q, i) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(i)}
                    className={`w-8 h-8 text-xs rounded-md font-semibold ${
                      i === currentQuestionIndex
                        ? "bg-[#0A236E] text-white"
                        : "bg-[#334155] hover:bg-[#475569]"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <div className="mt-4 border-t border-[#334155] pt-3 text-xs text-gray-400">
                <p className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-400" /> Answered
                </p>
                <p className="flex items-center gap-1 mt-1">
                  <Eye className="w-3 h-3 text-blue-400" /> Viewed
                </p>
                <p className="flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-yellow-400" /> Not Visited
                </p>
              </div>
            </div>

            {/* Right Panel — Question Display */}
            <div className="flex-1 flex flex-col bg-[#0F172A] p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-base font-semibold">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </h4>
                <span className="text-sm text-gray-400">
                  Marks: {previewExam.marksPerQuestion} | Negative: -
                  {previewExam.negativeMarks}
                </span>
              </div>

              <div className="text-sm leading-relaxed mb-6">
                {current.question}
              </div>

              {current.type === "single" &&
                current.options?.map((opt, idx) => (
                  <label
                    key={idx}
                    className="flex items-center gap-2 mb-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={`q-${current.id}`}
                      className="accent-[#0A236E]"
                    />
                    {opt}
                  </label>
                ))}

              {current.type === "multi" &&
                current.options?.map((opt, idx) => (
                  <label
                    key={idx}
                    className="flex items-center gap-2 mb-2 cursor-pointer"
                  >
                    <input type="checkbox" className="accent-[#0A236E]" />
                    {opt}
                  </label>
                ))}

              {current.type === "fill" && (
                <input
                  type="text"
                  placeholder="Enter your answer"
                  className="mt-2 w-1/2 px-3 py-2 rounded-md bg-[#1E293B] border border-[#334155] text-sm outline-none focus:ring-2 focus:ring-[#0A236E]"
                />
              )}

              <div className="flex justify-between items-center mt-8">
                <button
                  onClick={() =>
                    setCurrentQuestionIndex((i) => (i > 0 ? i - 1 : i))
                  }
                  className="flex items-center gap-1 bg-[#1E3A8A] px-3 py-2 rounded-md text-sm hover:bg-[#0A236E]"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentQuestionIndex((i) =>
                      i < questions.length - 1 ? i + 1 : i
                    )
                  }
                  className="flex items-center gap-1 bg-[#1E3A8A] px-3 py-2 rounded-md text-sm hover:bg-[#0A236E]"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  /* ============== Exam Card ============== */
  const renderExamCard = (exam: Exam) => (
    <motion.div
      key={exam.id}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex justify-between items-start border border-gray-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold">{exam.title}</h3>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded ${
              exam.visibility === "public"
                ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
            }`}
          >
            {exam.visibility.toUpperCase()}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 max-w-md">
          {exam.description || "No description provided"}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mt-2">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" /> {exam.duration} min
          </span>
          <span className="flex items-center gap-1">
            <Layers className="w-4 h-4" />{" "}
            {exam.hasSections
              ? `${exam.sections?.length || 0} Sections`
              : "No Sections"}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" /> {exam.totalQuestions} Qs
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />{" "}
            {exam.scheduleStart
              ? new Date(exam.scheduleStart).toLocaleString()
              : "—"}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />{" "}
            {exam.scheduleEnd
              ? new Date(exam.scheduleEnd).toLocaleString()
              : "—"}
          </span>
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Marks: {exam.marksPerQuestion} | Negative: -{exam.negativeMarks}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          Created: {new Date(exam.date).toLocaleDateString()}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setPreviewExam(exam);
              setPreviewStep("info");
            }}
            className="text-green-600 hover:text-green-700 text-sm inline-flex items-center gap-1"
          >
            <Eye className="w-4 h-4" /> Preview
          </button>
          <button
            onClick={() =>
              router.push(`/dashboard/exam/create?edit=${exam.id}`)
            }
            className="text-blue-500 hover:text-blue-600 text-sm inline-flex items-center gap-1"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => handleDelete(exam.id)}
            className="text-red-500 hover:text-red-600 text-sm inline-flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>
    </motion.div>
  );

  /* ============== Main Return ============== */
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0F1E] text-gray-900 dark:text-white p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-semibold flex items-center gap-2"
        >
          <Layers className="w-6 h-6 text-[#0A236E]" /> Exams
        </motion.h2>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/dashboard/exam/create")}
          className="inline-flex items-center gap-2 bg-[#0A236E] text-white px-4 py-2 rounded-lg hover:bg-[#1E3A8A] transition"
        >
          <Plus className="w-4 h-4" />
          Create Exam
        </motion.button>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6"
      >
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search exams..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1E293B] text-sm focus:ring-2 focus:ring-[#0A236E] outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 text-sm">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={visibilityFilter}
            onChange={(e) =>
              setVisibilityFilter(e.target.value as VisibilityFilter)
            }
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1E293B] focus:ring-2 focus:ring-[#0A236E]"
          >
            <option value="all">All Visibility</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>

          <select
            value={hasSectionsFilter}
            onChange={(e) =>
              setHasSectionsFilter(e.target.value as HasSectionsFilter)
            }
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1E293B] focus:ring-2 focus:ring-[#0A236E]"
          >
            <option value="all">All Types</option>
            <option value="yes">With Sections</option>
            <option value="no">Without Sections</option>
          </select>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6 border-b border-gray-200 dark:border-[#334155] pb-2">
        {[
          { key: "today", icon: Calendar, label: "Today" },
          { key: "upcoming", icon: Clock, label: "Upcoming" },
          { key: "completed", icon: Eye, label: "Completed" },
        ].map((tab) => (
          <motion.button
            key={tab.key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setFilterTab(tab.key as FilterTab)}
            className={`capitalize px-4 py-2 rounded-md transition text-sm font-medium flex items-center gap-2 ${
              filterTab === tab.key
                ? "bg-[#0A236E] text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/30 dark:hover:bg-[#1E293B]"
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Exam List */}
      <AnimatePresence mode="popLayout">
        {examsToShow.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-gray-500 dark:text-gray-400 mt-20"
          >
            <p className="text-lg">No exams found in this category.</p>
          </motion.div>
        ) : (
          <motion.div layout className="flex flex-col gap-4">
            {examsToShow.map((exam) => renderExamCard(exam))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>{previewExam && renderExamPreview()}</AnimatePresence>
    </div>
  );
}