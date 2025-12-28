export default function ManageLoading() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-48 bg-[#27272a] rounded animate-pulse mb-2" />
        <div className="h-5 w-96 bg-[#27272a] rounded animate-pulse" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#27272a] rounded-lg animate-pulse" />
            </div>
            <div className="h-8 w-12 bg-[#27272a] rounded animate-pulse mb-2" />
            <div className="h-4 w-28 bg-[#27272a] rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Revenue card skeleton */}
      <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-40 bg-[#27272a] rounded animate-pulse" />
          <div className="h-5 w-32 bg-[#27272a] rounded animate-pulse" />
        </div>
        <div className="h-12 w-36 bg-[#27272a] rounded animate-pulse" />
      </div>

      {/* Two column layout skeleton */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 w-36 bg-[#27272a] rounded animate-pulse" />
              <div className="h-4 w-16 bg-[#27272a] rounded animate-pulse" />
            </div>
            <div className="space-y-3">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-14 bg-[#27272a] rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
