import { Router } from "express";
import { ticketController } from "../controllers/ticket/ticket.controller.js";

const router: Router = Router();

router
  .route("/")
  .get(ticketController.setDates, ticketController.getAll)
  .post(ticketController.create);

router.patch("/take-ticket-in-work/:id", ticketController.takeTicketInWork);
router.patch("/close-ticket/:id", ticketController.closeTicket);
router.patch("/cancel-ticket/:id", ticketController.cancelTicket);

router.patch("/cancel-active-tickets", ticketController.cancelActiveTickets);

export default router;
