"use client";

function MacbookFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="rounded-t-[24px] border border-slate-300 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-center py-2">
          <div className="h-1.5 w-20 rounded-full bg-slate-600" />
        </div>
        <div className="overflow-hidden rounded-b-[24px] bg-black">
          {children}
        </div>
      </div>
      <div className="mx-auto h-3 w-40 rounded-b-full bg-slate-300/70 blur-[2px] mt-2" />
    </div>
  );
}

export default function DemoVideoSection() {
  return (
    <section className="w-full py-16 bg-gradient-to-b from-white to-purple-50">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          ▶ Watch the RetentionFlow Demo
        </h2>

        <p className="text-gray-600 mt-3 mb-10 text-lg">
          A quick look at how RetentionFlow tracks overdue clients and sends
          personalised reminders to keep your chairs full.
        </p>

        <MacbookFrame>
          <video
            src="/demo-video.mov"
            controls
            className="w-full h-full max-h-[480px] object-cover"
          />
        </MacbookFrame>

        <div className="mt-8">
          <a
            href="/demo"
            className="inline-block px-8 py-3 rounded-xl bg-purple-600 text-white text-base md:text-lg font-semibold shadow-lg hover:bg-purple-700 transition"
          >
            Try the Interactive Demo
          </a>
        </div>
      </div>
    </section>
  );
}
