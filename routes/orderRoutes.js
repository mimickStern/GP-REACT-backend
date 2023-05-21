import express from "express";
import Order from "../models/orderModel.js";
import { isAdmin, isAuth } from "../utils.js";
import User from "../models/userModel.js";

const orderRouter = express.Router();

orderRouter.post("/", isAuth, async (req, res) => {
  const newOrder = new Order({
    orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
    shippingAddress: req.body.shippingAddress,
    paymentMethod: req.body.paymentMethod,
    itemsPrice: req.body.itemsPrice,
    shippingPrice: req.body.shippingPrice,
    taxPrice: req.body.taxPrice,
    totalPrice: req.body.totalPrice,
    user: req.user._id,
  });

  const order = await newOrder.save();
  res.status(201).send({ message: "New Order Created", order });
});

orderRouter.get("/my-orders", isAuth, async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.send(orders);
});

orderRouter.get("/:id", isAuth, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    res.send(order);
  } else {
    res.status(404).send({ message: "Order Not Found" });
  }
});

orderRouter.put("/:id/pay", isAuth, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };

    const updatedOrder = await order.save();
    res.send({ message: "Order Paid", order: updatedOrder });
  } else {
    res.status(404).send({ message: "Order Not Found" });
  }
});

orderRouter.get("/", isAuth, isAdmin, async (req, res) => {
  const orders = await Order.find().populate("user", "name");
  res.send(orders);
});

orderRouter.put('/:id/deliver', isAuth, isAdmin, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      await order.save();

      const user = await User.findById(order.user);
      res.send({ message: 'Order Delivered', data: user });
  } else {
      res.status(404).send({ message: 'Order Not Found' });
  }
}
);

orderRouter.delete('/:id', isAuth, isAdmin, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
      await order.deleteOne();
      res.send({ message: 'Order Deleted' });
  } else {
      res.status(404).send({ message: 'Order Not Found' });
  }
 }
);



export default orderRouter;
