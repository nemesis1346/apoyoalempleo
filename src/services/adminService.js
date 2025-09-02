/**
 * Admin Service - Professional API service for admin operations
 * Handles authenticated admin requests with proper error handling
 */

import { api } from "./api.js";

export const adminService = {
  // Companies Management
  companies: {
    /**
     * Get all companies (admin view - includes inactive)
     */
    getAll: async (params = {}) => {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);
      if (params.search) queryParams.append("search", params.search);
      if (params.filters)
        queryParams.append("filters", JSON.stringify(params.filters));
      if (params.status) queryParams.append("status", params.status);

      const queryString = queryParams.toString();
      const url = `/admin/companies${queryString ? `?${queryString}` : ""}`;

      return await api.get(url);
    },

    /**
     * Get single company by ID
     */
    getById: async (id) => {
      return await api.get(`/admin/companies/${id}`);
    },

    /**
     * Create new company
     */
    create: async (data) => {
      return await api.post("/admin/companies", data);
    },

    /**
     * Update existing company
     */
    update: async (id, data) => {
      return await api.put(`/admin/companies/${id}`, data);
    },

    /**
     * Delete company
     */
    delete: async (id) => {
      return await api.delete(`/admin/companies/${id}`);
    },

    /**
     * Create company with logo upload
     */
    createWithLogo: async (formData) => {
      return await api.upload("/admin/companies", formData);
    },

    /**
     * Update company with logo upload
     */
    updateWithLogo: async (id, formData) => {
      return await api.uploadPut(`/admin/companies/${id}`, formData);
    },

    /**
     * Bulk operations
     */
    bulkUpdate: async (ids, data) => {
      return await api.patch("/admin/companies/bulk", { ids, data });
    },

    bulkDelete: async (ids) => {
      return await api.post("/admin/companies/bulk-delete", { ids });
    },
  },

  // Jobs Management
  jobs: {
    /**
     * Get all jobs (admin view)
     */
    getAll: async (params = {}) => {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);
      if (params.search) queryParams.append("search", params.search);
      if (params.company_id)
        queryParams.append("company_id", params.company_id);
      if (params.employment_type)
        queryParams.append("employment_type", params.employment_type);

      const queryString = queryParams.toString();
      const url = `/admin/jobs${queryString ? `?${queryString}` : ""}`;

      return await api.get(url);
    },

    /**
     * Get single job by ID
     */
    getById: async (id) => {
      return await api.get(`/admin/jobs/${id}`);
    },

    /**
     * Create new job
     */
    create: async (data) => {
      return await api.post("/admin/jobs", data);
    },

    /**
     * Update existing job
     */
    update: async (id, data) => {
      return await api.put(`/admin/jobs/${id}`, data);
    },

    /**
     * Delete job
     */
    delete: async (id) => {
      return await api.delete(`/admin/jobs/${id}`);
    },
  },

  // Contacts Management
  contacts: {
    /**
     * Get all contacts (admin view)
     */
    getAll: async (params = {}) => {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);
      if (params.search) queryParams.append("search", params.search);
      if (params.company_id)
        queryParams.append("company_id", params.company_id);

      const queryString = queryParams.toString();
      const url = `/admin/contacts${queryString ? `?${queryString}` : ""}`;

      return await api.get(url);
    },

    /**
     * Get single contact by ID
     */
    getById: async (id) => {
      return await api.get(`/admin/contacts/${id}`);
    },

    /**
     * Create new contact
     */
    create: async (data) => {
      return await api.post("/admin/contacts", data);
    },

    /**
     * Update existing contact
     */
    update: async (id, data) => {
      return await api.put(`/admin/contacts/${id}`, data);
    },

    /**
     * Delete contact
     */
    delete: async (id) => {
      return await api.delete(`/admin/contacts/${id}`);
    },
  },

  // Users Management
  users: {
    getAll: async (params = {}) => {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);
      if (params.search) queryParams.append("search", params.search);
      if (params.role) queryParams.append("role", params.role);

      const queryString = queryParams.toString();
      const url = `/admin/users${queryString ? `?${queryString}` : ""}`;

      return await api.get(url);
    },

    update: async (id, data) => {
      return await api.put(`/admin/users/${id}`, data);
    },

    delete: async (id) => {
      return await api.delete(`/admin/users/${id}`);
    },
  },

  // Dashboard Stats
  stats: {
    get: async () => {
      return await api.get("/admin/stats");
    },
  },
};

export default adminService;
