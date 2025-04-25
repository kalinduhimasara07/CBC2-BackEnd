import { name } from "nodeman/lib/mustache.js";
import Order from "../models/order.js";
import Product from "../models/product.js";
import { isCustomer } from "./userController.js";

export async function createOrder(req, res) {
  if (!isCustomer(req, res)) {
    res
      .status(403)
      .json({ error: "you are not authorized to create an order" });
    return;
  }
  try {
    //take the latest order id
    const latestOrder = await Order.find().sort({ date: -1 }).limit(1);
    let orderId;
    if (latestOrder.length == 0) {
      orderId = "CBC0001";
    } else {
      const currentOrderId = latestOrder[0].orderId;
      const Number = currentOrderId.replace("CBC", "");
      const newNumber = parseInt(Number) + 1;
      orderId = "CBC" + newNumber.toString().padStart(4, "0");
    }

    const newOrderData = req.body;

    const newProductArray = [];
    for (let i = 0; i < newOrderData.orderedItems.length; i++) {
      const product = await Product.findOne({
        productId: newOrderData.orderedItems[i].productId,
      });
      if (product == null) {
        res.status(404).json({
          error:
            "Product with id " +
            newOrderData.orderedItems[i].productId +
            " not found",
        });
        return;
      }

      newProductArray[i] = {
        productId: product.productId,
        name: product.ProductName,
        price: product.lastPrice,
        quantity: newOrderData.orderedItems[i].quantity,
        image: product.images[0],
      };
    }

    console.log(newProductArray);

    newOrderData.orderedItems = newProductArray;

    // {
    //   "productId" : "CBC0001",
    //   "name": "BotaniClean Face Wash",
    //   "price": 20,
    //   "quantity": 2,
    //   "image": "https://example.com/images/face-wash.jpg"
    // }

    newOrderData.orderId = orderId;
    newOrderData.email = req.user.email;

    const order = new Order(newOrderData);
    await order.save();
    res.json({ message: "Order created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error creating order" });
  }
}

export async function getOrders(req, res) {
  try {
    const orders = await Order.find();
    res.json(orders);
    console.log(orders);
  } catch (error) {
    res.status(500).json({ error: "Error fetching orders" });
  }
}
