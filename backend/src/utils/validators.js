/**
 * Validation Utilities
 */

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPassword = (password) => {
  // At least 6 characters, contains letter and number
  return password && password.length >= 6 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
};

const isValidMongoId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

const isValidBidAmount = (amount) => {
  return amount && !isNaN(amount) && parseFloat(amount) > 0;
};

const isValidPincode = (pincode) => {
  return pincode && /^[0-9]{5,6}$/.test(pincode);
};

const isValidPhoneNumber = (phone) => {
  return phone && /^[0-9]{10}$/.test(phone);
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidMongoId,
  isValidBidAmount,
  isValidPincode,
  isValidPhoneNumber
};
