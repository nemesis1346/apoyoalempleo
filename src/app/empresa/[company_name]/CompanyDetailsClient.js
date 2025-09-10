"use client";

import { useState, useCallback, useLayoutEffect, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { adminService } from "../../../services/adminService";
import CompanyHero from "../../../components/company/CompanyHero";
import CompanyPageSkeleton from "../../../components/company/CompanyPageSkeleton";
import JobsList from "../../../components/empleos/JobsList";
import LoadMoreButton from "../../../components/ui/LoadMoreButton";

export default function CompanyDetailsClient({ params }) {
  const { company_name } = use(params);
  const router = useRouter();

  // State management
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingMoreJobs, setLoadingMoreJobs] = useState(false);
  const [error, setError] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [jobsPagination, setJobsPagination] = useState({
    page: 1,
    limit: 7,
    total: 0,
    totalPages: 0,
  });

  // Load company details
  const loadCompany = useCallback(async (companyId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminService.companies.getById(companyId);

      if (response.success) {
        setCompany(response.data);
        setCompanyId(companyId);
        return response.data;
      }
      setError("Failed to load company. Please try again later.");
      return null;
    } catch (err) {
      setError("Failed to load company. Please try again later.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load company jobs
  const loadCompanyJobs = useCallback(
    async (companyId, isLoadMore = false) => {
      try {
        if (isLoadMore) {
          setLoadingMoreJobs(true);
        } else {
          setLoadingJobs(true);
        }
        setError(null);

        const params = {
          page: jobsPagination.page,
          limit: jobsPagination.limit,
          company_id: companyId,
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
            setJobsPagination((prev) => ({
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
          setLoadingMoreJobs(false);
        } else {
          setLoadingJobs(false);
        }
      }
    },
    [jobsPagination.page, jobsPagination.limit],
  );

  // Handle load more jobs
  const handleLoadMoreJobs = () => {
    if (
      jobsPagination.page < jobsPagination.totalPages &&
      !loadingMoreJobs &&
      companyId
    ) {
      setJobsPagination((prev) => ({
        ...prev,
        page: prev.page + 1,
      }));
    }
  };

  // Update document title and meta tags when company loads
  useEffect(() => {
    if (companyId && company) {
      document.title = `${company.name} - Company Details | Apoyo al Empleo`;

      // Update meta description
      const metaDescription = document.querySelector(
        'meta[name="description"]',
      );
      if (metaDescription) {
        metaDescription.setAttribute(
          "content",
          `Learn about ${company.name}. ${
            company.short_description || ""
          } View open positions and company information.`,
        );
      }
    }
  }, [companyId, company?.name, company?.short_description]);

  // Effects
  useLayoutEffect(() => {
    const initializePage = async () => {
      const companyId = sessionStorage.getItem("companyId");
      const loadedCompany = await loadCompany(companyId);
      if (loadedCompany) {
        // Reset jobs pagination for new company
        setJobsPagination((prev) => ({ ...prev, page: 1 }));
      }
    };

    initializePage();
  }, [loadCompany]);

  useLayoutEffect(() => {
    if (
      company &&
      companyId &&
      (jobsPagination.page === 1 || jobsPagination.page > 1)
    ) {
      loadCompanyJobs(companyId, jobsPagination.page > 1);
    }
  }, [companyId, jobsPagination.page, loadCompanyJobs, company]);

  if (loading) {
    return <CompanyPageSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 md:p-4">
        <div className="container max-w-screen-md mx-auto py-2">
          <div className="bg-white shadow-lg p-4 rounded-lg">
            <div className="text-center py-8">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Company Not Found
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => router.push("/empresas")}
                className="text-blue-500 hover:underline font-medium"
              >
                ← Back to Companies
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 md:p-4">
      <div className="container max-w-screen-md mx-auto py-2">
        {/* Breadcrumb Navigation */}
        <div className="mb-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <button
              onClick={() => router.push("/empresas")}
              className="hover:text-blue-600 transition-colors cursor-pointer hover:underline"
            >
              Companies
            </button>
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
            <span className="text-gray-800 font-medium">{company?.name}</span>
          </nav>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden p-2 md:p-4">
          {/* Company Hero Section */}
          <CompanyHero company={company} />

          {/* Jobs Section */}
          <div className="p-2 md:p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[#222] text-[18px] font-bold">
                Open Positions
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-gray-700 font-medium">
                  {jobsPagination.total} positions
                </span>
                {jobsPagination.total > 0 && (
                  <button
                    onClick={() =>
                      router.push(
                        `/empleos?company=${encodeURIComponent(company?.name)}`,
                      )
                    }
                    className="text-xs text-blue-500 hover:text-blue-600 underline font-medium"
                  >
                    View All
                  </button>
                )}
              </div>
            </div>

            {loadingJobs ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse flex gap-2 items-center p-2 md:p-4 border-1 border-[#0001] shadow-lg rounded-lg"
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
            ) : jobs.length > 0 ? (
              <>
                <JobsList jobs={jobs} loadingMore={loadingMoreJobs} />
                <LoadMoreButton
                  onLoadMore={handleLoadMoreJobs}
                  hasMore={jobsPagination.page < jobsPagination.totalPages}
                  isLoading={loadingMoreJobs}
                />
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  No open positions at this company right now.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Check back later for new opportunities!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
