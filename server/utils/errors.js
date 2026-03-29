export class AppError extends Error {
  constructor(message, statusCode = 500, details = undefined) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function toAppError(error, fallbackMessage = "Something went wrong.") {
  if (error instanceof AppError) {
    return error;
  }

  return new AppError(
    error?.message || fallbackMessage,
    error?.statusCode || 500,
    error?.details
  );
}
