/** Operational HTTP error with a status code and optional details. */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace?.(this, ApiError);
  }

  static badRequest(msg = 'درخواست نامعتبر است.', details?: unknown) {
    return new ApiError(400, msg, details);
  }
  static unauthorized(msg = 'احراز هویت لازم است.') {
    return new ApiError(401, msg);
  }
  static forbidden(msg = 'دسترسی مجاز نیست.') {
    return new ApiError(403, msg);
  }
  static notFound(msg = 'یافت نشد.') {
    return new ApiError(404, msg);
  }
  static conflict(msg = 'تعارض داده‌ای رخ داد.') {
    return new ApiError(409, msg);
  }
}
