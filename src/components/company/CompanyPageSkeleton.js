const CompanyPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-2">
      <div className="container max-w-screen-md mx-auto py-2">
        {/* Breadcrumb Navigation Skeleton */}
        <div className="mb-4">
          <nav className="flex items-center space-x-2 text-sm">
            <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
          </nav>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden animate-pulse">
          {/* Hero Banner Skeleton */}
          <div className="h-32 bg-gray-200 relative border-b">
            {/* Logo Skeleton */}
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
              <div className="bg-gray-300 rounded-lg shadow-md border-1 border-gray-300 shadow-[0 8px 24px rgba(0, 0, 0, .06)]">
                <div className="h-20 w-20 bg-gray-300 rounded-lg"></div>
              </div>
            </div>

            {/* Stats Skeleton */}
            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6">
              <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md">
                <div className="flex items-center gap-4">
                  <div className="h-3 w-12 bg-gray-300 rounded"></div>
                  <div className="h-3 w-16 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Company Information Skeleton */}
          <div className="p-4 sm:p-6">
            {/* Company Name & Basic Info */}
            <div className="mb-4">
              <div className="h-8 sm:h-9 w-3/4 bg-gray-300 rounded mb-2"></div>

              {/* Location */}
              <div className="flex items-center gap-1 mb-2">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div className="h-4 w-32 bg-gray-300 rounded"></div>
              </div>
            </div>

            {/* Full Description */}
            <div className="border-t pt-4">
              <div className="h-6 w-48 bg-gray-300 rounded mb-2"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-300 rounded"></div>
                <div className="h-4 w-full bg-gray-300 rounded"></div>
                <div className="h-4 w-4/5 bg-gray-300 rounded"></div>
                <div className="h-4 w-full bg-gray-300 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-end gap-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="h-3 w-24 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>

          {/* Jobs Section Skeleton */}
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="h-6 w-32 bg-gray-300 rounded"></div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-20 bg-gray-300 rounded"></div>
                <div className="h-3 w-16 bg-gray-300 rounded"></div>
              </div>
            </div>

            {/* Job Cards Skeleton */}
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="flex gap-2 items-center p-2 border-1 border-[#0001] shadow-lg rounded-lg"
                >
                  <div className="min-w-[75px] h-[75px] bg-gray-300 rounded-lg"></div>
                  <div className="flex flex-col gap-2 w-full">
                    <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyPageSkeleton;
