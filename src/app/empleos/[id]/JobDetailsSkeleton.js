const JobDetailsSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-2">
      <div className="container max-w-screen-md mx-auto py-2">
        <div className="bg-white shadow-lg p-4">
          {/* Hero section skeleton */}
          <div className="border border-yellow-300 rounded-2xl bg-white p-4 shadow-lg mb-4 relative overflow-hidden">
            <div className="absolute left-0 right-0 top-0 h-24 bg-gradient-to-r from-yellow-400 to-yellow-300 opacity-60"></div>
            <div className="relative z-10 grid grid-cols-[64px_1fr] gap-3 items-center">
              <div className="w-16 h-16 rounded-xl bg-gray-200 animate-pulse"></div>
              <div>
                <div className="h-6 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-2/3 mb-2"></div>
                <div className="flex gap-2 flex-wrap">
                  <div className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse"></div>
                  <div className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse"></div>
                  <div className="h-10 w-20 bg-gray-200 rounded-xl animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* HR Contacts section skeleton */}
          <div className="mb-4">
            <div className="h-6 bg-gray-200 rounded-lg animate-pulse mb-2 w-1/3"></div>
            <div className="border border-gray-200 rounded-xl bg-white p-3 shadow-lg">
              <div className="grid grid-cols-[56px_1fr_auto] gap-3 items-center">
                <div className="w-14 h-14 rounded-xl bg-gray-200 animate-pulse"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded-lg animate-pulse mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded-lg animate-pulse mb-1 w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded-lg animate-pulse w-1/2"></div>
                </div>
                <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Live listings section skeleton */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="h-6 bg-gray-200 rounded-lg animate-pulse w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-16"></div>
            </div>
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-xl bg-white p-3 shadow-lg"
                >
                  <div className="grid grid-cols-[56px_1fr_auto] gap-3 items-center">
                    <div className="w-14 h-14 rounded-xl bg-gray-200 animate-pulse"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded-lg animate-pulse mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded-lg animate-pulse w-2/3"></div>
                    </div>
                    <div className="space-y-1">
                      <div className="h-8 w-16 bg-gray-200 rounded-xl animate-pulse"></div>
                      <div className="h-8 w-24 bg-gray-200 rounded-xl animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI snapshot section skeleton */}
          <div className="mb-4">
            <div className="h-6 bg-gray-200 rounded-lg animate-pulse mb-2 w-1/3"></div>
            <div className="border border-gray-200 rounded-xl bg-white p-4 shadow-lg">
              <div className="h-3 bg-gray-200 rounded-lg animate-pulse mb-4 w-3/4"></div>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="h-4 bg-gray-200 rounded-lg animate-pulse mb-2 w-1/2"></div>
                  <div className="space-y-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-3 bg-gray-200 rounded-lg animate-pulse"
                      ></div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="h-4 bg-gray-200 rounded-lg animate-pulse mb-2 w-1/2"></div>
                  <div className="space-y-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-3 bg-gray-200 rounded-lg animate-pulse"
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
          </div>

          {/* Offer section skeleton */}
          <div className="mb-4">
            <div className="h-6 bg-gray-200 rounded-lg animate-pulse mb-2 w-1/4"></div>
            <div className="border border-gray-200 rounded-xl bg-white p-4 shadow-lg">
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Ready summary skeleton */}
          <div className="mb-4">
            <div className="h-6 bg-gray-200 rounded-lg animate-pulse mb-2 w-1/4"></div>
            <div className="border border-gray-200 rounded-xl bg-white p-4 shadow-lg">
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-1/3"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky footer skeleton */}
      <div className="fixed left-0 right-0 bottom-0 z-50 bg-white border-t border-gray-200 p-3 shadow-lg">
        <div className="container max-w-screen-md mx-auto">
          <div className="flex gap-2">
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse flex-1"></div>
            <div className="h-12 w-32 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded-lg animate-pulse mt-2 w-2/3 mx-auto"></div>
          <div className="h-3 bg-gray-200 rounded-lg animate-pulse mt-1 w-3/4 mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsSkeleton;
