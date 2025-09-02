import JobCard from "./JobCard";
import JobCardSkeleton from "./JobCardSkeleton";

const JobsList = ({ jobs, loadingMore }) => (
  <div className="space-y-4">
    {jobs.map((job, index) => (
      <JobCard
        key={index}
        job={job}
        companyLogo={job.company?.logo_url || "/company-logo.png"}
      />
    ))}

    {/* Loading more skeletons */}
    {loadingMore &&
      Array.from({ length: 7 }).map((_, index) => (
        <JobCardSkeleton key={`loading-${index}`} />
      ))}
  </div>
);

export default JobsList;
