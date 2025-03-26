class AppError extends Error {
  public statusCode: number;
  public status: string;
  public isOperation: boolean;
  public nameError?: string;
  public fieldDublicate?: string;
  public errorMessages?: Record<string, string>;

  constructor(message: string, statusCode: number, nameError?: string) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperation = true;
    this.nameError = nameError;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
