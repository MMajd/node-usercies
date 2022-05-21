import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Order, OrderStatus } from "../../models/order";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it("deletes an order sucessfully", async () => {
  // create ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "random",
    price: 200,
  });
  await ticket.save();

  // @ts-ignore
  const user = global.signin();

  // make request to create order belongs to user #1
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .expect(204);

  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("no other user the the owner can delete an order", async () => {
  // create ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "random",
    price: 200,
  });
  await ticket.save();

  // @ts-ignore
  const user = global.signin();
  // @ts-ignore
  const user2 = global.signin();

  // make request to create order
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // make request to fetch the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user2)
    .expect(401);
});

it("can not delete unexistance order", async () => {
  // @ts-ignore
  const user = global.signin();
  const order = { id: mongoose.Types.ObjectId() };

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .expect(404);
});

it("emits an event after deleting an order", async () => {
  // create ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "random",
    price: 200,
  });
  await ticket.save();

  // @ts-ignore
  const user = global.signin();

  // make request to create order belongs to user #1
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
