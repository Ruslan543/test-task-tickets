import { NextFunction, Request, Response } from "express";

import Controller from "../controller.js";
import { Ticket } from "../../models/ticket.model.js";
import { isValidDate } from "../../utils/date.helper.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";

import { CustomRequest } from "../controller.interface.js";
import { IFilterObject, QueryParamsTicket } from "./ticket.interface.js";
import { ITicket, TicketStatus } from "../../models/ticket.interface.js";
import {
  CreateTicket,
  CloseTypes,
  CancelTicket,
} from "./types-body/ticket.types.js";
import { TypeMethodDefiner } from "../../types/controller.types.js";

const METHODS: Array<keyof TicketController> = [
  "setDates",
  "create",
  "cancelActiveTickets",
  "takeTicketInWork",
  "closeTicket",
  "cancelTicket",
];

class TicketController extends Controller<ITicket> {
  constructor() {
    super(Ticket, "ticket");

    METHODS.forEach((method) => {
      const handler = this[method] as TypeMethodDefiner<this, typeof method>;
      this[method] = catchAsync(handler.bind(this));
    });
  }

  async setDates(
    req: CustomRequest<{}, {}, {}, QueryParamsTicket>,
    res: Response,
    next: NextFunction
  ) {
    const filterObject: IFilterObject = {};

    if (req.query.date) {
      const date = new Date(req.query.date);
      if (!isValidDate(date)) {
        return next(
          new AppError("Неверный формат даты. Ожидалось: YYYY-MM-DD", 400)
        );
      }

      filterObject.createdAt = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      };

      delete req.query.date;
    } else if (req.query.startDate && req.query.endDate) {
      const startDate = new Date(req.query.startDate);
      const endDate = new Date(req.query.endDate);

      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        return next(
          new AppError("Неверный формат даты. Ожидалось: YYYY-MM-DD", 400)
        );
      }

      filterObject.createdAt = {
        $gte: new Date(startDate.setHours(0, 0, 0, 0)),
        $lte: new Date(endDate.setHours(23, 59, 59, 999)),
      };

      delete req.query.startDate;
      delete req.query.endDate;
    }

    req.filterObject = { ...req.filterObject, ...filterObject };
    next();
  }

  async create(
    req: Request<{}, {}, CreateTicket>,
    res: Response,
    next: NextFunction
  ) {
    const { body } = req;

    const newTicket = await Ticket.create({
      title: body.title,
      content: body.content,
    });

    res.status(201).json({
      status: "success",
      data: { ticket: newTicket },
    });
  }

  async cancelActiveTickets(req: Request, res: Response, next: NextFunction) {
    const tickets = await Ticket.updateMany(
      { status: TicketStatus.PROGRESS },
      { $set: { status: TicketStatus.CANCELED } }
    );

    if (tickets.modifiedCount === 0) {
      return next(new AppError("Нет тикетов для отмены", 404));
    }

    res.status(200).json({
      status: "success",
      data: { countCanceled: tickets.modifiedCount },
    });
  }

  async takeTicketInWork(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ) {
    await this.updateTicket(req, res, next, {
      status: TicketStatus.PROGRESS,
    });
  }

  async closeTicket(
    req: Request<{ id: string }, {}, CloseTypes>,
    res: Response,
    next: NextFunction
  ) {
    if (!req.body.solution) {
      return next(
        new AppError("При завершении обращения нужно указать решение!", 400)
      );
    }

    await this.updateTicket(req, res, next, {
      status: TicketStatus.CLOSED,
      solution: req.body.solution,
    });
  }

  async cancelTicket(
    req: Request<{ id: string }, {}, CancelTicket>,
    res: Response,
    next: NextFunction
  ) {
    if (!req.body.cancelCause) {
      return next(
        new AppError("При отмене обращения нужно указать причину!", 400)
      );
    }

    await this.updateTicket(req, res, next, {
      status: TicketStatus.CANCELED,
      cancelCause: req.body.cancelCause,
    });
  }

  private async updateTicket(
    req: Request<{ id: string }, {}, Partial<ITicket>>,
    res: Response,
    next: NextFunction,
    updateData: Partial<ITicket>
  ) {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!ticket) {
      return next(new AppError(`Не существует обращения с таким id!`, 404));
    }

    res.status(200).json({
      status: "success",
      data: { ticket },
    });
  }
}

export const ticketController = new TicketController();
