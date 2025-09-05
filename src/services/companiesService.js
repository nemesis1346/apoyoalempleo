import api from "./api";

/**
 * Companies Service
 * Handles company-related API operations including CRUD operations,
 * company profiles, jobs management, and employee management
 */

export const companiesService = {
  /**
   * Get all companies attributes
   * @returns {Promise<Array>} Companies attributes
   */
  getCompaniesAttributes: async () => {
    try {
      return await api.get("/attributes/companies");
    } catch (error) {
      throw error;
    }
  },
};

export default companiesService;
