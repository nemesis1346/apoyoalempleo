"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../components/AuthContext";
import { adminService } from "../../../services/adminService";

export default function ChipTemplatesPage() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    chip_key: "",
    chip_label: "",
    category: "other",
    description: "",
    is_active: true,
  });

  // Pagination and filtering
  const [filters, setFilters] = useState({
    search: "",
    category: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const validCategories = [
    "availability",
    "skills",
    "certifications",
    "location",
    "experience",
    "other",
  ];

  // Load chip templates
  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };

      const response = await adminService.chipTemplates.getAll(params);

      if (response.success) {
        setTemplates(response.data);
        setPagination((prev) => ({
          ...prev,
          total: response.meta.pagination.total,
          totalPages: response.meta.pagination.totalPages,
        }));
      } else {
        setError(response.error || "Failed to fetch chip templates");
      }
    } catch (err) {
      console.error("Load templates error:", err);
      setError("Failed to fetch chip templates");
    } finally {
      setLoading(false);
    }
  };

  // Create or update chip template
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      let response;
      if (editingTemplate) {
        response = await adminService.chipTemplates.update(
          editingTemplate.id,
          formData,
        );
      } else {
        response = await adminService.chipTemplates.create(formData);
      }

      if (response.success) {
        await loadTemplates();
        setShowForm(false);
        setEditingTemplate(null);
        resetForm();
      } else {
        setError(response.error || "Failed to save chip template");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError("Failed to save chip template");
    } finally {
      setLoading(false);
    }
  };

  // Delete chip template
  const handleDelete = async (templateId) => {
    if (!confirm("Are you sure you want to delete this chip template?")) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await adminService.chipTemplates.delete(templateId);

      if (response.success) {
        await loadTemplates();
      } else {
        setError(response.error || "Failed to delete chip template");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete chip template");
    } finally {
      setLoading(false);
    }
  };

  // Edit chip template
  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      chip_key: template.chip_key,
      chip_label: template.chip_label,
      category: template.category || "other",
      description: template.description || "",
      is_active: template.is_active,
    });
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      chip_key: "",
      chip_label: "",
      category: "other",
      description: "",
      is_active: true,
    });
  };

  // Apply filters
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Generate chip key from label
  const generateChipKey = (label) => {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "") // Remove special characters
      .replace(/\s+/g, "_") // Replace spaces with underscores
      .trim();
  };

  useEffect(() => {
    if (user) {
      loadTemplates();
    }
  }, [user, pagination.page, filters]);

  if (!user) {
    return <div>Loading...</div>;
  }

  // Group templates by category for display
  const groupedTemplates = templates.reduce((groups, template) => {
    const category = template.category || "other";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(template);
    return groups;
  }, {});

  return (
    <div className="bg-gray-50">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Chip Templates Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage reusable offer chips for job postings
              </p>
            </div>
            <button
              onClick={() => {
                setShowForm(true);
                setEditingTemplate(null);
                resetForm();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Add Chip Template
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                value={filters.search}
                onChange={(e) =>
                  handleFilterChange({ ...filters, search: e.target.value })
                }
                placeholder="Search key, label, description..."
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 placeholder:text-gray-500"
              />
            </div>
            <div>
              <select
                value={filters.category}
                onChange={(e) =>
                  handleFilterChange({ ...filters, category: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 placeholder:text-gray-500"
              >
                <option value="">All Categories</option>
                {validCategories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Chip Templates by Category */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.keys(groupedTemplates).length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <p className="text-gray-500">No chip templates found</p>
                </div>
              ) : (
                validCategories.map((categoryKey) => {
                  const categoryTemplates = groupedTemplates[categoryKey];
                  if (!categoryTemplates || categoryTemplates.length === 0)
                    return null;

                  return (
                    <div
                      key={categoryKey}
                      className="bg-white rounded-lg shadow"
                    >
                      <div className="px-4 py-3 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 capitalize">
                          {categoryKey} ({categoryTemplates.length})
                        </h3>
                      </div>
                      <div className="px-4 py-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {categoryTemplates.map((template) => (
                            <div
                              key={template.id}
                              className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">
                                    {template.chip_label}
                                  </div>
                                  <div className="text-sm text-gray-500 font-mono">
                                    {template.chip_key}
                                  </div>
                                  {template.description && (
                                    <div className="text-sm text-gray-600 mt-1">
                                      {template.description}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2 ml-2">
                                  <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      template.is_active
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {template.is_active ? "Active" : "Inactive"}
                                  </span>
                                </div>
                              </div>
                              <div className="flex justify-end space-x-1">
                                <button
                                  onClick={() => handleEdit(template)}
                                  className="text-blue-600 hover:text-blue-900 text-sm"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDelete(template.id)}
                                  className="text-red-600 hover:text-red-900 text-sm"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page {pagination.page} of {pagination.totalPages} (
                  {pagination.total} total)
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
        </div>

        {/* Create/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white mb-24">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingTemplate ? "Edit Chip Template" : "Add Chip Template"}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chip Label *
                    </label>
                    <input
                      type="text"
                      value={formData.chip_label}
                      onChange={(e) => {
                        const label = e.target.value;
                        setFormData({
                          ...formData,
                          chip_label: label,
                          // Auto-generate key if not editing
                          chip_key: editingTemplate
                            ? formData.chip_key
                            : generateChipKey(label),
                        });
                      }}
                      required
                      placeholder="e.g., night shifts"
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chip Key *
                    </label>
                    <input
                      type="text"
                      value={formData.chip_key}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          chip_key: e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9_]/g, ""),
                        })
                      }
                      required
                      placeholder="e.g., nights"
                      pattern="[a-z0-9_]+"
                      title="Only lowercase letters, numbers, and underscores allowed"
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 placeholder:text-gray-500 font-mono"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Used in code. Only lowercase letters, numbers, and
                      underscores.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      required
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 placeholder:text-gray-500"
                    >
                      {validCategories.map((category) => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Help text for admins"
                      rows="2"
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.is_active}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_active: e.target.value === "true",
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 placeholder:text-gray-500"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingTemplate(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading
                        ? "Saving..."
                        : editingTemplate
                        ? "Update"
                        : "Create"}
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
