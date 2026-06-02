export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

export const errorHandler = (error, _req, res, _next) => {
  console.error(error);

  if (error.code === 11000) {
    return res.status(409).json({ message: "A user with this email already exists." });
  }

  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    message: error.message || "Server error. Please try again."
  });
};
