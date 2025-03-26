import mongoose from "mongoose";
import { Server } from "http";

import "./env.js";
import app from "./app.js";

async function connectDatabase() {
  if (!process.env.DATABASE) {
    throw new Error("DATABASE не указан в .env");
  }

  await mongoose.connect(process.env.DATABASE);
  console.log("Подключение к базе данных выполнено успешно!");
}

connectDatabase().catch((error: Error) => console.log(error));

const port: number = Number(process.env.PORT) || 3000;
const server: Server = app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}...`);
});

process.on("unhandledRejection", (error: Error) => {
  console.log("НЕОБРАБОТАННЫЙ ОТКАЗ! 💥 Выключаем...");
  console.log(error.name, error.message);

  server.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  console.log("👋 СИГНАЛ ПОЛУЧЕН. Грамотное выключение");

  server.close(() => {
    console.log("💥 Процесс прекращен!");
  });
});
