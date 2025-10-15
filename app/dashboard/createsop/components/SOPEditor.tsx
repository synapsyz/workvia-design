"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Upload, X, GripVertical, Eye, Pencil } from "lucide-react";
import { SOP, Step } from "./types";

interface SOPEditorProps {
  sop: SOP;
  onSave: (updated: SOP) => void;
  onBack: () => void;
}

export default function SOPEditor({ sop, onSave, onBack }: SOPEditorProps) {
  const [localSOP, setLocalSOP] = useState<SOP>(sop);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(0);
  const [previewMode, setPreviewMode] = useState(false);

  // ------------------------------
  // STEP MANAGEMENT
  // ------------------------------
  const addStep = () => {
    const newStep: Step = {
      id: Date.now(),
      title: `Step ${localSOP.steps.length + 1}`,
      description: "",
      media: [],
    };
    const updatedSteps = [...localSOP.steps, newStep];
    setLocalSOP({ ...localSOP, steps: updatedSteps });
    setActiveStepIndex(updatedSteps.length - 1);
  };

  const updateStep = (index: number, field: keyof Step, value: any) => {
    const updatedSteps = [...localSOP.steps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setLocalSOP({ ...localSOP, steps: updatedSteps });
  };

  const deleteStep = (index: number) => {
    const updatedSteps = localSOP.steps.filter((_, i) => i !== index);
    setLocalSOP({ ...localSOP, steps: updatedSteps });
    setActiveStepIndex(null);
  };

  const toggleStep = (index: number) => {
    setActiveStepIndex((prev) => (prev === index ? null : index));
  };

  // ------------------------------
  // DRAG & DROP
  // ------------------------------
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newSteps = Array.from(localSOP.steps);
    const [reordered] = newSteps.splice(result.source.index, 1);
    newSteps.splice(result.destination.index, 0, reordered);
    setLocalSOP({ ...localSOP, steps: newSteps });
  };

  // ------------------------------
  // SOP THUMBNAIL
  // ------------------------------
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setLocalSOP({ ...localSOP, headerMedia: [url] });
    };
    reader.readAsDataURL(file);
  };

  // ------------------------------
  // STEP MEDIA
  // ------------------------------
  const handleStepMediaUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const files = e.target.files;
    if (!files) return;
    const uploadedMedia: string[] = [];

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        uploadedMedia.push(reader.result as string);
        if (uploadedMedia.length === files.length) {
          const updatedSteps = [...localSOP.steps];
          updatedSteps[index].media = [
            ...(updatedSteps[index].media || []),
            ...uploadedMedia,
          ];
          setLocalSOP({ ...localSOP, steps: updatedSteps });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeStepMedia = (stepIndex: number, mediaIndex: number) => {
    const updatedSteps = [...localSOP.steps];
    updatedSteps[stepIndex].media.splice(mediaIndex, 1);
    setLocalSOP({ ...localSOP, steps: updatedSteps });
  };

  const saveSOP = () => onSave(localSOP);

  // ------------------------------
  // RENDER START
  // ------------------------------
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#0A236E]">
          {previewMode ? "Preview SOP" : "Edit SOP"}
        </h2>
        <div className="flex gap-2">
          <button onClick={onBack} className="px-4 py-2 border rounded-lg text-sm">
            Back
          </button>

          {!previewMode ? (
            <>
              <button
                onClick={() => setPreviewMode(true)}
                className="px-4 py-2 border border-[#0A236E] text-[#0A236E] rounded-lg flex items-center gap-1"
              >
                <Eye className="w-4 h-4" /> Preview
              </button>
              <button
                onClick={saveSOP}
                className="px-4 py-2 bg-[#0A236E] text-white rounded-lg"
              >
                Save SOP
              </button>
            </>
          ) : (
            <button
              onClick={() => setPreviewMode(false)}
              className="px-4 py-2 bg-[#0A236E] text-white rounded-lg flex items-center gap-1"
            >
              <Pencil className="w-4 h-4" /> Edit
            </button>
          )}
        </div>
      </div>

      {/* PREVIEW MODE */}
      {previewMode ? (
        <div className="space-y-6">
          {/* Thumbnail */}
          {localSOP.headerMedia[0] && (
            <img
              src={localSOP.headerMedia[0]}
              alt="Thumbnail"
              className="rounded-lg border w-full max-w-md h-48 object-cover"
            />
          )}

          <div>
            <h3 className="text-xl font-semibold text-[#0A236E]">
              {localSOP.title}
            </h3>
            <p className="text-gray-600 mt-1">{localSOP.description}</p>
          </div>

          {/* Step Preview */}
          <div className="space-y-4">
            {localSOP.steps.map((step, index) => (
              <div
                key={step.id}
                className="border rounded-lg bg-white shadow-sm p-4 space-y-3"
              >
                <h4 className="font-medium text-[#0A236E]">
                  {index + 1}. {step.title}
                </h4>
                <p className="text-sm text-gray-600">{step.description}</p>

                {step.media && step.media.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-2">
                    {step.media.map((media, i) => (
                      <div
                        key={i}
                        className="relative border rounded-lg overflow-hidden w-48 h-36"
                      >
                        {media.startsWith("data:video") ? (
                          <video
                            controls
                            src={media}
                            className="w-full h-full object-cover"
                          />
                        ) : media.startsWith("data:audio") ? (
                          <audio controls src={media} className="w-full" />
                        ) : (
                          <img
                            src={media}
                            alt={`step-media-${i}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {step.condition && (
                  <p className="text-xs text-gray-500 italic">
                    Condition: {step.condition}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* EDIT MODE */}
          {/* SOP INFO */}
          <div>
            <label className="block font-medium text-sm text-gray-700">
              SOP Title
            </label>
            <input
              type="text"
              value={localSOP.title}
              onChange={(e) =>
                setLocalSOP({ ...localSOP, title: e.target.value })
              }
              className="w-full mt-1 p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block font-medium text-sm text-gray-700">
              Description
            </label>
            <textarea
              value={localSOP.description}
              onChange={(e) =>
                setLocalSOP({ ...localSOP, description: e.target.value })
              }
              className="w-full mt-1 p-2 border rounded-md"
              rows={3}
            />
          </div>

          {/* SOP THUMBNAIL */}
          <div>
            <label className="block font-medium text-sm text-gray-700">
              SOP Thumbnail
            </label>
            {localSOP.headerMedia.length > 0 ? (
              <div className="relative w-full sm:w-1/3 mt-2">
                <img
                  src={localSOP.headerMedia[0]}
                  alt="SOP Thumbnail"
                  className="rounded-lg border object-cover w-full h-40"
                />
                <button
                  onClick={() => setLocalSOP({ ...localSOP, headerMedia: [] })}
                  className="absolute top-2 right-2 text-xs bg-red-500 text-white px-2 py-1 rounded-md"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full sm:w-1/3 h-40 mt-2 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                <Upload className="w-6 h-6 text-[#0A236E]" />
                <span className="text-sm text-gray-500 mt-2">
                  Upload Thumbnail
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* STEPS */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-[#0A236E]">Steps</h3>
              <button
                onClick={addStep}
                className="px-4 py-2 bg-[#0A236E] text-white rounded-lg text-sm"
              >
                + Add Step
              </button>
            </div>

            {localSOP.steps.length === 0 ? (
              <p className="text-gray-500 text-sm italic">
                No steps yet. Click “Add Step” to create one.
              </p>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="steps">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-3"
                    >
                      {localSOP.steps.map((step, index) => {
                        const isActive = activeStepIndex === index;
                        return (
                          <Draggable
                            key={step.id}
                            draggableId={String(step.id)}
                            index={index}
                          >
                            {(draggable) => (
                              <div
                                ref={draggable.innerRef}
                                {...draggable.draggableProps}
                                className="border rounded-lg overflow-hidden shadow-sm bg-white"
                              >
                                {/* Step Header */}
                                <div
                                  className={`flex justify-between items-center p-3 cursor-pointer ${
                                    isActive
                                      ? "bg-[#0A236E] text-white"
                                      : "bg-gray-100 hover:bg-gray-200"
                                  }`}
                                  onClick={() => toggleStep(index)}
                                >
                                  <div className="flex items-center gap-2">
                                    <div {...draggable.dragHandleProps}>
                                      <GripVertical className="w-4 h-4 opacity-70" />
                                    </div>
                                    <span className="font-medium">
                                      {step.title || `Step ${index + 1}`}
                                    </span>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteStep(index);
                                      }}
                                      className={`text-sm ${
                                        isActive ? "text-white" : "text-red-600"
                                      }`}
                                    >
                                      Delete
                                    </button>
                                    <span
                                      className={`transition-transform ${
                                        isActive ? "rotate-90" : "rotate-0"
                                      }`}
                                    >
                                      ▶
                                    </span>
                                  </div>
                                </div>

                                {/* Step Body */}
                                <AnimatePresence initial={false}>
                                  {isActive && (
                                    <motion.div
                                      key="content"
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      transition={{ duration: 0.3 }}
                                      className="p-4 bg-gray-50 border-t space-y-4"
                                    >
                                      {/* Step Title */}
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                          Step Title
                                        </label>
                                        <input
                                          type="text"
                                          value={step.title}
                                          onChange={(e) =>
                                            updateStep(index, "title", e.target.value)
                                          }
                                          className="w-full mt-1 p-2 border rounded-md"
                                        />
                                      </div>

                                      {/* Step Description */}
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                          Description
                                        </label>
                                        <textarea
                                          value={step.description}
                                          onChange={(e) =>
                                            updateStep(index, "description", e.target.value)
                                          }
                                          className="w-full mt-1 p-2 border rounded-md"
                                          rows={3}
                                        />
                                      </div>

                                      {/* Step Media */}
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                          Step Media (Image / Video / Audio)
                                        </label>
                                        <div className="mt-2 flex flex-wrap gap-3">
                                          {step.media.map((media, i) => (
                                            <div
                                              key={i}
                                              className="relative border rounded-lg overflow-hidden w-40 h-32 bg-gray-100"
                                            >
                                              {media.startsWith("data:video") ? (
                                                <video
                                                  controls
                                                  src={media}
                                                  className="w-full h-full object-cover"
                                                />
                                              ) : media.startsWith("data:audio") ? (
                                                <audio
                                                  controls
                                                  src={media}
                                                  className="absolute bottom-0 w-full"
                                                />
                                              ) : (
                                                <img
                                                  src={media}
                                                  alt={`media-${i}`}
                                                  className="w-full h-full object-cover"
                                                />
                                              )}
                                              <button
                                                onClick={() => removeStepMedia(index, i)}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                                              >
                                                <X className="w-3 h-3" />
                                              </button>
                                            </div>
                                          ))}
                                          <label className="flex flex-col items-center justify-center w-40 h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-100">
                                            <Upload className="w-6 h-6 text-[#0A236E]" />
                                            <span className="text-xs text-gray-500 mt-1">
                                              Add Media
                                            </span>
                                            <input
                                              type="file"
                                              accept="image/*,video/*,audio/*"
                                              multiple
                                              onChange={(e) =>
                                                handleStepMediaUpload(e, index)
                                              }
                                              className="hidden"
                                            />
                                          </label>
                                        </div>
                                      </div>

                                      {/* Condition */}
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                          Condition (optional)
                                        </label>
                                        <input
                                          type="text"
                                          value={step.condition || ""}
                                          onChange={(e) =>
                                            updateStep(index, "condition", e.target.value)
                                          }
                                          className="w-full mt-1 p-2 border rounded-md"
                                        />
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        </>
      )}
    </div>
  );
}
