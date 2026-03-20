import Link from "next/link";

const features = [
  {
    icon: "📸",
    title: "Snap a Photo",
    description:
      "Upload or take a photo of any city issue — potholes, graffiti, broken streetlights, illegal dumping, and more.",
  },
  {
    icon: "📝",
    title: "Quick & Easy",
    description:
      "Select the issue type, set the severity, and add a description — your report is ready to submit in seconds.",
  },
  {
    icon: "🗺️",
    title: "Routed Automatically",
    description:
      "Your report is sent directly to the right city department. No more guessing who handles what.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 bg-gradient-to-b from-brand-50 to-white">
        <span className="inline-block bg-brand-100 text-brand-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
          Community Civic Reporting
        </span>
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 max-w-2xl leading-tight">
          Report city issues in under 30 seconds
        </h1>
        <p className="mt-6 text-xl text-gray-500 max-w-xl">
          Snap a photo, fill in the details, and UrbanPic routes your report
          to the right city department.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            href="/report"
            className="px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors text-lg"
          >
            Report an Issue
          </Link>
          <Link
            href="/map"
            className="px-8 py-3.5 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl border border-gray-200 transition-colors text-lg"
          >
            View Community Map
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex flex-col gap-3 p-6 rounded-2xl border border-gray-100 bg-white shadow-sm"
            >
              <span className="text-3xl">{f.icon}</span>
              <h3 className="text-lg font-semibold text-gray-900">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Community map CTA */}
      <section className="px-6 py-16 bg-gray-900 text-white text-center">
        <h2 className="text-3xl font-bold">See what your city is reporting</h2>
        <p className="mt-3 text-gray-400 max-w-lg mx-auto">
          Every submission appears on a live heat map. Filter by issue type,
          zoom into your neighborhood, and see what's being addressed.
        </p>
        <Link
          href="/map"
          className="inline-block mt-8 px-8 py-3.5 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
        >
          Open the Map
        </Link>
      </section>
    </div>
  );
}
