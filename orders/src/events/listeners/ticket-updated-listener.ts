import { Listener, Subjects, TicketUpdatedEvent } from "@sgtickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { QUEUE_GROUP_NAME } from "./queue-group-name";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName: string = QUEUE_GROUP_NAME;

  async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
    const { title, price, version } = data;
    const ticket = await Ticket.findByEventData(data);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    ticket.set({
      title,
      price,
    });

    await ticket.save();

    msg.ack();
  }
}
