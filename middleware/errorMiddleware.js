const errorMiddleware = (err, req, res, next) => {
  // Fallback values if the error doesn't explicitly have them set
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log the full stack trace to your terminal for backend debugging
  console.error('💥 Operational Error Caught:', {
    message: err.message,
    status: err.status,
    statusCode: err.statusCode,
    stack: err.stack
  });

  // Return a clean, production-ready JSON message to the client (Postman/Frontend)
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message || 'Internal Server Error'
  });
};

module.exports = errorMiddleware;