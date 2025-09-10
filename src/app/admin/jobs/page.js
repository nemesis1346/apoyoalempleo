"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../components/AuthContext";
import { adminService } from "../../../services/adminService";

export default function AdminJobsPage() {
  const { user } = useAuth();

  // State management
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [chipTemplates, setChipTemplates] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Filters and pagination
  const [filters, setFilters] = useState({
    search: "",
    company_id: "",
    employment_type: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Form data - simplified to match database schema
  const [formData, setFormData] = useState({
    company_id: "",
    title: "",
    employment_type: "",
    location: [],
    description: "",
    chips: [], // Selected chip keys
  });

  // Load jobs
  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };

      const response = await adminService.jobs.getAll(params);

      if (response.success) {
        setJobs(response.data || []);

        if (response.meta?.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: response.meta.pagination.total,
            totalPages: response.meta.pagination.totalPages,
          }));
        }
      } else {
        setError("Failed to load jobs");
      }
    } catch (err) {
      console.error("Load jobs error:", err);
      setError(err.message || "Failed to load jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  // Load companies for dropdown
  const loadCompanies = useCallback(async () => {
    try {
      const response = await adminService.companies.getAll({ limit: 100 });
      if (response.success) {
        setCompanies(response.data || []);
      }
    } catch (err) {
      console.error("Load companies error:", err);
      setError(err.message || "Failed to load companies");
      setCompanies([]);
    }
  }, []);

  // Load chip templates for selection
  const loadChipTemplates = useCallback(async () => {
    try {
      const response = await adminService.chipTemplates.getAll({ limit: 100 });

      if (response.success) {
        // Group templates by category
        const grouped = response.data.reduce((acc, template) => {
          const category = template.category || "other";
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(template);
          return acc;
        }, {});
        setChipTemplates(grouped);
      }
    } catch (err) {
      console.error("Load chip templates error:", err);
    }
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);

      // Prepare job data without chips
      const jobData = {
        company_id: formData.company_id,
        title: formData.title,
        employment_type: formData.employment_type,
        location: formData.location,
        description: formData.description,
      };

      let response;
      if (editingJob) {
        response = await adminService.jobs.update(editingJob.id, jobData);
      } else {
        response = await adminService.jobs.create(jobData);
      }

      if (response.success) {
        const jobId = editingJob ? editingJob.id : response.data.id;

        // Handle chips separately
        if (formData.chips && formData.chips.length > 0) {
          await updateJobChips(jobId, formData.chips);
        }

        setSuccess(
          editingJob ? "Job updated successfully" : "Job created successfully",
        );
        resetForm();
        loadJobs();
      } else {
        setError(response.error || "Operation failed");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Update job chips
  const updateJobChips = async (jobId, selectedChipKeys) => {
    try {
      // First, get all chip templates to map keys to labels
      const allChips = Object.values(chipTemplates).flat();

      // Clear existing chips and add new ones
      const chipUpdates = selectedChipKeys
        .map((chipKey, index) => {
          const template = allChips.find((chip) => chip.chip_key === chipKey);
          if (!template) return null;

          return {
            job_id: jobId,
            chip_key: chipKey,
            chip_label: template.chip_label,
            display_order: index,
          };
        })
        .filter(Boolean);

      // Note: This would require a specific API endpoint for job chips
      // For now, we'll store this info in the job description or handle it differently
      // This is a simplified approach - in practice, you'd need specific endpoints
    } catch (err) {
      console.error("Update job chips error:", err);
    }
  };

  // Handle delete
  const handleDelete = async (job) => {
    if (!confirm(`Are you sure you want to delete "${job.title}"?`)) return;

    try {
      setSubmitting(true);
      setError(null);

      const response = await adminService.jobs.delete(job.id);

      if (response.success) {
        setSuccess("Job deleted successfully");
        loadJobs();
      } else {
        setError(response.error || "Failed to delete job");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.message || "Failed to delete job");
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      company_id: "",
      title: "",
      employment_type: "",
      location: [],
      description: "",
      chips: [],
    });
    setEditingJob(null);
    setShowForm(false);
  };

  // Handle edit
  const handleEdit = (job) => {
    setFormData({
      company_id: job.company_id || "",
      title: job.title || "",
      employment_type: job.employment_type || "",
      location: Array.isArray(job.location) ? job.location : [],
      description: job.description || "",
      chips: job.chips || [], // This would come from the API in a real implementation
    });
    setEditingJob(job);
    setShowForm(true);
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Clear messages
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // Filter companies based on user role
  const availableCompanies =
    user?.role === "super_admin"
      ? companies
      : companies.filter((company) => company.id === user?.company_id);

  // Handle company selection and update location automatically
  const handleCompanyChange = (companyId) => {
    const selectedCompany = availableCompanies.find(
      (company) => company.id === parseInt(companyId),
    );

    setFormData((prev) => ({
      ...prev,
      company_id: companyId,
      // Set location to match the selected company's location
      // Only auto-populate if a company is selected (not empty string)
      location:
        companyId && selectedCompany && Array.isArray(selectedCompany.location)
          ? [...selectedCompany.location]
          : companyId
          ? []
          : prev.location, // Keep existing location if clearing company selection
    }));
  };

  // Effects
  useEffect(() => {
    if (user) {
      loadJobs();
      loadCompanies();
      loadChipTemplates();
    }
  }, [
    user,
    pagination.page,
    pagination.limit,
    filters,
    loadJobs,
    loadCompanies,
    loadChipTemplates,
  ]);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(clearMessages, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Check permissions
  if (!user || !["super_admin", "company_admin"].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You need Admin privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Jobs Management
              </h1>
              <p className="mt-2 text-gray-600">
                {user?.role === "super_admin"
                  ? "Manage all jobs in the system"
                  : "Manage your company jobs"}
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Add Job
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Search jobs..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 placeholder:text-gray-500"
            />

            {user?.role === "super_admin" && (
              <select
                value={filters.company_id}
                onChange={(e) =>
                  handleFilterChange("company_id", e.target.value)
                }
                className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 placeholder:text-gray-500"
              >
                <option value="">All Companies</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            )}

            <select
              value={filters.employment_type}
              onChange={(e) =>
                handleFilterChange("employment_type", e.target.value)
              }
              className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 placeholder:text-gray-500"
            >
              <option value="">All Types</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="temporary">Temporary</option>
            </select>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Loading jobs...</span>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No jobs found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Job Title
                      </th>
                      {user?.role === "super_admin" && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {job.title}
                            </div>
                            {job.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {job.description.substring(0, 60)}...
                              </div>
                            )}
                          </div>
                        </td>
                        {user?.role === "super_admin" && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {job.company?.name || "-"}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {job.employment_type || "Not specified"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {Array.isArray(job.location) &&
                          job.location.length > 0
                            ? job.location.join(", ")
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {job.created_at
                            ? new Date(job.created_at).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(job)}
                            className="text-purple-600 hover:text-purple-900 mr-1 cursor-pointer"
                            disabled={submitting}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(job)}
                            className="text-red-600 hover:text-red-900 cursor-pointer"
                            disabled={submitting}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing page {pagination.page} of {pagination.totalPages}{" "}
                      ({pagination.total} total)
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Job Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-lg bg-white">
              <div className="mt-2">
                <h3 className="text-lg font-medium font-semibold text-gray-900 mb-4">
                  {editingJob ? "Edit Job" : "Add New Job"}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Company *
                      </label>
                      <select
                        value={formData.company_id}
                        onChange={(e) => handleCompanyChange(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 placeholder:text-gray-500"
                        required
                      >
                        <option value={null}>Select Company *</option>
                        {availableCompanies.map((company) => (
                          <option key={company.id} value={company.id}>
                            {company.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Job Title *
                      </label>
                      <input
                        type="text"
                        placeholder="Job Title *"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-1.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 placeholder:text-gray-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Employment Type *
                      </label>
                      <select
                        value={formData.employment_type}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            employment_type: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-1.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 placeholder:text-gray-500"
                        required
                      >
                        <option value="">Select Employment Type</option>
                        <option value="full-time">Full Time</option>
                        <option value="part-time">Part Time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                        <option value="temporary">Temporary</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Location *
                      </label>
                      <div className="space-y-1 flex flex-col">
                        {[
                          "Argentina",
                          "Chile",
                          "Colombia",
                          "Ecuador",
                          "Mexico",
                          "Peru",
                          "Uruguay",
                        ].map((location) => (
                          <div key={location} className="cursor-pointer w-fit">
                            <input
                              type="checkbox"
                              checked={formData.location.includes(location)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    location: [...prev.location, location],
                                  }));
                                } else {
                                  setFormData((prev) => ({
                                    ...prev,
                                    location: prev.location.filter(
                                      (loc) => loc !== location,
                                    ),
                                  }));
                                }
                              }}
                              className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-gray-700">
                              {location}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Job Description *
                    </label>
                    <textarea
                      placeholder="Job Description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows="4"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 placeholder:text-gray-500"
                      required
                    ></textarea>
                  </div>

                  {/* Offer Chips Section */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      What Can You Offer Chips
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      Select 1-3 chips that best describe what candidates can
                      offer for this role.
                    </p>

                    {Object.keys(chipTemplates).length > 0 ? (
                      <div className="space-y-4">
                        {Object.entries(chipTemplates).map(
                          ([category, chips]) => (
                            <div key={category}>
                              <h4 className="text-sm font-medium text-gray-800 capitalize mb-2">
                                {category} ({chips.length})
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {chips.map((chip) => (
                                  <button
                                    key={chip.chip_key}
                                    type="button"
                                    onClick={() => {
                                      const isSelected =
                                        formData.chips.includes(chip.chip_key);
                                      if (isSelected) {
                                        // Remove chip
                                        setFormData((prev) => ({
                                          ...prev,
                                          chips: prev.chips.filter(
                                            (key) => key !== chip.chip_key,
                                          ),
                                        }));
                                      } else {
                                        // Add chip
                                        setFormData((prev) => ({
                                          ...prev,
                                          chips: [...prev.chips, chip.chip_key],
                                        }));
                                      }
                                    }}
                                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                                      formData.chips.includes(chip.chip_key)
                                        ? "border-purple-300 bg-purple-100 text-purple-800 font-medium"
                                        : "border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100"
                                    } ${
                                      !formData.chips.includes(chip.chip_key)
                                        ? "opacity-50 cursor-not-allowed"
                                        : "cursor-pointer"
                                    }`}
                                    disabled={
                                      !formData.chips.includes(chip.chip_key)
                                    }
                                    title={chip.description || chip.chip_label}
                                  >
                                    {chip.chip_label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic">
                        No chip templates available. Create some in the{" "}
                        <span className="text-purple-600">Chip Templates</span>{" "}
                        section first.
                      </div>
                    )}

                    {formData.chips.length > 0 && (
                      <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                        <div className="text-sm font-medium text-purple-800 mb-2">
                          Selected chips ({formData.chips.length}):
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.chips.map((chipKey) => {
                            const allChips =
                              Object.values(chipTemplates).flat();
                            const chip = allChips.find(
                              (c) => c.chip_key === chipKey,
                            );
                            return (
                              <span
                                key={chipKey}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full"
                              >
                                {chip?.chip_label || chipKey}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      chips: prev.chips.filter(
                                        (key) => key !== chipKey,
                                      ),
                                    }));
                                  }}
                                  className="ml-1 text-purple-600 hover:text-purple-800"
                                >
                                  ×
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                      disabled={submitting}
                    >
                      {submitting
                        ? "Saving..."
                        : editingJob
                        ? "Update"
                        : "Create"}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
