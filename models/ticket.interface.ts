import { Document } from "mongoose";

export const TicketStatus = {
  NEW: "новое",
  PROGRESS: "в работе",
  CLOSED: "завершено",
  CANCELED: "отменено",
} as const;

export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus];

export interface ITicket extends Document {
  title: string;
  content: string;
  createdAt: Date;
  status: TicketStatus;
  solution: string;
  cancelCause: string;
}
