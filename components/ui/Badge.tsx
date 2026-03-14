type BadgeVariant = "default" | "pending" | "in_progress" | "resolved" | "low" | "medium" | "high";

const styles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700",
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

export default function Badge({
  label,
  variant = "default",
}: {
  label: string;
  variant?: BadgeVariant;
}) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}
    >
      {label}
    </span>
  );
}
