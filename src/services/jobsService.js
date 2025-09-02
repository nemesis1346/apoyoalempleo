import api from "./api";

/**
 * Jobs Service
 * Handles job-related API operations
 */

export const jobsService = {
  /**
   * Get all jobs with optional filtering and pagination
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page
   * @param {string} [params.search] - Search term
   * @param {string} [params.category] - Job category
   * @param {string} [params.location] - Job location
   * @param {string} [params.type] - Job type (full-time, part-time, etc.)
   * @param {string} [params.level] - Experience level
   * @param {string} [params.company] - Company ID or name
   * @param {string} [params.sortBy] - Sort field
   * @param {string} [params.sortOrder] - Sort order (asc, desc)
   * @returns {Promise<Object>} Jobs list with pagination
   */
  getJobs: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value);
        }
      });

      const queryString = queryParams.toString();
      const url = `/jobs${queryString ? `?${queryString}` : ""}`;

      return await api.get(url);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get job by ID
   * @param {string|number} jobId - Job ID
   * @returns {Promise<Object>} Job details
   */
  getJobById: async (jobId) => {
    try {
      return await api.get(`/jobs/${jobId}`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new job (admin/employer only)
   * @param {Object} jobData - Job data
   * @param {string} jobData.title - Job title
   * @param {string} jobData.description - Job description
   * @param {string} jobData.company - Company name or ID
   * @param {string} jobData.location - Job location
   * @param {string} jobData.type - Job type
   * @param {string} jobData.category - Job category
   * @param {string} jobData.level - Experience level
   * @param {number} [jobData.salary] - Salary amount
   * @param {string} [jobData.salaryType] - Salary type (hourly, monthly, annual)
   * @param {Array} [jobData.requirements] - Job requirements
   * @param {Array} [jobData.benefits] - Job benefits
   * @param {Date} [jobData.deadline] - Application deadline
   * @returns {Promise<Object>} Created job
   */
  createJob: async (jobData) => {
    try {
      return await api.post("/jobs", jobData);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update job (admin/employer only)
   * @param {string|number} jobId - Job ID
   * @param {Object} jobData - Updated job data
   * @returns {Promise<Object>} Updated job
   */
  updateJob: async (jobId, jobData) => {
    try {
      return await api.put(`/jobs/${jobId}`, jobData);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete job (admin/employer only)
   * @param {string|number} jobId - Job ID
   * @returns {Promise<Object>} Success response
   */
  deleteJob: async (jobId) => {
    try {
      return await api.delete(`/jobs/${jobId}`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Apply for a job
   * @param {string|number} jobId - Job ID
   * @param {Object} applicationData - Application data
   * @param {string} [applicationData.coverLetter] - Cover letter
   * @param {File} [applicationData.resume] - Resume file
   * @param {Object} [applicationData.additionalInfo] - Additional information
   * @returns {Promise<Object>} Application response
   */
  applyForJob: async (jobId, applicationData = {}) => {
    try {
      // If there's a file upload, use FormData
      if (applicationData.resume instanceof File) {
        const formData = new FormData();
        formData.append("resume", applicationData.resume);

        if (applicationData.coverLetter) {
          formData.append("coverLetter", applicationData.coverLetter);
        }

        if (applicationData.additionalInfo) {
          formData.append(
            "additionalInfo",
            JSON.stringify(applicationData.additionalInfo),
          );
        }

        return await api.upload(`/jobs/${jobId}/apply`, formData);
      } else {
        return await api.post(`/jobs/${jobId}/apply`, applicationData);
      }
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user's job applications
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page
   * @param {string} [params.status] - Application status
   * @returns {Promise<Object>} Applications list
   */
  getMyApplications: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value);
        }
      });

      const queryString = queryParams.toString();
      const url = `/jobs/applications${queryString ? `?${queryString}` : ""}`;

      return await api.get(url);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get applications for a specific job (employer/admin only)
   * @param {string|number} jobId - Job ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Applications list
   */
  getJobApplications: async (jobId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value);
        }
      });

      const queryString = queryParams.toString();
      const url = `/jobs/${jobId}/applications${
        queryString ? `?${queryString}` : ""
      }`;

      return await api.get(url);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update application status (employer/admin only)
   * @param {string|number} jobId - Job ID
   * @param {string|number} applicationId - Application ID
   * @param {string} status - New status (pending, reviewing, accepted, rejected)
   * @param {string} [notes] - Status update notes
   * @returns {Promise<Object>} Updated application
   */
  updateApplicationStatus: async (jobId, applicationId, status, notes = "") => {
    try {
      return await api.patch(`/jobs/${jobId}/applications/${applicationId}`, {
        status,
        notes,
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Withdraw job application
   * @param {string|number} jobId - Job ID
   * @returns {Promise<Object>} Success response
   */
  withdrawApplication: async (jobId) => {
    try {
      return await api.delete(`/jobs/${jobId}/apply`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Save/bookmark a job
   * @param {string|number} jobId - Job ID
   * @returns {Promise<Object>} Success response
   */
  saveJob: async (jobId) => {
    try {
      return await api.post(`/jobs/${jobId}/save`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Unsave/unbookmark a job
   * @param {string|number} jobId - Job ID
   * @returns {Promise<Object>} Success response
   */
  unsaveJob: async (jobId) => {
    try {
      return await api.delete(`/jobs/${jobId}/save`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get saved jobs
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Saved jobs list
   */
  getSavedJobs: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value);
        }
      });

      const queryString = queryParams.toString();
      const url = `/jobs/saved${queryString ? `?${queryString}` : ""}`;

      return await api.get(url);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get job categories
   * @returns {Promise<Array>} Job categories
   */
  getJobCategories: async () => {
    try {
      return await api.get("/jobs/categories");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get job statistics
   * @returns {Promise<Object>} Job statistics
   */
  getJobStats: async () => {
    try {
      return await api.get("/jobs/stats");
    } catch (error) {
      throw error;
    }
  },
};

export default jobsService;
