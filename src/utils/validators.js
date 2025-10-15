export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

export const validateMerchant = (data, options = {}) => {
  const { requireApiKey = true } = options;
  const errors = {};

  if (!validateRequired(data.name)) {
    errors.name = 'Gaming hub name is required';
  }

  if (requireApiKey && !validateRequired(data.apiKey)) {
    errors.apiKey = 'API key is required';
  }

  if (!validateRequired(data.telegramChannelId)) {
    errors.telegramChannelId = 'Telegram Channel ID is required';
  }

  if (!validateRequired(data.subdomain)) {
    errors.subdomain = 'Gaming portal URL is required';
  }

  const commission = Number(data.adminCommissionPercent);
  if (!Number.isFinite(commission)) {
    errors.adminCommissionPercent = 'Commission must be a number';
  } else if (commission < 0 || commission > 20) {
    errors.adminCommissionPercent = 'Commission must be between 0 and 20';
  }

  if (data.supportLink && !validateUrl(data.supportLink)) {
    errors.supportLink = 'Please enter a valid URL';
  }

  if (data.bannerImage && !validateUrl(data.bannerImage)) {
    errors.bannerImage = 'Banner image must be a valid URL';
  }

  return errors;
};


export const validateUser = (data) => {
  const errors = {};
  
  if (!validateRequired(data.email)) {
    errors.email = 'Email is required';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email';
  }
  
  if (!validateRequired(data.password)) {
    errors.password = 'Password is required';
  } else if (!validatePassword(data.password)) {
    errors.password = 'Password must be at least 6 characters';
  }
  
  if (!data.merchantId) {
    errors.merchantId = 'Please select a gaming hub';
  }
  
  return errors;
};
