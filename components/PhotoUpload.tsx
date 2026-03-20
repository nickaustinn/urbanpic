"use client";

import { useRef, useState, useCallback } from "react";

interface PhotoUploadProps {
  onFileSelect: (file: File, preview: string) => void;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const ACCEPTED_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];
const MAX_MB = 10;

function isImageFile(file: File): boolean {
  // Accept if MIME type starts with image/ (covers Android's image/jpeg, image/*, etc.)
  if (file.type.startsWith("image/")) return true;
  // Accept if MIME type is in our known list
  if (ACCEPTED_TYPES.includes(file.type)) return true;
  // Accept if MIME type is empty but extension looks like an image (some Android devices)
  if (!file.type) {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    return ACCEPTED_EXTS.includes(ext);
  }
  return false;
}

export default function PhotoUpload({ onFileSelect }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (file: File): string | null => {
    if (!isImageFile(file)) {
      return "Unsupported format. Please use JPEG, PNG, or WebP.";
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      return `File too large. Maximum size is ${MAX_MB}MB.`;
    }
    return null;
  };

  const processFile = useCallback(
    (file: File) => {
      const err = validate(file);
      if (err) {
        setError(err);
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const MAX_DIM = 1200;
          const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL("image/jpeg", 0.7);
          onFileSelect(file, compressed);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    },
    [onFileSelect]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  return (
    <div className="w-full">
      {/* Desktop drag-and-drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center gap-3 p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-colors
          ${dragOver ? "border-brand-500 bg-brand-50" : "border-gray-200 bg-gray-50 hover:border-brand-400 hover:bg-brand-50"}
        `}
      >
        <span className="text-4xl">📷</span>
        <p className="text-gray-700 font-medium">
          Drag & drop a photo here, or <span className="text-brand-600">browse</span>
        </p>
        <p className="text-gray-400 text-sm">JPEG, PNG, WebP, HEIC · max 10MB</p>
      </div>

      {/* Camera button — shown on any touch device (phones + tablets, iOS + Android) */}
      <div className="mt-3 touch-device-only">
        <label className="flex items-center justify-center gap-2 w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl cursor-pointer transition-colors">
          <span>📸</span> Take Photo
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={handleChange}
          />
        </label>
      </div>

      {/* Hidden file input for click-to-browse */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="sr-only"
        onChange={handleChange}
        aria-label="Upload photo"
      />

      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
