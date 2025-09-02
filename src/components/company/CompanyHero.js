const CompanyHero = ({ company }) => {
  if (!company) return null;

  return (
    <div className="relative">
      {/* Hero Banner with Company Branding */}
      <div
        className="h-32 relative border-b"
        style={{
          borderBottomColor: company.color || "#e7e7e7",
          background: `
            linear-gradient(180deg, ${
              company.color || "#e7e7e7"
            } 0 20%, transparent 20% 100%),
            radial-gradient(1000px 320px at 90% -80px, rgba(255,255,255,.14), rgba(255,255,255,0) 60%),
            linear-gradient(180deg, ${
              company.color || "#e7e7e7"
            } 0 20%, #fff 85%)
          `,
        }}
      >
        {/* Company Logo */}
        <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
          <div
            className="bg-white rounded-lg shadow-md border-1 border-[#e7e7e7] shadow-[0 8px 24px rgba(0, 0, 0, .06)]"
            style={{
              backgroundColor: company.color || "#e7e7e7",
            }}
          >
            <img
              src={company.logo_url || "/company-logo.png"}
              alt={`${company.name} logo`}
              className="h-20 w-20 object-contain rounded-lg"
            />
          </div>
        </div>

        {/* Company Stats */}
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6">
          <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md">
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span className="font-medium">
                {company.jobs_count || 0} jobs
              </span>
              <span className="font-medium">
                {company.contacts_count || 0} contacts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div className="p-4 sm:p-6">
        {/* Company Name & Basic Info */}
        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            {company.name}
          </h1>

          {/* Location */}
          <div className="flex items-center gap-1 mb-2">
            <svg
              className="w-4 h-4 text-gray-500"
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
            <span className="text-gray-600 text-sm">
              {company.location?.join(", ") || "-"}
            </span>
          </div>
        </div>

        {/* Full Description */}
        <div className="border-t pt-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            About {company.name}
          </h2>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
              {company.full_description || "-"}
            </p>
          </div>
        </div>

        {/* Company Status Badge */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-end gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                company.is_active ? "bg-green-500" : "bg-gray-400"
              }`}
            ></div>
            <span
              className={`text-xs font-medium ${
                company.is_active ? "text-green-700" : "text-gray-500"
              }`}
            >
              {company.is_active ? "Actively Hiring" : "Not Currently Hiring"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyHero;
