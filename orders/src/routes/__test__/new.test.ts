import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Order, OrderStatus } from "../../models/order";
import { Ticket } from "../../models/ticket";

import { natsWrapper } from "../../nats-wrapper";

it("returns an error if ticket does not exist", async () => {
  const ticketId = mongoose.Types.ObjectId();
  await request(app)
    .post("/api/orders")
    // @ts-ignore
    .set("Cookie", global.signin())
    .send({ ticketId })
    .expect(404);
});

it("returns an error if ticket already reserved", async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "random",
    price: 2000,
  });

  await ticket.save();

  const order = Order.build({
    ticket,
    status: OrderStatus.Created,
    userId: "randomid",
    expiresAt: new Date(),
  });

  await order.save();

  await request(app)
    .post("/api/orders")
    //@ts-ignore
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it("creates an order and reserve the ticket", async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "random",
    price: 2000,
  });
  await ticket.save();

  await request(app)
    .post("/api/orders")
    //@ts-ignore
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);
});

it("emits an event on creating an order", async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "random",
    price: 2000,
  });
  await ticket.save();

  await request(app)
    .post("/api/orders")
    //@ts-ignore
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
