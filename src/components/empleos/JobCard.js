import Link from "next/link";

const JobCard = ({ job, companyLogo }) => (
  <div className="flex gap-2 items-center p-2 border-1 border-[#0001] shadow-lg rounded-lg">
    <div className="min-w-[75px] h-[75px] rounded-lg">
      <img
        src={companyLogo}
        alt="Company logo"
        className="rounded-lg min-w-[75px] max-w-[75px] h-[75px] border-1 border-[#dbe3ff]"
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
        {job.company_name} •{" "}
        <span className="text-[#5e3fa6] px-1 py-0.5 rounded-full border-1 border-[#5e3fa6] bg-[#e6e3f4] font-semibold">
          {job.employment_type}
        </span>
      </div>
      <div className="text-xs text-gray-600">
        4 published positions in total
      </div>
    </div>
  </div>
);

export default JobCard;
