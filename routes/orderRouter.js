import express from "express";
import { createOrder, getOrders } from "../controllers/orderController.js";
import e from "express";

const orderRouter = express.Router();

orderRouter.post("/", createOrder);
orderRouter.get("/", getOrders);

export default orderRouter;
