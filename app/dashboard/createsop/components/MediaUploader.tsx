"use client";

import React from "react";
import { Upload } from "lucide-react";

interface MediaUploaderProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  onPick: (urls: string[]) => void;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  label = "Upload",
  accept = "image/*,video/*,audio/*",
  multiple = true,
  onPick,
}) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const urls: string[] = Array.from(files).map((f) =>
      URL.createObjectURL(f)
    );
    onPick(urls);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <label className="cursor-pointer px-3 py-2 border border-dashed rounded-lg text-sm flex items-center gap-2">
      <Upload className="w-4 h-4" /> {label}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={onChange}
        className="hidden"
      />
    </label>
  );
};

export default MediaUploader;
