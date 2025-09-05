import { jobsService } from "../../../services/jobsService";
import JobDetailsPageClient from "./JobDetailsPageClient";

// Generate static params for all job IDs (required for static export)
export async function generateStaticParams() {
  try {
    const response = await jobsService.getJobsAttributes();
    return response.data.map((attribute) => ({ id: String(attribute.id) }));
  } catch (error) {
    console.warn(
      "API not available during build, using fallback static params:",
      error.message,
    );
    return [];
  }
}

// Main page component that receives static params
export default function JobDetailsPage({ params }) {
  return <JobDetailsPageClient params={params} />;
}
