export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query
  });

  if (!result.success) {
    const errors = result.error.errors.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message
    }));

    return res.status(400).json({ message: "Validation failed.", errors });
  }

  if (result.data.body) req.body = result.data.body;
  if (result.data.params) req.params = result.data.params;
  if (result.data.query) req.query = result.data.query;
  next();
};
