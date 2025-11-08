// backend/utils/helpers.js

/**
 * Capitalize first letter of a string
 */
export const capitalize = (str = "") =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

/**
 * Format a number as currency
 */
export const formatCurrency = (value, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
  }).format(value);

/**
 * Generate a random alphanumeric ID (for orders, invoices, etc.)
 */
export const generateUniqueId = (prefix = "OF") => {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${Date.now().toString().slice(-5)}-${random}`;
};

/**
 * Calculate profit margin
 */
export const calculateMargin = (revenue, cost) => {
  if (!revenue) return 0;
  return ((revenue - cost) / revenue) * 100;
};
