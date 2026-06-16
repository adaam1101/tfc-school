const isProd = process.env.NODE_ENV === "production";

export const notFound = (req, res) => {
  res.status(404).json({ message: "Route not found." }); // never echo the URL back
};

export const errorHandler = (error, _req, res, _next) => {
  // In production only log the message, not the full stack (avoids leaking internals)
  if (isProd) {
    console.error(`[error] ${error.message}`);
  } else {
    console.error(error);
  }

  if (error.code === 11000) {
    return res.status(409).json({ message: "A user with this email already exists." });
  }

  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    // Never send raw error.message to the client in production for 500s
    message: statusCode === 500 && isProd
      ? "Something went wrong. Please try again."
      : error.message || "Server error. Please try again."
  });
};
