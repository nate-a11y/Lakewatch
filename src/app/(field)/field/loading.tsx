export default function FieldLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-8 w-64 bg-[#27272a] rounded animate-pulse mb-2" />
        <div className="h-5 w-48 bg-[#27272a] rounded animate-pulse" />
      </div>

      {/* Summary card skeleton */}
      <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#27272a] rounded-lg animate-pulse" />
            <div>
              <div className="h-4 w-32 bg-[#27272a] rounded animate-pulse mb-2" />
              <div className="h-3 w-24 bg-[#27272a] rounded animate-pulse" />
            </div>
          </div>
          <div className="h-10 w-28 bg-[#27272a] rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Schedule items skeleton */}
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#27272a] rounded-lg animate-pulse" />
              <div className="flex-1">
                <div className="h-5 w-48 bg-[#27272a] rounded animate-pulse mb-2" />
                <div className="h-4 w-64 bg-[#27272a] rounded animate-pulse mb-2" />
                <div className="h-3 w-36 bg-[#27272a] rounded animate-pulse" />
              </div>
              <div className="h-8 w-20 bg-[#27272a] rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
