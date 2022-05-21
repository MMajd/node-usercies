import {
  Listener,
  OrderCancelledEvent,
  Subjects,
  TicketUpdatedEvent,
} from "@sgtickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publisher/ticket-updated-publisher";
import { QUEUE_GROUP_NAME } from "./queue-group-name";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  queueGroupName: string = QUEUE_GROUP_NAME;
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;

  async onMessage(
    data: OrderCancelledEvent["data"],
    msg: Message
  ): Promise<void> {
    const {
      ticket: { id: ticketId },
    } = data;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new Error("Ticket is not found");
    }

    ticket.set({ orderId: undefined });
    await ticket.save();

    new TicketUpdatedPublisher(this.client).publish(
      ticket as TicketUpdatedEvent["data"]
    );
  }
}
