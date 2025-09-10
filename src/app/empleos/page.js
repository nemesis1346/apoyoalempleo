"use client";

import { useState, useCallback, useLayoutEffect } from "react";
import { adminService } from "../../services/adminService";
import PageSkeleton from "../../components/empleos/PageSkeleton";
import SearchSection from "../../components/search/SearchSection";
import JobsList from "../../components/empleos/JobsList";
import LoadMoreButton from "../../components/ui/LoadMoreButton";
import { getItem } from "../../utils/localStorage";

export default function JobsPage() {
  // State management
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 7,
    total: 0,
    totalPages: 0,
  });

  // Load jobs
  const loadJobs = useCallback(
    async (isLoadMore = false, searchTerm = "", city = "") => {
      try {
        if (isLoadMore) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const params = {
          page: pagination.page,
          limit: pagination.limit,
          ...(searchTerm?.length > 0 && { search: searchTerm }),
        };

        const response = await adminService.jobs.getAll(params);

        if (response.success) {
          const newJobs = response.data || [];

          if (isLoadMore) {
            // Append new jobs to existing ones
            setJobs((prevJobs) => [...prevJobs, ...newJobs]);
          } else {
            // Replace jobs for initial load
            setJobs(newJobs);
          }

          if (response.meta?.pagination) {
            setPagination((prev) => ({
              ...prev,
              total: response.meta?.pagination?.total || 0,
              totalPages: response.meta.pagination.totalPages,
            }));
          }
        } else {
          setError(
            "Failed to load jobs: " + (response?.error || "Unknown error"),
          );
        }
      } catch (err) {
        setError("Failed to load jobs: " + (err?.message || "Unknown error"));
        if (!isLoadMore) {
          setJobs([]);
        }
      } finally {
        if (isLoadMore) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [pagination.page, pagination.limit],
  );

  // Handle load more
  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages && !loadingMore) {
      setPagination((prev) => ({
        ...prev,
        page: prev.page + 1,
      }));
    }
  };

  // Search jobs
  const handleSearchJobs = async (searchKey, city) => {
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
    await loadJobs(false, searchKey, city);
  };

  // Effects
  useLayoutEffect(() => {
    const key = getItem("jobsSearchTerms")?.searchKey || "";
    const city = getItem("jobsSearchTerms")?.city || "";

    if (pagination.page === 1) {
      loadJobs(false, key, city);
    } else {
      loadJobs(true, key, city);
    }
  }, [pagination.limit, loadJobs]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 md:p-4">
      <div className="container max-w-screen-md mx-auto">
        {loading && <PageSkeleton />}

        {!loading && (
          <div className="bg-white shadow-lg p-2 md:p-4">
            <h2 className="text-[#222] text-[18px] font-bold mb-1">
              Selected just for you
            </h2>

            <SearchSection category="jobs" search={handleSearchJobs} />

            {/* Positions count */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-gray-700 font-medium">
                {pagination.total} positions in Medellin
              </h2>
              <h2 className="text-xs text-blue-500 underline cursor-pointer">
                View all
              </h2>
            </div>

            <JobsList jobs={jobs} loadingMore={loadingMore} />

            <LoadMoreButton
              onLoadMore={handleLoadMore}
              hasMore={pagination.page < pagination.totalPages}
              isLoading={loadingMore}
            />
          </div>
        )}
      </div>
    </div>
  );
}
