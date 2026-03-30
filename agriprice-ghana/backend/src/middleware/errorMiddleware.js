export function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

export function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    message: error.message || "Unexpected server error",
    ...(error.details && { details: error.details }),
    ...(process.env.NODE_ENV !== "production" && { stack: error.stack })
  });
}
