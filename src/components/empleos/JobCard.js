import Link from "next/link";

const JobCard = ({ job }) => (
  <div className="flex gap-2 items-center p-2 border-1 border-[#0001] shadow-lg rounded-lg">
    <div
      className="bg-white rounded-lg shadow-md border-1 border-[#e7e7e7] shadow-[0 8px 24px rgba(0, 0, 0, .06)]"
      style={{
        backgroundColor: job.company.color || "#e7e7e7",
      }}
    >
      <img
        src={job.company?.logo_url || "/company-logo.png"}
        alt="Company logo"
        className="h-20 w-20 min-w-20 min-h-20 object-contain rounded-lg"
      />
    </div>
    <div className="flex flex-col justify-between gap-2 w-full">
      <div>
        <Link
          href={`/empleos/${job.id}`}
          className="text-gray-800 text-xl font-semibold hover:underline"
        >
          {job.title}
        </Link>
      </div>
      <div className="text-xs text-gray-600">
        {job.company?.name} •{" "}
        <span className="text-[#5e3fa6] px-1 py-0.5 rounded-full border-1 border-[#5e3fa6] bg-[#e6e3f4] font-semibold">
          {job.employment_type}
        </span>
      </div>
      <div className="flex items-center gap-1 mb-2 text-xs text-gray-600">
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
        <span>{job.location?.join(", ") || "-"}</span>
      </div>
    </div>
  </div>
);

export default JobCard;
