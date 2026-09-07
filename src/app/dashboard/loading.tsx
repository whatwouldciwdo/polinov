export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-10 px-4 font-mono bg-[#1e2029]">
      <div className="relative w-full max-w-md p-8 rounded-3xl neu-panel flex flex-col items-center text-center border border-white/5 animate-pulse">
        {/* Glowing Ambient Background */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-600/15 rounded-full blur-2xl pointer-events-none"></div>

        {/* Spinner Well */}
        <div className="neu-icon-well w-16 h-16 mb-4 flex items-center justify-center text-purple-400">
          <svg
            className="animate-spin h-8 w-8 text-purple-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>

        <h2 className="text-lg font-bold text-white font-bitter tracking-wide mb-1">
          Memuat Data...
        </h2>
        <p className="text-xs text-gray-400 font-sans">
          Menghubungkan ke sistem POLINOV 2026
        </p>

        {/* Skeleton lines */}
        <div className="w-full mt-6 space-y-2.5">
          <div className="h-3 bg-white/5 rounded-full w-3/4 mx-auto neu-inset"></div>
          <div className="h-2.5 bg-white/5 rounded-full w-1/2 mx-auto neu-inset"></div>
        </div>
      </div>
    </div>
  );
}
