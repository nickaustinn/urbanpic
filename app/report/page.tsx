"use client";

import { useState, useCallback } from "react";
import PhotoUpload from "@/components/PhotoUpload";
import DepartmentBadge from "@/components/DepartmentBadge";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import Link from "next/link";

type Step = "upload" | "analyzing" | "review" | "success";

interface ClassifyResult {
  issueType: string;
  severity: string;
  description: string;
  confidence: string;
  department: string;
}

const ISSUE_TYPES = [
  "POTHOLE",
  "GRAFFITI",
  "BROKEN_STREETLIGHT",
  "ILLEGAL_DUMPING",
  "ABANDONED_VEHICLE",
  "DAMAGED_SIDEWALK",
  "FLOODING",
  "OTHER",
];

const ISSUE_LABELS: Record<string, string> = {
  POTHOLE: "Pothole",
  GRAFFITI: "Graffiti",
  BROKEN_STREETLIGHT: "Broken Streetlight",
  ILLEGAL_DUMPING: "Illegal Dumping",
  ABANDONED_VEHICLE: "Abandoned Vehicle",
  DAMAGED_SIDEWALK: "Damaged Sidewalk",
  FLOODING: "Flooding",
  OTHER: "Other",
};

export default function ReportPage() {
  const [step, setStep] = useState<Step>("upload");
  const [preview, setPreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<ClassifyResult | null>(null);
  const [description, setDescription] = useState("");
  const [originalDescription, setOriginalDescription] = useState("");
  const [issueType, setIssueType] = useState("");
  const [latitude, setLatitude] = useState<number>(37.7749);
  const [longitude, setLongitude] = useState<number>(-122.4194);
  const [reportId, setReportId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (file: File, base64: string) => {
    setPreview(base64);
    setImageBase64(base64);
    setStep("analyzing");

    // Use base64 as the image URL directly (Vercel has a read-only filesystem)
    setImageUrl(base64);

    // Classify with Claude
    const classifyRes = await fetch("/api/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: base64 }),
    });

    if (!classifyRes.ok) {
      // Fall back gracefully
      setAiResult({
        issueType: "OTHER",
        severity: "MEDIUM",
        description: "Civic issue reported via UrbanPic.",
        confidence: "low",
        department: "City Services 311",
      });
    } else {
      const result: ClassifyResult = await classifyRes.json();
      setAiResult(result);
      setDescription(result.description);
      setOriginalDescription(result.description);
      setIssueType(result.issueType);
    }

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
        },
        () => {} // silent fallback
      );
    }

    setStep("review");
  }, []);

  const handleSubmit = async () => {
    setSubmitError(null);
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageUrl: imageUrl ?? "/uploads/placeholder.jpg",
        issueType,
        severity: aiResult?.severity ?? "MEDIUM",
        description,
        department: aiResult?.department ?? "City Services 311",
        latitude,
        longitude,
        aiRaw: aiResult,
      }),
    });

    if (!res.ok) {
      setSubmitError("Submission failed. Please try again.");
      return;
    }

    const report = await res.json();
    setReportId(report.id);
    setStep("success");
  };

  const reset = () => {
    setStep("upload");
    setPreview(null);
    setImageBase64(null);
    setImageUrl(null);
    setAiResult(null);
    setDescription("");
    setIssueType("");
    setReportId(null);
    setSubmitError(null);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      {/* Step indicator */}
      {step !== "success" && (
        <div className="flex items-center gap-2 mb-8 text-sm text-gray-400">
          {(["upload", "analyzing", "review"] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${step === s ? "bg-brand-600 text-white" : i < ["upload","analyzing","review"].indexOf(step) ? "bg-brand-200 text-brand-700" : "bg-gray-100 text-gray-400"}`}
              >
                {i + 1}
              </span>
              <span className={step === s ? "text-gray-900 font-medium" : ""}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </span>
              {i < 2 && <span className="text-gray-200">›</span>}
            </div>
          ))}
        </div>
      )}

      {/* Step 1: Upload */}
      {step === "upload" && (
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Report an Issue</h1>
          <p className="text-gray-500 mb-6">Upload or take a photo and AI will handle the rest.</p>
          <PhotoUpload onFileSelect={handleFileSelect} />
        </div>
      )}

      {/* Step 2: Analyzing */}
      {step === "analyzing" && (
        <div className="flex flex-col items-center gap-6 py-16">
          {preview && (
            <img src={preview} alt="Uploaded issue" className="w-48 h-48 object-cover rounded-2xl shadow" />
          )}
          <Spinner className="w-8 h-8 text-brand-600" />
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">Analyzing your photo…</p>
            <p className="text-gray-400 text-sm mt-1">Claude Vision is classifying the issue</p>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === "review" && aiResult && (
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Review Your Report</h1>
          <p className="text-gray-500 mb-6">Edit anything before submitting.</p>

          {preview && (
            <img src={preview} alt="Issue" className="w-full h-48 object-cover rounded-2xl mb-6 shadow-sm" />
          )}

          {/* Issue type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
            <div className="flex items-center gap-2">
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {ISSUE_TYPES.map((t) => (
                  <option key={t} value={t}>{ISSUE_LABELS[t]}</option>
                ))}
              </select>
              <Badge
                label={aiResult.confidence + " confidence"}
                variant={aiResult.confidence as "low" | "medium" | "high"}
              />
            </div>
          </div>

          {/* Severity */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <Badge
              label={aiResult.severity}
              variant={aiResult.severity.toLowerCase() as "low" | "medium" | "high"}
            />
          </div>

          {/* Department */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Routed To</label>
            <DepartmentBadge department={aiResult.department} />
          </div>

          {/* Description */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Report Description</label>
              {description !== originalDescription && (
                <button
                  onClick={() => setDescription(originalDescription)}
                  className="text-xs text-brand-600 hover:underline"
                >
                  Reset to AI suggestion
                </button>
              )}
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{description.length}/500</p>
          </div>

          {/* Location note */}
          <p className="text-xs text-gray-400 mb-6">
            📍 Location: {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </p>

          {submitError && (
            <p className="text-sm text-red-600 mb-4">{submitError}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Start Over
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors"
            >
              Submit Report
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Success */}
      {step === "success" && (
        <div className="flex flex-col items-center text-center gap-4 py-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl">✅</div>
          <h1 className="text-2xl font-bold text-gray-900">Report Submitted!</h1>
          <p className="text-gray-500 text-sm">
            Your report has been received and routed to{" "}
            <span className="font-medium text-gray-900">{aiResult?.department}</span>.
          </p>
          {reportId && (
            <p className="text-xs text-gray-400 font-mono bg-gray-50 px-3 py-1 rounded">
              Report ID: {reportId}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full">
            <Link
              href="/map"
              className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-center transition-colors"
            >
              View on Map
            </Link>
            <button
              onClick={reset}
              className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Report Another Issue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
