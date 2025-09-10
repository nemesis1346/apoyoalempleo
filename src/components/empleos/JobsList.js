import JobCard from "./JobCard";
import JobCardSkeleton from "./JobCardSkeleton";

const JobsList = ({ jobs, loadingMore = false }) => (
  <div className="space-y-2 md:space-y-4">
    {jobs.map((job, index) => (
      <JobCard key={index} job={job} />
    ))}

    {/* Loading more skeletons */}
    {loadingMore &&
      Array.from({ length: 7 }).map((_, index) => (
        <JobCardSkeleton key={`loading-${index}`} />
      ))}
  </div>
);

export default JobsList;
