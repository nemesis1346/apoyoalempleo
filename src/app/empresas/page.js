"use client";

import { useState, useCallback, useLayoutEffect } from "react";
import { adminService } from "../../services/adminService";
import PageSkeleton from "../../components/empresas/PageSkeleton";
import CompaniesList from "../../components/empresas/CompaniesList";
import LoadMoreButton from "../../components/ui/LoadMoreButton";
import SearchSection from "../../components/search/SearchSection";
import { getItem } from "../../utils/localStorage";

export default function CompaniesPage() {
  // State management
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 7,
    total: 0,
    totalPages: 0,
  });

  // Load companies
  const loadCompanies = useCallback(
    async (isLoadMore = false, searchKey = "", city = "") => {
      try {
        if (isLoadMore) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const params = {
          page: pagination.page,
          limit: pagination.limit,
          ...(searchKey?.length > 0 && { search: searchKey }),
          ...(city?.length > 0 && { filters: { city } }),
        };

        const response = await adminService.companies.getAll(params);

        if (response.success) {
          const newCompanies = response.data || [];

          if (isLoadMore) {
            setCompanies((prevCompanies) => [
              ...prevCompanies,
              ...newCompanies,
            ]);
          } else {
            setCompanies(newCompanies);
          }

          setPagination((prev) => ({
            ...prev,
            total: response.meta?.pagination?.total || 0,
            totalPages: response.meta?.pagination?.totalPages || 0,
          }));
        }
      } catch (err) {
        setCompanies([]);
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

  const handleSearchCompanies = async (searchKey, city) => {
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
    await loadCompanies(false, searchKey, city);
  };

  // Effects
  useLayoutEffect(() => {
    const key = getItem("companiesSearchTerms")?.searchKey || "";
    const city = getItem("companiesSearchTerms")?.city || "";

    if (pagination.page === 1) {
      loadCompanies(false, key, city);
    } else {
      loadCompanies(true, key, city);
    }
  }, [pagination.limit, loadCompanies]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-2">
      <div className="container max-w-screen-md mx-auto py-2">
        {loading && <PageSkeleton />}

        {!loading && (
          <div className="bg-white shadow-lg p-4">
            {/* Title */}
            <h2 className="text-[#222] text-[18px] font-bold mb-1">
              Companies
            </h2>

            <SearchSection
              category="companies"
              search={handleSearchCompanies}
            />

            {/* Positions count */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-gray-700 font-medium">
                {pagination.total} companies
              </h2>
              <h2 className="text-xs text-blue-500 underline cursor-pointer">
                View all
              </h2>
            </div>

            <CompaniesList companies={companies} loadingMore={loadingMore} />

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
