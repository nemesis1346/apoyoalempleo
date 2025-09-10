/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useCallback, use, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminService } from "../../../services";
import JobDetailsClient from "./JobDetailsClient";
import JobDetailsSkeleton from "./JobDetailsSkeleton";

// Client component for the actual page content
export default function JobDetailsPageClient({ params }) {
  const { id } = use(params);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchJob = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminService.jobs.getById(id);

      if (response.success) {
        setJob(response.data);
      } else {
        setError(response.error || "Failed to load job details");
      }
    } catch (err) {
      setError(err.message || "Failed to load job details");
    } finally {
      setLoading(false);
    }
  }, []);

  // Effects
  useLayoutEffect(() => {
    fetchJob();
  }, [id]);

  if (loading) {
    return <JobDetailsSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-2 md:px-4 py-2">
        <div className="container max-w-screen-md mx-auto py-2">
          <div className="bg-white shadow-lg p-2 md:p-4 rounded-lg">
            <div className="text-center py-8">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Job Not Found
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => router.push("/empleos")}
                className="text-blue-500 hover:underline font-medium"
              >
                ← Back to Jobs
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-2 md:px-4 py-2">
        <div className="container max-w-screen-md mx-auto py-2">
          <div className="bg-white shadow-lg p-2 md:p-4 text-center">
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              Job Not Found
            </h1>
            <p className="text-gray-600 mb-4">
              The job you're looking for doesn't exist or has been removed.
            </p>
            <Link
              href="/empleos"
              className="bg-yellow-400 text-yellow-900 px-2 md:px-4 py-2 rounded-xl font-bold hover:bg-yellow-300 transition-colors"
            >
              Browse All Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <JobDetailsClient job={job} />;
}
