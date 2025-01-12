export const COMMON_RESPONSE_CODE = {
  REGISTRATION_FAILED: 'REGISTRATION_FAILED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  JWT_KEY_MISSING: 'JWT_KEY_MISSING',
  JWT_GENERATION_FAILED: 'JWT_GENERATION_FAILED',
  AUTH_VALIDATION_FAILED: 'AUTH_VALIDATION_FAILED',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  REGISTERED_SUCCESS: 'REGISTERED_SUCCESS',
  AUTH_TOKEN_REQUIRED: 'AUTH_TOKEN_REQUIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  INVALID_DATE: 'INVALID_DATE',
  INVALID_START_DATE_CANNOT_BE_PAST: 'INVALID_START_DATE_CANNOT_BE_PAST',
  CRON_DELETED: 'CRON_DELETED',
  CRON_NOT_EXISTS: 'CRON_NOT_EXISTS',
  WEBHOOOK_RESPONSE_ADDED: 'WEBHOOOK_RESPONSE_ADDED',
  CRON_JOB_NOT_FOOUND: 'CRON_JOB_NOT_FOOUND',
};

export const COMMON_RESPONSE_MESSAGE = {
  REGISTRATION_FAILED: 'Something went wrong during signup',
  INVALID_CREDENTIALS: 'Invalid credentials',
  LOGIN_FAILED: 'Something went wrong during login',
  JWT_KEY_MISSING: 'Jwt key missing',
  JWT_GENERATION_FAILED: 'Failed to generate JWT token',
  AUTH_VALIDATION_FAILED: 'Invalid token, unauthorized',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  LOGIN_SUCCESS: 'Login successful',
  REGISTERED_SUCCESS: 'User registered successfully',
  AUTH_TOKEN_REQUIRED: 'Authorization token is required',
  INVALID_TOKEN: 'Invalid or expired token',
  INVALID_DATE: 'Invalid date format. Please use DD-MM-YYYY',
  INVALID_START_DATE_CANNOT_BE_PAST: 'Start date cannot be in the past',
  CRON_DELETED: 'Cron jon deleted successfully',
  CRON_NOT_EXISTS: 'Cron job not exists',
  WEBHOOOK_RESPONSE_ADDED: 'Webhook response added successfully',
  CRON_JOB_NOT_FOOUND: 'Invalid request, Cron job not found',
};