"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Spinner from "@/components/ui/Spinner";

// Dynamically import MapboxMap to avoid SSR issues
const MapboxMap = dynamic(() => import("@/components/MapboxMap"), { ssr: false });

interface Report {
  id: string;
  issueType: string;
  severity: string;
  description: string;
  department: string;
  latitude: number;
  longitude: number;
  address?: string;
  status: string;
  createdAt: string;
}

const ISSUE_TYPES = [
  "ALL",
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
  ALL: "All",
  POTHOLE: "Pothole",
  GRAFFITI: "Graffiti",
  BROKEN_STREETLIGHT: "Streetlight",
  ILLEGAL_DUMPING: "Dumping",
  ABANDONED_VEHICLE: "Vehicle",
  DAMAGED_SIDEWALK: "Sidewalk",
  FLOODING: "Flooding",
  OTHER: "Other",
};

export default function MapPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((data) => { setReports(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = activeFilter === "ALL"
    ? reports
    : reports.filter((r) => r.issueType === activeFilter);

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Filter bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-gray-100 overflow-x-auto flex-shrink-0">
        {ISSUE_TYPES.map((type) => {
          const count = type === "ALL" ? reports.length : reports.filter((r) => r.issueType === type).length;
          return (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                ${activeFilter === type
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              {ISSUE_LABELS[type]} {count > 0 && <span className="ml-1 opacity-70">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <Spinner className="w-8 h-8 text-brand-600" />
          </div>
        ) : (
          <MapboxMap reports={filtered} />
        )}
      </div>
    </div>
  );
}
