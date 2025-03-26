import mongoose from "mongoose";
import { ITicket, TicketStatus } from "./ticket.interface.js";

const ticketSchema = new mongoose.Schema<ITicket>(
  {
    title: {
      type: String,
      required: [true, "Обращение должно иметь поле заголовок"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Обращение должно иметь поле контент"],
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(TicketStatus),
      default: TicketStatus.NEW,
    },
    solution: String,
    cancelCause: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

export const Ticket = mongoose.model<ITicket>("Ticket", ticketSchema);
