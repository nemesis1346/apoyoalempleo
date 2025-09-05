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
   * Get all jobs attributes
   * @returns {Promise<Array>} Jobs attributes
   */
  getJobsAttributes: async () => {
    try {
      return await api.get("/attributes/jobs");
    } catch (error) {
      throw error;
    }
  },
};

export default jobsService;
