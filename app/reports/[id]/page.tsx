import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Badge from "@/components/ui/Badge";
import DepartmentBadge from "@/components/DepartmentBadge";
import Link from "next/link";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function ReportDetailPage({ params }: any) {
  const { id } = await params;
  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) notFound();

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <Link href="/map" className="text-sm text-brand-600 hover:underline mb-6 block">
        ← Back to map
      </Link>

      <img
        src={report.imageUrl}
        alt={ISSUE_LABELS[report.issueType] ?? report.issueType}
        className="w-full h-64 object-cover rounded-2xl shadow mb-6 bg-gray-100"
      />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {ISSUE_LABELS[report.issueType] ?? report.issueType}
        </h1>
        <Badge
          label={report.severity}
          variant={report.severity.toLowerCase() as "low" | "medium" | "high"}
        />
        <Badge
          label={report.status.replace("_", " ").toLowerCase()}
          variant={report.status.toLowerCase().replace("_", "") as "pending" | "in_progress" | "resolved"}
        />
      </div>

      <DepartmentBadge department={report.department} />

      <p className="text-gray-600 mt-4 leading-relaxed">{report.description}</p>

      {report.address && (
        <p className="text-sm text-gray-400 mt-3">📍 {report.address}</p>
      )}

      <p className="text-xs text-gray-400 mt-2">
        Submitted{" "}
        {new Date(report.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      <div className="mt-6 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-400 font-mono">ID: {report.id}</p>
      </div>
    </div>
  );
}
