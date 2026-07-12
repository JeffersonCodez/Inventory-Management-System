export class ApiError extends Error {
  constructor(statusCode, message, field) {
    super(message);
    this.statusCode = statusCode;
    this.field = field;
  }

  static badRequest(message, field) {
    return new ApiError(400, message, field);
  }
  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }
  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }
  static notFound(message = 'Not found') {
    return new ApiError(404, message);
  }
  static conflict(message, field) {
    return new ApiError(409, message, field);
  }
}
