import express, { NextFunction, Request, Response, Express } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import compression from "compression";

import { __dirname } from "./dirname.js";
import AppError from "./utils/appError.js";
import xss from "./utils/xssFilter.js";
import ticketRouter from "./routes/ticket.router.js";
import globalErrorHandler from "./controllers/error.controller.js";

const app: Express = express();

const urlArray: string[] = [process.env.URL_CLIENT || ""];

app.use(
  cors({
    origin: urlArray,
    credentials: true,
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(express.static(path.join(__dirname, "public")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

app.use(mongoSanitize());
app.use(xss());
app.use(compression());

app.use("/api/v1/tickets", ticketRouter);

app.all("*", (request: Request, _: Response, next: NextFunction) => {
  next(
    new AppError(`Не найден путь ${request.originalUrl} на этом сервере!`, 404)
  );
});

app.use(globalErrorHandler);

export default app;
