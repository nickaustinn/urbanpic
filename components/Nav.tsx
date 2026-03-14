import Link from "next/link";

export default function Nav() {
  return (
    <nav className="border-b border-gray-100 bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-brand-700 tracking-tight">
          UrbanPic
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/map" className="hover:text-gray-900 transition-colors">
            Map
          </Link>
          <Link href="/my-reports" className="hover:text-gray-900 transition-colors">
            My Reports
          </Link>
          <Link
            href="/report"
            className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors"
          >
            Report Issue
          </Link>
        </div>
      </div>
    </nav>
  );
}
