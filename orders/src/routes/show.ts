import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
} from "@sgtickets/common";
import express, { Request, Response } from "express";
import { Order } from "../models/order";

const router = express.Router();

router.get(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const {
      params: { orderId },
    } = req;
    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }

    if (req.currentUser!.id != order.userId) {
      throw new NotAuthorizedError();
    }

    res.send(order);
  }
);

export { router as showOrderRouter };
