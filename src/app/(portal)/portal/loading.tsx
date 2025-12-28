export default function PortalLoading() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-64 bg-[#27272a] rounded animate-pulse mb-2" />
        <div className="h-5 w-80 bg-[#27272a] rounded animate-pulse" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
            <div className="w-10 h-10 bg-[#27272a] rounded-lg animate-pulse mb-3" />
            <div className="h-8 w-12 bg-[#27272a] rounded animate-pulse mb-2" />
            <div className="h-4 w-24 bg-[#27272a] rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Cards skeleton */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <div className="h-6 w-48 bg-[#27272a] rounded animate-pulse mb-4" />
          <div className="h-24 bg-[#27272a] rounded animate-pulse" />
        </div>
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <div className="h-6 w-32 bg-[#27272a] rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-[#27272a] rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
