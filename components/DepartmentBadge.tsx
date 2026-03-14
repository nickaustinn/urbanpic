export default function DepartmentBadge({ department }: { department: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-brand-50 border border-brand-100 rounded-lg text-sm">
      <span className="text-brand-600">🏛️</span>
      <span className="text-brand-800 font-medium">{department}</span>
    </div>
  );
}
