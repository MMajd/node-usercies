import {
  Listener,
  OrderCreatedEvent,
  Subjects,
  TicketUpdatedEvent,
} from "@sgtickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publisher/ticket-updated-publisher";
import { QUEUE_GROUP_NAME } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName: string = QUEUE_GROUP_NAME;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    ticket.set({
      orderId: data.id,
    });

    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish(
      ticket as TicketUpdatedEvent["data"]
    );

    msg.ack();
  }
}
