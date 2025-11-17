"use client";

export default function DemoVideoSection() {
  return (
    <section className="w-full py-16 bg-gradient-to-b from-white to-purple-50">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          ▶ Watch the 60-Second Demo
        </h2>

        <p className="text-gray-600 mt-3 mb-10 text-lg">
          A quick overview of how RetentionFlow helps salons boost repeat
          bookings.
        </p>

        <div className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-xl border border-purple-200">
          <video src="/demo-video.mov" controls className="w-full h-auto" />
        </div>
      </div>
    </section>
  );
}
