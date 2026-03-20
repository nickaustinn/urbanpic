"use client";

import { useState, useCallback } from "react";
import PhotoUpload from "@/components/PhotoUpload";
import DepartmentBadge from "@/components/DepartmentBadge";
import Link from "next/link";
import { getDepartment } from "@/lib/routing";
import { IssueType } from "@/lib/types";
import { getSRType } from "@/lib/sjc311";

type Step = "upload" | "review" | "preview" | "success";

const STEPS: { key: Step; label: string }[] = [
  { key: "upload", label: "Upload" },
  { key: "review", label: "Details" },
  { key: "preview", label: "Preview" },
];

const ISSUE_TYPES: IssueType[] = [
  "POTHOLE",
  "GRAFFITI",
  "BROKEN_STREETLIGHT",
  "ILLEGAL_DUMPING",
  "ABANDONED_VEHICLE",
  "DAMAGED_SIDEWALK",
  "FLOODING",
  "OTHER",
];

const ISSUE_LABELS: Record<IssueType, string> = {
  POTHOLE: "Pothole",
  GRAFFITI: "Graffiti",
  BROKEN_STREETLIGHT: "Broken Streetlight",
  ILLEGAL_DUMPING: "Illegal Dumping",
  ABANDONED_VEHICLE: "Abandoned Vehicle",
  DAMAGED_SIDEWALK: "Damaged Sidewalk",
  FLOODING: "Flooding",
  OTHER: "Other",
};

const SEVERITY_OPTIONS = ["LOW", "MEDIUM", "HIGH"] as const;

export default function ReportPage() {
  const [step, setStep] = useState<Step>("upload");
  const [preview, setPreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [issueType, setIssueType] = useState<IssueType>("POTHOLE");
  const [severity, setSeverity] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState<number>(37.9577);
  const [longitude, setLongitude] = useState<number>(-121.2908);
  const [srNumber, setSrNumber] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFileSelect = useCallback((file: File, base64: string) => {
    setPreview(base64);
    setImageUrl(base64);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
        },
        () => {}
      );
    }

    setStep("review");
  }, []);

  const handleGoToPreview = () => {
    setSubmitError(null);
    setStep("preview");
  };

  const handleSubmitTo311 = async () => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const srType = getSRType(issueType);

      const res = await fetch("/api/submit-311", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          srTypeId: srType.id,
          description,
          latitude,
          longitude,
          imageBase64: imageUrl,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setSubmitError(`Submission failed: ${body.error ?? "Unknown error"}`);
        return;
      }

      const result = await res.json();
      setSrNumber(result.SRNumber ?? null);
      setStep("success");
    } catch (err) {
      setSubmitError(`Network error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setStep("upload");
    setPreview(null);
    setImageUrl(null);
    setIssueType("POTHOLE");
    setSeverity("MEDIUM");
    setDescription("");
    setSrNumber(null);
    setSubmitError(null);
    setSubmitting(false);
  };

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      {step !== "success" && (
        <div className="flex items-center gap-2 mb-8 text-sm text-gray-400">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${step === s.key ? "bg-brand-600 text-white" : i < stepIndex ? "bg-brand-200 text-brand-700" : "bg-gray-100 text-gray-400"}`}
              >
                {i + 1}
              </span>
              <span className={step === s.key ? "text-gray-900 font-medium" : ""}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && <span className="text-gray-200">&rsaquo;</span>}
            </div>
          ))}
        </div>
      )}

      {/* Step 1: Upload */}
      {step === "upload" && (
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Report an Issue</h1>
          <p className="text-gray-500 mb-6">Upload or take a photo to get started.</p>
          <PhotoUpload onFileSelect={handleFileSelect} />
        </div>
      )}

      {/* Step 2: Review */}
      {step === "review" && (
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Describe the Issue</h1>
          <p className="text-gray-500 mb-6">Fill in the details before previewing your 311 report.</p>

          {preview && (
            <img src={preview} alt="Issue" className="w-full h-48 object-cover rounded-2xl mb-6 shadow-sm" />
          )}

          {/* Issue type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value as IssueType)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {ISSUE_TYPES.map((t) => (
                <option key={t} value={t}>{ISSUE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <div className="flex gap-2">
              {SEVERITY_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSeverity(s)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors
                    ${severity === s
                      ? s === "HIGH" ? "bg-red-500 text-white border-red-500"
                        : s === "MEDIUM" ? "bg-yellow-400 text-white border-yellow-400"
                        : "bg-green-500 text-white border-green-500"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    }`}
                >
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Department */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Routed To</label>
            <DepartmentBadge department={getDepartment(issueType)} />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue..."
              maxLength={500}
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{description.length}/500</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Start Over
            </button>
            <button
              onClick={handleGoToPreview}
              disabled={!description.trim()}
              className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
            >
              Preview 311 Report
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preview 311 Submission */}
      {step === "preview" && (
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Preview 311 Report</h1>
          <p className="text-gray-500 mb-6">
            This is what will be submitted to San Joaquin County 311.
          </p>

          <div className="border border-gray-200 rounded-2xl overflow-hidden mb-6">
            {/* Header */}
            <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                San Joaquin County &middot; NEXGEN 311 Service Request
              </p>
            </div>

            <div className="p-5 space-y-4">
              {/* Photo */}
              {preview && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Attached Photo</p>
                  <img src={preview} alt="Issue" className="w-full h-40 object-cover rounded-lg" />
                </div>
              )}

              {/* Service Type */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Service Type</p>
                <p className="text-sm text-gray-900 font-medium">{getSRType(issueType).label}</p>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Description of Issue</p>
                <p className="text-sm text-gray-900">{description}</p>
              </div>

              {/* Location */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Location</p>
                <p className="text-sm text-gray-900">
                  {latitude.toFixed(5)}, {longitude.toFixed(5)}
                </p>
              </div>

              {/* Submission type */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Submitted As</p>
                <p className="text-sm text-gray-900">Anonymous</p>
              </div>
            </div>
          </div>

          {submitError && (
            <p className="text-sm text-red-600 mb-4">{submitError}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep("review")}
              className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={handleSubmitTo311}
              disabled={submitting}
              className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
            >
              {submitting ? "Submitting..." : "Report Issue"}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Success */}
      {step === "success" && (
        <div className="flex flex-col items-center text-center gap-4 py-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl">
            &#x2705;
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Report Submitted!</h1>
          <p className="text-gray-500 text-sm">
            Your report has been submitted to{" "}
            <span className="font-medium text-gray-900">San Joaquin County 311</span>.
          </p>
          {srNumber && (
            <p className="text-xs text-gray-400 font-mono bg-gray-50 px-3 py-1 rounded">
              SR Number: {srNumber}
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
