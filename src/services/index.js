/**
 * API Services Index
 * Central export point for all API services
 */

// Core API utilities
export { default as api, tokenManager, apiClient } from "./api";

// Authentication services
export { default as authService } from "./authService";

// Business domain services
export { default as companiesService } from "./companiesService";
export { default as jobsService } from "./jobsService";
export { default as contactsService } from "./contactsService";
export { default as adminService } from "./adminService";

// Re-export all services as a single object for convenience
import authService from "./authService";
import companiesService from "./companiesService";
import jobsService from "./jobsService";
import contactsService from "./contactsService";
import adminService from "./adminService";

export const services = {
  auth: authService,
  companies: companiesService,
  jobs: jobsService,
  contacts: contactsService,
  admin: adminService,
};

export default services;
