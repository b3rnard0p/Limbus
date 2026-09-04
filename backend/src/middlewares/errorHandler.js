export function notFound(req, res, next) {
  const err = new Error(`Rota não encontrada: ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
}

export function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;

  if (err?.name === "MulterError") {
    return res.status(400).json({ status: "error", message: err.message });
  }

  if (err?.message?.includes("Apenas imagens")) {
    return res.status(400).json({ status: "error", message: err.message });
  }

  if (statusCode >= 500 && process.env.NODE_ENV !== "test") {
    console.error("🔥 Error:", err);
  }

  return res.status(statusCode).json({
    status: statusCode >= 400 && statusCode < 500 ? "fail" : "error",
    message: err.isOperational ? err.message : (statusCode === 500 ? "Erro interno do servidor." : err.message)
  });
}
