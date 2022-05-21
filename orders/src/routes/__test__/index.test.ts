import request from "supertest";
import { app } from "../../app";
import { Order } from "../../models/order";
import { Ticket } from "../../models/ticket";
import mongoose from "mongoose";

const createTicket = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "random",
    price: Math.round(Math.random() * 1000),
  });

  await ticket.save();
  return ticket;
};

it("fetches orders from a particular user", async () => {
  // create 3 tickets
  const ticketNo1 = await createTicket();
  const ticketNo2 = await createTicket();
  const ticketNo3 = await createTicket();

  //@ts-ignore
  const user1 = global.signin();
  //@ts-ignore
  const user2 = global.signin();

  // create one order for user #1
  await request(app)
    .post("/api/orders")
    .set("Cookie", user1)
    .send({ ticketId: ticketNo1.id })
    .expect(201);

  // create two orders for user #2
  const { body: order1 } = await request(app)
    .post("/api/orders")
    .set("Cookie", user2)
    .send({ ticketId: ticketNo2.id })
    .expect(201);
  const { body: order2 } = await request(app)
    .post("/api/orders")
    .set("Cookie", user2)
    .send({ ticketId: ticketNo3.id })
    .expect(201);

  // make request to get orders for user #2
  const response = await request(app)
    .get("/api/orders")
    .set("Cookie", user2)
    .expect(200);

  // make sure only got the orders for user #1
  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(order1.id);
  expect(response.body[1].id).toEqual(order2.id);
  expect(response.body[0].ticket.id).toEqual(ticketNo2.id);
  expect(response.body[1].ticket.id).toEqual(ticketNo3.id);
});
