import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError.js";

class ErrorController {
  constructor() {
    this.errorHandler = this.errorHandler.bind(this);
  }

  async errorHandler(
    error: any,
    _: Request,
    response: Response,
    next: NextFunction
  ) {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || "error";

    if (process.env.NODE_ENV === "development") {
      this.sendErrorDevelopment(error, response);
      return;
    }

    if (process.env.NODE_ENV === "production") {
      let errorProduction = {
        ...error,
        message: error.message,
        name: error.name,
      };

      if (errorProduction.name === "CastError") {
        errorProduction = this.handlerCastErrorDB(errorProduction);
      }

      if (errorProduction.code === 11000) {
        errorProduction = this.handlerDublicateFieldsDB(errorProduction);
      }

      if (errorProduction.name === "ValidationError") {
        errorProduction = this.handlerValidationErrorDB(errorProduction);
      }

      if (errorProduction.name === "JsonWebTokenError") {
        errorProduction = this.handlerJWTToken();
      }

      if (errorProduction.name === "TokenExpiredError") {
        errorProduction = this.handlerJWTExpiredError();
      }

      this.sendErrorProduction(errorProduction, response);
      return;
    }
  }

  private sendErrorDevelopment(error: AppError, response: Response) {
    response.status(error.statusCode).json({
      status: error.status,
      error,
      message: error.message,
      stack: error.stack,
    });
  }

  private sendErrorProduction(error: AppError, response: Response) {
    if (error.isOperation) {
      return response.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        nameError: error.nameError,
        errorMessages: error.errorMessages,
        fieldDublicate: error.fieldDublicate,
      });
    }

    response.status(500).json({
      status: "error",
      message: "Что-то пошло не так!",
    });
  }

  private handlerJWTToken() {
    const error = new AppError(
      "Недействительный токен. Пожалуйста повторите вход!",
      401,
      "JsonWebTokenError"
    );

    return error;
  }

  private handlerValidationErrorDB(error: any) {
    const errorMessages: Record<string, any> = {};
    const errors = Object.keys(error.errors)
      .map((element) => {
        const { message } = error.errors[element];
        errorMessages[element] = message;

        return message;
      })
      .join(". ");

    const message = `Недействительны входные данные! ${errors}`;
    const newError = new AppError(message, 400, error.name);
    newError.errorMessages = errorMessages;

    return newError;
  }

  private handlerCastErrorDB(error: any) {
    const message = `Не действительный ${error.path}: ${error.value}`;
    return new AppError(message, 404, error.name);
  }

  private handlerJWTExpiredError() {
    const error = new AppError(
      "Срок действия вашего токена истек! Пожалуйста, войдите снова.",
      401,
      "TokenExpiredError"
    );

    return error;
  }

  private handlerDublicateFieldsDB(error: any) {
    const key = Object.keys(error.keyValue)[0];
    const value = error.keyValue[key];
    const message = `Поле '${key}' со значением '${value}' существует!`;

    const newError = new AppError(message, 400, error.name);
    newError.fieldDublicate = key;

    return newError;
  }
}

const { errorHandler } = new ErrorController();

export default errorHandler;
