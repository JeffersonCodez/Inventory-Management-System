// Express 4 doesn't catch rejected promises from async route handlers on its
// own — this wrapper forwards any thrown/rejected error to next(err) so it
// always reaches errorHandler.js instead of hanging the request.
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
