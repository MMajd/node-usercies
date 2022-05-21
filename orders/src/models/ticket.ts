import { Schema, Document, Model, model } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { Order, OrderStatus } from "./order";

interface TicketAttr {
  id: string;
  title: string;
  price: number;
}

export interface TicketDoc extends Document {
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>;
}

interface TicketModel extends Model<TicketDoc> {
  build(attr: TicketAttr): TicketDoc;
  findByEventData(data: {
    id: string;
    version: number;
  }): Promise<TicketDoc | null>;
}

const ticketSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin);

/* use this instead of updateIfCurrent if you want */
// ticketSchema.pre("save", function (done) {
//   // @ts-ignore
//   this.$where = {
//     version: this.get("version") - 1,
//   };
//   done();
// });

ticketSchema.statics.build = (attr: TicketAttr) => {
  return new Ticket({
    ...attr,
    _id: attr.id,
  });
};

ticketSchema.statics.findByEventData = async (data: {
  id: string;
  version: number;
}) => {
  return await Ticket.findOne({
    _id: data.id,
    version: data.version - 1,
  });
};

ticketSchema.methods.isReserved = async function () {
  const existingOrder = await Order.findOne({
    ticket: this as TicketDoc,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });

  return !!existingOrder;
};

const Ticket = model<TicketDoc, TicketModel>("Ticket", ticketSchema);

export { Ticket };
