import Product from "../models/product.js";
import { isAdmin } from "./userController.js";

// export async function getProducts(req, res) {
//   try {
//     if (isAdmin(req, res)) {
//       const products = await Product.find();
//       res.json(products);
//     } else {
//       const products = await Product.find({ isAvailable: true });
//       res.json(products);
//     }
//   } catch (error) {
//     console.error("Error fetching products:", error);
//     res.status(500).json({ error: "Error fetching products" });
//   }
// }

export function getProducts(req, res) {
  Product.find({}).then((products) => {
    res.json(products);
  });
}

export function createProduct(req, res) {
  if (!isAdmin(req, res)) {
    res.status(403).json({ error: "you are not authorized to add a product" });
    return;
  }
  const product = new Product(req.body);
  product
    .save()
    .then(() => {
      console.log("Product saved successfully");
      res.json({ message: "Product saved successfully" });
    })
    .catch((error) => {
      console.error("Error saving product:", error);
      res.status(500).json({ message: "Error saving product", error: error });
    });
}

export async function deleteProduct(req, res) {
  if (!isAdmin(req, res)) {
    res
      .status(403)
      .json({ error: "you are not authorized to delete a product" });
    return;
  }
  try {
    await Product.deleteOne({ productId: req.params.productId });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Error deleting product" });
  }
}

export async function updateProduct(req, res) {
  if (!isAdmin(req, res)) {
    res
      .status(403)
      .json({ error: "you are not authorized to update a product" });
    return;
  }
  try {
    const updatedProduct = await Product.findOneAndUpdate(
      // UpdateOne you can use to update a single document
      { productId: req.params.productId },
      req.body,
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Error updating product" });
  }
}

export async function getProductById(req, res) {
  try {
    const product = await Product.findOne({
      productId: req.params.productId,
    });
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Error fetching product" });
  }
}
