"use client";

import { useState, useCallback, useLayoutEffect } from "react";
import { contactsService } from "../../services/contactsService";
import PageSkeleton from "../../components/contactos/PageSkeleton";
import ContactsList from "../../components/contactos/ContactsList";
import LoadMoreButton from "../../components/ui/LoadMoreButton";
import SearchSection from "../../components/search/SearchSection";
import { getItem } from "../../utils/localStorage";

export default function ContactsPage() {
  // State management
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 7,
    total: 0,
    totalPages: 0,
  });

  // Load contacts
  const loadContacts = useCallback(
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

        const response = await contactsService.getContacts(params);

        if (response.success) {
          const newContacts = response.data || [];

          if (isLoadMore) {
            setContacts((prevContacts) => [...prevContacts, ...newContacts]);
          } else {
            setContacts(newContacts);
          }

          setPagination((prev) => ({
            ...prev,
            total: response.meta?.pagination?.total || 0,
            totalPages: response.meta?.pagination?.totalPages || 0,
          }));
        }
      } catch (err) {
        setContacts([]);
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

  // Search contacts
  const handleSearchContacts = async (searchKey, city) => {
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
    await loadContacts(false, searchKey, city);
  };

  // Effects
  useLayoutEffect(() => {
    const key = getItem("contactsSearchTerms")?.searchKey || "";
    const city = getItem("contactsSearchTerms")?.city || "";

    if (pagination.page === 1) {
      loadContacts(false, key, city);
    } else {
      loadContacts(true, key, city);
    }
  }, [pagination.limit, loadContacts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 md:p-4">
      <div className="container max-w-screen-md mx-auto">
        {loading && <PageSkeleton />}

        {!loading && (
          <div className="bg-white shadow-lg p-2 md:p-4">
            {/* Title */}
            <h2 className="text-[#222] text-[18px] font-bold mb-1">Contacts</h2>

            <SearchSection category="contacts" search={handleSearchContacts} />

            {/* Positions count */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-gray-700 font-medium">
                {pagination.total} contacts
              </h2>
              <h2 className="text-xs text-blue-500 underline cursor-pointer">
                View all
              </h2>
            </div>

            <ContactsList contacts={contacts} loadingMore={loadingMore} />

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
