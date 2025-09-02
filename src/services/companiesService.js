import api from "./api";

/**
 * Companies Service
 * Handles company-related API operations including CRUD operations,
 * company profiles, jobs management, and employee management
 */

export const companiesService = {
  /**
   * Get all companies with optional filtering and pagination
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page
   * @param {string} [params.search] - Search term (name, description, industry)
   * @param {string} [params.industry] - Industry filter
   * @param {string} [params.location] - Location filter
   * @param {string} [params.size] - Company size filter (startup, small, medium, large, enterprise)
   * @param {string} [params.type] - Company type (public, private, nonprofit, etc.)
   * @param {boolean} [params.verified] - Only verified companies
   * @param {string} [params.sortBy] - Sort field (name, founded, size, etc.)
   * @param {string} [params.sortOrder] - Sort order (asc, desc)
   * @returns {Promise<Object>} Companies list with pagination
   */
  getCompanies: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value);
        }
      });

      const queryString = queryParams.toString();
      const url = `/companies${queryString ? `?${queryString}` : ""}`;

      return await api.get(url);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get company by ID
   * @param {string|number} companyId - Company ID
   * @param {boolean} [includeJobs=false] - Include company's active jobs
   * @returns {Promise<Object>} Company details
   */
  getCompanyById: async (companyId, includeJobs = false) => {
    try {
      const params = includeJobs ? "?include=jobs" : "";
      return await api.get(`/companies/${companyId}${params}`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all companies slugs
   * @returns {Promise<Array>} Companies slugs
   */
  getCompaniesSlugs: async () => {
    try {
      return await api.get("/companies/slugs");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get company by slug/handle
   * @param {string} slug - Company slug
   * @param {boolean} [includeJobs=false] - Include company's active jobs
   * @returns {Promise<Object>} Company details
   */
  getCompanyBySlug: async (slug, includeJobs = false) => {
    try {
      const params = includeJobs ? "?include=jobs" : "";
      return await api.get(`/companies/slug/${slug}${params}`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new company (admin only or company registration)
   * @param {Object} companyData - Company data
   * @param {string} companyData.name - Company name
   * @param {string} companyData.description - Company description
   * @param {string} companyData.website - Company website URL
   * @param {string} companyData.industry - Industry category
   * @param {string} companyData.location - Company location
   * @param {string} [companyData.slug] - Company slug/handle
   * @param {string} [companyData.size] - Company size
   * @param {string} [companyData.type] - Company type
   * @param {number} [companyData.founded] - Founded year
   * @param {string} [companyData.email] - Contact email
   * @param {string} [companyData.phone] - Contact phone
   * @param {Object} [companyData.address] - Full address object
   * @param {Array} [companyData.benefits] - Company benefits
   * @param {Array} [companyData.technologies] - Technologies used
   * @param {Object} [companyData.socialLinks] - Social media links
   * @param {File} [companyData.logo] - Company logo file
   * @param {File} [companyData.banner] - Company banner image
   * @returns {Promise<Object>} Created company
   */
  createCompany: async (companyData) => {
    try {
      // Handle file uploads
      if (
        companyData.logo instanceof File ||
        companyData.banner instanceof File
      ) {
        const formData = new FormData();

        // Add all text fields
        Object.entries(companyData).forEach(([key, value]) => {
          if (
            !(value instanceof File) &&
            value !== undefined &&
            value !== null
          ) {
            if (typeof value === "object") {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, value);
            }
          }
        });

        // Add files
        if (companyData.logo instanceof File) {
          formData.append("logo", companyData.logo);
        }
        if (companyData.banner instanceof File) {
          formData.append("banner", companyData.banner);
        }

        return await api.upload("/companies", formData);
      } else {
        return await api.post("/companies", companyData);
      }
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update company (admin or company owner only)
   * @param {string|number} companyId - Company ID
   * @param {Object} companyData - Updated company data
   * @returns {Promise<Object>} Updated company
   */
  updateCompany: async (companyId, companyData) => {
    try {
      // Handle file uploads in updates
      if (
        companyData.logo instanceof File ||
        companyData.banner instanceof File
      ) {
        const formData = new FormData();

        // Add all text fields
        Object.entries(companyData).forEach(([key, value]) => {
          if (
            !(value instanceof File) &&
            value !== undefined &&
            value !== null
          ) {
            if (typeof value === "object") {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, value);
            }
          }
        });

        // Add files
        if (companyData.logo instanceof File) {
          formData.append("logo", companyData.logo);
        }
        if (companyData.banner instanceof File) {
          formData.append("banner", companyData.banner);
        }

        return await api.upload(`/companies/${companyId}`, formData);
      } else {
        return await api.put(`/companies/${companyId}`, companyData);
      }
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete company (admin only)
   * @param {string|number} companyId - Company ID
   * @returns {Promise<Object>} Success response
   */
  deleteCompany: async (companyId) => {
    try {
      return await api.delete(`/companies/${companyId}`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get company's jobs
   * @param {string|number} companyId - Company ID
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page
   * @param {string} [params.status] - Job status filter
   * @param {string} [params.type] - Job type filter
   * @param {string} [params.category] - Job category filter
   * @returns {Promise<Object>} Company jobs list
   */
  getCompanyJobs: async (companyId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value);
        }
      });

      const queryString = queryParams.toString();
      const url = `/companies/${companyId}/jobs${
        queryString ? `?${queryString}` : ""
      }`;

      return await api.get(url);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get company employees/team members
   * @param {string|number} companyId - Company ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Company employees list
   */
  getCompanyEmployees: async (companyId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value);
        }
      });

      const queryString = queryParams.toString();
      const url = `/companies/${companyId}/employees${
        queryString ? `?${queryString}` : ""
      }`;

      return await api.get(url);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Add employee to company
   * @param {string|number} companyId - Company ID
   * @param {Object} employeeData - Employee data
   * @param {string} employeeData.email - Employee email
   * @param {string} employeeData.role - Employee role/position
   * @param {string} [employeeData.department] - Department
   * @param {string} [employeeData.permissions] - Permission level
   * @returns {Promise<Object>} Added employee
   */
  addEmployee: async (companyId, employeeData) => {
    try {
      return await api.post(`/companies/${companyId}/employees`, employeeData);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update employee role/permissions
   * @param {string|number} companyId - Company ID
   * @param {string|number} employeeId - Employee ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated employee
   */
  updateEmployee: async (companyId, employeeId, updateData) => {
    try {
      return await api.put(
        `/companies/${companyId}/employees/${employeeId}`,
        updateData,
      );
    } catch (error) {
      throw error;
    }
  },

  /**
   * Remove employee from company
   * @param {string|number} companyId - Company ID
   * @param {string|number} employeeId - Employee ID
   * @returns {Promise<Object>} Success response
   */
  removeEmployee: async (companyId, employeeId) => {
    try {
      return await api.delete(
        `/companies/${companyId}/employees/${employeeId}`,
      );
    } catch (error) {
      throw error;
    }
  },

  /**
   * Follow/Subscribe to company updates
   * @param {string|number} companyId - Company ID
   * @returns {Promise<Object>} Success response
   */
  followCompany: async (companyId) => {
    try {
      return await api.post(`/companies/${companyId}/follow`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Unfollow company
   * @param {string|number} companyId - Company ID
   * @returns {Promise<Object>} Success response
   */
  unfollowCompany: async (companyId) => {
    try {
      return await api.delete(`/companies/${companyId}/follow`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get companies followed by current user
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Followed companies list
   */
  getFollowedCompanies: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value);
        }
      });

      const queryString = queryParams.toString();
      const url = `/companies/followed${queryString ? `?${queryString}` : ""}`;

      return await api.get(url);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get company reviews/ratings
   * @param {string|number} companyId - Company ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Company reviews
   */
  getCompanyReviews: async (companyId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value);
        }
      });

      const queryString = queryParams.toString();
      const url = `/companies/${companyId}/reviews${
        queryString ? `?${queryString}` : ""
      }`;

      return await api.get(url);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Submit company review
   * @param {string|number} companyId - Company ID
   * @param {Object} reviewData - Review data
   * @param {number} reviewData.rating - Rating (1-5)
   * @param {string} reviewData.title - Review title
   * @param {string} reviewData.content - Review content
   * @param {Array} [reviewData.pros] - Pros list
   * @param {Array} [reviewData.cons] - Cons list
   * @param {string} [reviewData.position] - Reviewer's position
   * @param {boolean} [reviewData.anonymous] - Submit anonymously
   * @returns {Promise<Object>} Submitted review
   */
  submitReview: async (companyId, reviewData) => {
    try {
      return await api.post(`/companies/${companyId}/reviews`, reviewData);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update company review
   * @param {string|number} companyId - Company ID
   * @param {string|number} reviewId - Review ID
   * @param {Object} reviewData - Updated review data
   * @returns {Promise<Object>} Updated review
   */
  updateReview: async (companyId, reviewId, reviewData) => {
    try {
      return await api.put(
        `/companies/${companyId}/reviews/${reviewId}`,
        reviewData,
      );
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete company review
   * @param {string|number} companyId - Company ID
   * @param {string|number} reviewId - Review ID
   * @returns {Promise<Object>} Success response
   */
  deleteReview: async (companyId, reviewId) => {
    try {
      return await api.delete(`/companies/${companyId}/reviews/${reviewId}`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Verify company (admin only)
   * @param {string|number} companyId - Company ID
   * @param {Object} verificationData - Verification data
   * @returns {Promise<Object>} Verification response
   */
  verifyCompany: async (companyId, verificationData = {}) => {
    try {
      return await api.patch(
        `/companies/${companyId}/verify`,
        verificationData,
      );
    } catch (error) {
      throw error;
    }
  },

  /**
   * Unverify company (admin only)
   * @param {string|number} companyId - Company ID
   * @returns {Promise<Object>} Success response
   */
  unverifyCompany: async (companyId) => {
    try {
      return await api.patch(`/companies/${companyId}/unverify`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get company statistics
   * @param {string|number} companyId - Company ID
   * @returns {Promise<Object>} Company statistics
   */
  getCompanyStats: async (companyId) => {
    try {
      return await api.get(`/companies/${companyId}/stats`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get company industries list
   * @returns {Promise<Array>} Industries list
   */
  getIndustries: async () => {
    try {
      return await api.get("/companies/industries");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get company sizes list
   * @returns {Promise<Array>} Company sizes list
   */
  getCompanySizes: async () => {
    try {
      return await api.get("/companies/sizes");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Search companies with advanced filters
   * @param {Object} searchParams - Search parameters
   * @param {string} searchParams.query - Search query
   * @param {Array} [searchParams.industries] - Industry filters
   * @param {Array} [searchParams.locations] - Location filters
   * @param {Array} [searchParams.sizes] - Size filters
   * @param {number} [searchParams.minRating] - Minimum rating
   * @param {boolean} [searchParams.verifiedOnly] - Only verified companies
   * @param {Object} [searchParams.pagination] - Pagination params
   * @returns {Promise<Object>} Search results
   */
  searchCompanies: async (searchParams) => {
    try {
      return await api.post("/companies/search", searchParams);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get trending/featured companies
   * @param {Object} params - Query parameters
   * @param {number} [params.limit=10] - Number of companies to return
   * @param {string} [params.period] - Trending period (week, month, year)
   * @returns {Promise<Array>} Trending companies
   */
  getTrendingCompanies: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value);
        }
      });

      const queryString = queryParams.toString();
      const url = `/companies/trending${queryString ? `?${queryString}` : ""}`;

      return await api.get(url);
    } catch (error) {
      throw error;
    }
  },
};

export default companiesService;
