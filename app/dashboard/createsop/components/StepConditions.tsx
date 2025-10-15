"use client";

import React from "react";

interface StepConditionsProps {
  value: string;
  onChange: (value: string) => void;
}

const StepConditions: React.FC<StepConditionsProps> = ({ value, onChange }) => {
  return (
    <div className="mt-2">
      <label className="text-xs font-medium text-gray-500">
        Step Condition (optional)
      </label>
      <input
        type="text"
        placeholder="E.g., If temperature > 80°C then notify supervisor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />
      <p className="text-[11px] text-gray-500 mt-1">
        You can describe a simple condition in text. (Advanced rules engine can be added later.)
      </p>
    </div>
  );
};

export default StepConditions;
