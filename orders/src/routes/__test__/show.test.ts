import request from "supertest";
import { app } from "../../app";
import { Order } from "../../models/order";
import { Ticket } from "../../models/ticket";
import mongoose from "mongoose";

it("returns unauthorized if order does not belong to the user", async () => {
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

  // make request to create order belongs to user #1
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // try to fetch order belongs to user #1  by using user #2 account
  await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user2)
    .expect(401);
});

it("fetches the order", async () => {
  // create ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "random",
    price: 200,
  });
  await ticket.save();

  // @ts-ignore
  const user = global.signin();

  // make request to create order
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // make request to fetch the order
  const { body: retrivedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .expect(200);

  expect(retrivedOrder.id).toEqual(order.id);
});
