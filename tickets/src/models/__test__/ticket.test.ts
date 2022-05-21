import { Ticket } from "../ticket";

it("implements optimistic concurrency control", async (done) => {
  // create an instance of a ticket
  const ticket = Ticket.build({
    title: "concert",
    price: 5,
    userId: "124",
  });

  // save the ticket to database
  await ticket.save();

  // fetch the ticket twice
  const firstTicket = await Ticket.findById(ticket.id);
  const secondTicket = await Ticket.findById(ticket.id);

  // make two separate changes to the tickets we fetched
  firstTicket!.set({ price: 10 });
  secondTicket!.set({ price: 15 });

  // save the first fetched ticket
  await firstTicket!.save();

  // save the second instance
  try {
    await secondTicket!.save();
  } catch (error) {
    return done();
  }

  throw new Error("Should not reach this point");
});

it("increase version number on multiple save", async () => {
  const ticket = Ticket.build({
    title: "concert",
    price: 5,
    userId: "124",
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);

  await ticket.save();
  expect(ticket.version).toEqual(1);

  await ticket.save();
  expect(ticket.version).toEqual(2);
});
