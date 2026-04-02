export default function AdminLoading() {
  return (
    <div className="space-y-6 text-slate-200 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 bg-slate-800 rounded-md w-64 mb-2"></div>
          <div className="h-4 bg-slate-800 rounded-md w-96"></div>
        </div>
        <div className="h-10 bg-slate-800 rounded-md w-32"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-800/60 p-5 rounded-xl border border-slate-700 h-32">
            <div className="h-4 bg-slate-700 rounded-md w-24 mb-4"></div>
            <div className="h-8 bg-slate-700 rounded-md w-16 mb-2"></div>
            <div className="h-3 bg-slate-700 rounded-md w-32"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700 h-[400px]">
          <div className="h-6 bg-slate-700 rounded-md w-48 mb-6"></div>
          <div className="h-64 bg-slate-700 rounded-full w-64 mx-auto mt-4"></div>
        </div>
        <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700 h-[400px]">
          <div className="h-6 bg-slate-700 rounded-md w-48 mb-6"></div>
          <div className="h-10 bg-slate-700 rounded-md w-full mt-auto"></div>
          <div className="h-48 bg-slate-700 bg-opacity-50 rounded-md w-full mt-4"></div>
        </div>
      </div>
    </div>
  );
}
