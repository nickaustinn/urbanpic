"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";

interface Report {
  id: string;
  imageUrl: string;
  issueType: string;
  address?: string;
  status: string;
  createdAt: string;
  department: string;
}

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

export default function MyReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports?userId=me")
      .then(async (res) => {
        if (res.status === 401) { router.push("/auth/login"); return; }
        setReports(await res.json());
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner className="w-8 h-8 text-brand-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Reports</h1>

      {reports.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">📋</p>
          <p className="text-gray-500 mb-6">You haven&apos;t submitted any reports yet.</p>
          <Link
            href="/report"
            className="px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors"
          >
            Report Your First Issue
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reports.map((r) => (
            <Link
              key={r.id}
              href={`/reports/${r.id}`}
              className="flex gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={r.imageUrl}
                alt={ISSUE_LABELS[r.issueType]}
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-gray-100"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900 text-sm">
                    {ISSUE_LABELS[r.issueType] ?? r.issueType}
                  </span>
                  <Badge
                    label={r.status.replace("_", " ").toLowerCase()}
                    variant={r.status.toLowerCase().replace("_", "") as "pending" | "in_progress" | "resolved"}
                  />
                </div>
                {r.address && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{r.address}</p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(r.createdAt).toLocaleDateString()} · {r.department}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
