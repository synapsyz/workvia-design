"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Save, X, Plus, Upload, Clock } from "lucide-react";

/* =========================
   Types
========================= */
type Visibility = "public" | "private";

type QuestionType = "single" | "multi" | "fill" | "match";

interface MatchPair {
  left: string;
  right: string;
}

interface MediaMap {
  image?: string; // object URL
  audio?: string; // object URL
  video?: string; // object URL
}

interface Question {
  id: number;
  type: QuestionType;
  question: string;
  options: string[];           // single/multi only
  correctAnswers: string[];    // single: [val] | multi: [val1,val2...] | fill: [answer]
  matchPairs?: MatchPair[];    // match only
  media?: MediaMap;            // previews
}

interface Section {
  id: number;
  name: string;
  duration: string;      // minutes as string for the input
  questionRange: string; // raw input e.g. "1-5,7,10-12"
  questionIds: number[]; // derived from questionRange
}

/* =========================
   Page
========================= */
export default function CreateExamPage() {
  const router = useRouter();

  /* ---------- Core fields ---------- */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  /* ---------- Scheduling ---------- */
  const [scheduleStart, setScheduleStart] = useState("");
  const [scheduleEnd, setScheduleEnd] = useState("");

  /* ---------- Visibility ---------- */
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [assignedGroups, setAssignedGroups] = useState<string[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);

  /* ---------- Scoring & Toggles ---------- */
  const [marks, setMarks] = useState<number>(4);
  const [negativeMarks, setNegativeMarks] = useState<number>(1);
  const [shuffle, setShuffle] = useState<boolean>(false);

  /* ---------- Sections ---------- */
  const [hasSections, setHasSections] = useState<boolean>(false);
  const [overallDuration, setOverallDuration] = useState<string>(""); // used when hasSections = false
  const [sections, setSections] = useState<Section[]>([]);

  /* ---------- Questions ---------- */
  const [questions, setQuestions] = useState<Question[]>([]);

  /* ---------- Errors ---------- */
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    document.title = "Createexam | Instruckt";
  }, []);

  /* =========================
     Helpers
  ========================= */

  // Parses text like "1-5,7,10-12" to [1,2,3,4,5,7,10,11,12]
  const parseQuestionRange = (range: string): number[] => {
    const result: number[] = [];
    if (!range.trim()) return result;

    const parts = range.split(",").map((p) => p.trim()).filter(Boolean);
    for (const part of parts) {
      if (part.includes("-")) {
        const [startStr, endStr] = part.split("-").map((n) => n.trim());
        const start = Number(startStr);
        const end = Number(endStr);
        if (!isNaN(start) && !isNaN(end) && start >= 1 && end >= start) {
          for (let i = start; i <= end; i++) result.push(i);
        }
      } else {
        const n = Number(part);
        if (!isNaN(n) && n >= 1) result.push(n);
      }
    }
    return Array.from(new Set(result));
  };

  const totalDurationFromSections = () =>
    sections.reduce((sum, s) => sum + (Number(s.duration) || 0), 0);

  /* =========================
     Question Handlers
  ========================= */
  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: prev.length + 1, // 1-based so ranges are intuitive
        type: "single",
        question: "",
        options: ["", "", "", ""],
        correctAnswers: [],
        matchPairs: [],
        media: {},
      },
    ]);
  };

  const setQuestionType = (qid: number, type: QuestionType) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qid
          ? {
              ...q,
              type,
              options: type === "single" || type === "multi" ? (q.options.length ? q.options : ["", "", "", ""]) : [],
              correctAnswers: [],
              matchPairs:
                type === "match"
                  ? (q.matchPairs && q.matchPairs.length
                      ? q.matchPairs
                      : [
                          { left: "", right: "" },
                          { left: "", right: "" },
                          { left: "", right: "" },
                        ])
                  : [],
            }
          : q
      )
    );
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    qid: number,
    kind: keyof MediaMap
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file); // preview only
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qid ? { ...q, media: { ...q.media, [kind]: url } } : q
      )
    );
  };

  const addMatchPair = (qid: number) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qid
          ? {
              ...q,
              matchPairs: [...(q.matchPairs || []), { left: "", right: "" }],
            }
          : q
      )
    );
  };

  /* =========================
     Section Handlers
  ========================= */
  const addSection = () => {
    setSections((prev) => [
      ...prev,
      { id: Date.now(), name: "", duration: "", questionRange: "", questionIds: [] },
    ]);
  };

  const onSectionRangeChange = (id: number, value: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, questionRange: value, questionIds: parseQuestionRange(value) }
          : s
      )
    );
  };

  /* =========================
     Cancel / Save
  ========================= */
  const handleCancel = () => {
    router.push("/dashboard/exam");
  };

  const validate = () => {
    const e: Record<string, string> = {};

    if (!title.trim()) e.title = "Title is required.";
    if (!description.trim()) e.description = "Description is required.";
    if (!scheduleStart.trim()) e.schedule = "Start date & time is required.";

    if (hasSections) {
      if (sections.length === 0) {
        e.sections = "Add at least one section or disable sections.";
      } else {
        sections.forEach((s, idx) => {
          if (!s.name.trim()) e[`sec_name_${s.id}`] = `Section ${idx + 1}: name is required.`;
          if (!s.duration.trim()) e[`sec_dur_${s.id}`] = `Section ${idx + 1}: duration is required.`;
          // Range not mandatory, but allowed to be blank
        });
      }
    } else {
      if (!overallDuration.trim()) e.duration = "Duration is required when sections are disabled.";
    }

    if (visibility === "private" && assignedGroups.length === 0 && assignedUsers.length === 0) {
      e.visibility = "Assign at least one group or user for a private exam.";
    }

    if (questions.length === 0) e.questions = "Add at least one question.";
    questions.forEach((q) => {
      if (!q.question.trim()) e[`q_${q.id}`] = `Question ${q.id}: text is required.`;
      if (q.type === "single" || q.type === "multi") {
        if (q.options.some((o) => !o.trim())) e[`q_opt_${q.id}`] = `Question ${q.id}: options cannot be empty.`;
        if (q.type === "single" && q.correctAnswers.length !== 1)
          e[`q_ans_${q.id}`] = `Question ${q.id}: select exactly one correct answer.`;
        if (q.type === "multi" && q.correctAnswers.length === 0)
          e[`q_ans_${q.id}`] = `Question ${q.id}: select at least one correct answer.`;
      }
      if (q.type === "fill") {
        if (q.correctAnswers.length !== 1 || !q.correctAnswers[0]?.trim())
          e[`q_fill_${q.id}`] = `Question ${q.id}: fill-in answer is required.`;
      }
      if (q.type === "match") {
        if (!q.matchPairs || q.matchPairs.length === 0)
          e[`q_match_${q.id}`] = `Question ${q.id}: add at least one pair.`;
        else if (q.matchPairs.some((p) => !p.left.trim() || !p.right.trim()))
          e[`q_match_${q.id}`] = `Question ${q.id}: all match pairs must be filled.`;
      }
    });

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSaveExam = () => {
    if (!validate()) return;

    // Compute total duration
    const computedDuration = hasSections ? String(totalDurationFromSections()) : overallDuration;

    const newExam = {
      id: Date.now(),
      title,
      description,
      scheduleStart,
      scheduleEnd,
      visibility,
      assignedGroups,
      assignedUsers,
      marksPerQuestion: marks,
      negativeMarks,
      shuffle,
      hasSections,
      sections,
      duration: computedDuration, // for simple display on listing
      totalQuestions: questions.length,
      questions, // full structure saved
      date: new Date().toISOString().split("T")[0],
    };

    const existing = JSON.parse(localStorage.getItem("exams") || "[]");
    localStorage.setItem("exams", JSON.stringify([...existing, newExam]));

    alert("✅ Exam saved!");
    router.push("/dashboard/exam");
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0F1E] p-6 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Create Exam</h2>
        <button
          onClick={handleCancel}
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:underline"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>

      <div className="max-w-5xl mx-auto bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-[#334155] rounded-2xl p-6">
        {/* Title & Description */}
        <div className="mb-6 grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Exam Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-200 dark:border-[#334155] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#0F172A]"
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {!hasSections && (
            <div>
              <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
              <input
                type="number"
                min={1}
                value={overallDuration}
                onChange={(e) => setOverallDuration(e.target.value)}
                className="w-full border border-gray-200 dark:border-[#334155] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#0F172A]"
              />
              {errors.duration && <p className="text-xs text-red-500 mt-1">{errors.duration}</p>}
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Exam Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-200 dark:border-[#334155] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#0F172A] resize-none"
          />
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
        </div>

        {/* Schedule */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Exam Schedule</label>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs mb-1">Start Date & Time</label>
              <input
                type="datetime-local"
                value={scheduleStart}
                onChange={(e) => setScheduleStart(e.target.value)}
                className="w-full border border-gray-200 dark:border-[#334155] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#0F172A]"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">End Date & Time</label>
              <input
                type="datetime-local"
                value={scheduleEnd}
                onChange={(e) => setScheduleEnd(e.target.value)}
                className="w-full border border-gray-200 dark:border-[#334155] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#0F172A]"
              />
            </div>
          </div>
          {errors.schedule && <p className="text-xs text-red-500 mt-1">{errors.schedule}</p>}
        </div>

        {/* Visibility */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Visibility</label>
          <div className="flex gap-6 mb-3">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="visibility"
                checked={visibility === "public"}
                onChange={() => setVisibility("public")}
                className="accent-[#0A236E]"
              />
              Public
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="visibility"
                checked={visibility === "private"}
                onChange={() => setVisibility("private")}
                className="accent-[#0A236E]"
              />
              Private
            </label>
          </div>

          {visibility === "private" && (
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs mb-1 font-medium">Assign Groups</label>
                <select
                  multiple
                  value={assignedGroups}
                  onChange={(e) =>
                    setAssignedGroups(Array.from(e.target.selectedOptions, (opt) => opt.value))
                  }
                  className="w-full border border-gray-200 dark:border-[#334155] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#0F172A]"
                >
                  <option value="Production">Production</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="QA">QA</option>
                  <option value="R&D">R&D</option>
                  <option value="Training">Training</option>
                </select>
              </div>

              <div>
                <label className="block text-xs mb-1 font-medium">Assign Users</label>
                <select
                  multiple
                  value={assignedUsers}
                  onChange={(e) =>
                    setAssignedUsers(Array.from(e.target.selectedOptions, (opt) => opt.value))
                  }
                  className="w-full border border-gray-200 dark:border-[#334155] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#0F172A]"
                >
                  <option value="Arun Singh">Arun Singh</option>
                  <option value="Priya Nair">Priya Nair</option>
                  <option value="Ravi Patel">Ravi Patel</option>
                  <option value="David Chen">David Chen</option>
                  <option value="Maria Gomez">Maria Gomez</option>
                </select>
              </div>
            </div>
          )}
          {errors.visibility && <p className="text-xs text-red-500 mt-2">{errors.visibility}</p>}
        </div>

        {/* Scoring & Toggles */}
        <div className="grid sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Marks per Question</label>
            <input
              type="number"
              value={marks}
              onChange={(e) => setMarks(Number(e.target.value))}
              className="w-full border border-gray-200 dark:border-[#334155] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#0F172A]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Negative Marks</label>
            <input
              type="number"
              value={negativeMarks}
              onChange={(e) => setNegativeMarks(Number(e.target.value))}
              className="w-full border border-gray-200 dark:border-[#334155] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#0F172A]"
            />
          </div>
        </div>

        <div className="flex items-center gap-6 mb-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={shuffle}
              onChange={(e) => setShuffle(e.target.checked)}
              className="w-4 h-4 accent-[#0A236E]"
            />
            Shuffle Questions
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={hasSections}
              onChange={(e) => setHasSections(e.target.checked)}
              className="w-4 h-4 accent-[#0A236E]"
            />
            Enable Sections
          </label>
        </div>

        {/* Sections */}
        {hasSections && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Sections</h3>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={addSection}
                className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-[#334155] rounded-lg hover:bg-gray-100 dark:hover:bg-[#334155] transition text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Section
              </motion.button>
            </div>

            {sections.map((s, idx) => (
              <div
                key={s.id}
                className="border border-gray-200 dark:border-[#334155] rounded-xl p-4 mb-4 bg-gray-50 dark:bg-[#1E293B]"
              >
                <div className="font-medium text-[#0A236E] mb-3">
                  Section {idx + 1}
                </div>

                <input
                  placeholder="Section Name (e.g., Physics)"
                  value={s.name}
                  onChange={(e) =>
                    setSections((prev) =>
                      prev.map((x) => (x.id === s.id ? { ...x, name: e.target.value } : x))
                    )
                  }
                  className="w-full border border-gray-200 dark:border-[#334155] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#0F172A] outline-none mb-3"
                />

                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <input
                    type="number"
                    min={1}
                    placeholder="Section Duration (min)"
                    value={s.duration}
                    onChange={(e) =>
                      setSections((prev) =>
                        prev.map((x) => (x.id === s.id ? { ...x, duration: e.target.value } : x))
                      )
                    }
                    className="w-full border border-gray-200 dark:border-[#334155] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#0F172A] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium block mb-1">
                    Question Range (e.g., <b>1-5</b> or <b>1-3,5,7</b>)
                  </label>
                  <input
                    placeholder="Enter range like 1-5 or 2,4,6 or 3-7,10-12"
                    value={s.questionRange}
                    onChange={(e) => onSectionRangeChange(s.id, e.target.value)}
                    className="w-full border border-gray-200 dark:border-[#334155] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#0F172A] outline-none"
                  />
                  {s.questionIds.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Will include questions: {s.questionIds.join(", ")}
                    </p>
                  )}
                </div>

                {errors[`sec_name_${s.id}`] && (
                  <p className="text-xs text-red-500 mt-2">{errors[`sec_name_${s.id}`]}</p>
                )}
                {errors[`sec_dur_${s.id}`] && (
                  <p className="text-xs text-red-500 mt-1">{errors[`sec_dur_${s.id}`]}</p>
                )}
              </div>
            ))}

            {errors.sections && (
              <p className="text-xs text-red-500 -mt-2 mb-4">{errors.sections}</p>
            )}

            <div className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              Total duration (sum of sections): <b>{totalDurationFromSections()} min</b>
            </div>
          </div>
        )}

        {/* Questions */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Questions</h3>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={addQuestion}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-[#334155] rounded-lg hover:bg-gray-100 dark:hover:bg-[#334155] transition text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </motion.button>
        </div>
        {errors.questions && <p className="text-xs text-red-500 mb-2">{errors.questions}</p>}

        {questions.map((q, i) => (
          <div
            key={q.id}
            className="border border-gray-200 dark:border-[#334155] rounded-lg p-4 mb-4 bg-gray-50 dark:bg-[#1E293B]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium">Question {i + 1}</div>
              <select
                value={q.type}
                onChange={(e) => setQuestionType(q.id, e.target.value as QuestionType)}
                className="border border-gray-200 dark:border-[#334155] rounded-md text-sm bg-white dark:bg-[#0F172A] px-2 py-1"
              >
                <option value="single">Single Correct (MCQ)</option>
                <option value="multi">Multiple Correct</option>
                <option value="fill">Fill in the Blanks</option>
                <option value="match">Match the Following</option>
              </select>
            </div>

            <textarea
              value={q.question}
              onChange={(e) =>
                setQuestions((prev) =>
                  prev.map((item) => (item.id === q.id ? { ...item, question: e.target.value } : item))
                )
              }
              placeholder="Enter question text"
              rows={2}
              className="w-full border border-gray-200 dark:border-[#334155] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#0F172A] mb-3 resize-none"
            />
            {errors[`q_${q.id}`] && <p className="text-xs text-red-500 mb-2">{errors[`q_${q.id}`]}</p>}

            {/* Media Uploads */}
            <div className="flex flex-wrap gap-3 mb-3">
              {(["image", "audio", "video"] as const).map((kind) => (
                <label
                  key={kind}
                  className="flex items-center gap-2 text-sm cursor-pointer border border-gray-300 dark:border-[#334155] rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#334155]"
                >
                  <Upload className="w-4 h-4" />
                  Upload {kind}
                  <input
                    type="file"
                    accept={kind === "image" ? "image/*" : kind === "audio" ? "audio/*" : "video/*"}
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, q.id, kind)}
                  />
                </label>
              ))}
            </div>

            {/* Media Previews */}
            <div className="flex flex-wrap gap-3 mb-3">
              {q.media?.image && (
                <img src={q.media.image} className="w-32 h-20 object-cover rounded-md border" />
              )}
              {q.media?.audio && (
                <audio controls className="h-10">
                  <source src={q.media.audio} />
                </audio>
              )}
              {q.media?.video && (
                <video controls className="w-48 rounded-md">
                  <source src={q.media.video} />
                </video>
              )}
            </div>

            {/* Question Type Blocks */}
            {(q.type === "single" || q.type === "multi") && (
              <>
                {q.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <input
                      type={q.type === "single" ? "radio" : "checkbox"}
                      name={`q-${q.id}`}
                      checked={q.type === "single" ? q.correctAnswers[0] === opt && !!opt.trim() : q.correctAnswers.includes(opt) && !!opt.trim()}
                      onChange={(e) => {
                        setQuestions((prev) =>
                          prev.map((item) => {
                            if (item.id !== q.id) return item;
                            if (q.type === "single") {
                              // single → exactly one correct (choose the current opt)
                              return { ...item, correctAnswers: opt.trim() ? [opt] : [] };
                            }
                            // multi → toggle in array
                            const exists = item.correctAnswers.includes(opt);
                            const next = e.target.checked
                              ? [...item.correctAnswers, opt]
                              : item.correctAnswers.filter((a) => a !== opt);
                            return { ...item, correctAnswers: next };
                          })
                        );
                      }}
                    />
                    <input
                      value={opt}
                      onChange={(e) =>
                        setQuestions((prev) =>
                          prev.map((item) =>
                            item.id === q.id
                              ? {
                                  ...item,
                                  options: item.options.map((o, j) => (j === idx ? e.target.value : o)),
                                  // if you change an option that was selected as correct, update the correctAnswers too
                                  correctAnswers: item.correctAnswers.map((a) => (a === opt ? e.target.value : a)),
                                }
                              : item
                          )
                        )
                      }
                      placeholder={`Option ${idx + 1}`}
                      className="flex-1 border border-gray-200 dark:border-[#334155] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#0F172A]"
                    />
                  </div>
                ))}
                {errors[`q_opt_${q.id}`] && (
                  <p className="text-xs text-red-500 mt-1">{errors[`q_opt_${q.id}`]}</p>
                )}
                {errors[`q_ans_${q.id}`] && (
                  <p className="text-xs text-red-500 mt-1">{errors[`q_ans_${q.id}`]}</p>
                )}
              </>
            )}

            {q.type === "fill" && (
              <div className="mt-2">
                <label className="block text-xs mb-1 font-medium">Correct Answer</label>
                <input
                  value={q.correctAnswers[0] || ""}
                  onChange={(e) =>
                    setQuestions((prev) =>
                      prev.map((item) =>
                        item.id === q.id ? { ...item, correctAnswers: [e.target.value] } : item
                      )
                    )
                  }
                  placeholder="Enter the correct word/phrase"
                  className="w-full border border-gray-200 dark:border-[#334155] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#0F172A]"
                />
                {errors[`q_fill_${q.id}`] && (
                  <p className="text-xs text-red-500 mt-1">{errors[`q_fill_${q.id}`]}</p>
                )}
              </div>
            )}

            {q.type === "match" && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium">Match Pairs</span>
                  <button
                    onClick={() => addMatchPair(q.id)}
                    className="text-xs border px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-[#334155]"
                  >
                    + Add Pair
                  </button>
                </div>
                {q.matchPairs?.map((pair, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      value={pair.left}
                      onChange={(e) =>
                        setQuestions((prev) =>
                          prev.map((item) =>
                            item.id === q.id
                              ? {
                                  ...item,
                                  matchPairs: item.matchPairs?.map((p, j) =>
                                    j === idx ? { ...p, left: e.target.value } : p
                                  ),
                                }
                              : item
                          )
                        )
                      }
                      placeholder={`Left ${idx + 1}`}
                      className="flex-1 border border-gray-200 dark:border-[#334155] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#0F172A]"
                    />
                    <input
                      value={pair.right}
                      onChange={(e) =>
                        setQuestions((prev) =>
                          prev.map((item) =>
                            item.id === q.id
                              ? {
                                  ...item,
                                  matchPairs: item.matchPairs?.map((p, j) =>
                                    j === idx ? { ...p, right: e.target.value } : p
                                  ),
                                }
                              : item
                          )
                        )
                      }
                      placeholder={`Right ${idx + 1}`}
                      className="flex-1 border border-gray-200 dark:border-[#334155] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#0F172A]"
                    />
                  </div>
                ))}
                {errors[`q_match_${q.id}`] && (
                  <p className="text-xs text-red-500 mt-1">{errors[`q_match_${q.id}`]}</p>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Save */}
        <div className="flex justify-end mt-6">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSaveExam}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A236E] text-white rounded-xl hover:bg-[#1E3A8A] transition"
          >
            <Save className="w-4 h-4" />
            Save Exam
          </motion.button>
        </div>
      </div>
    </div>
  );
}
