const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const port = 8000;
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1/cart", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});
const User = mongoose.model("User", UserSchema);

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    default: 1,
  },
});
const Product = mongoose.model("Product", ProductSchema);

const cartSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});
const Cart = mongoose.model("Cart", cartSchema);

const OrderSchema = new mongoose.Schema({
  product: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      quantity: {
        type: Number,
      },
    },
  ],

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});
const Order = mongoose.model("Order", OrderSchema);
// Configure middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/user", (req, res) => {
  try {
    const user = new User(req.body);
    user
      .save()
      .then((res) => {
        res.send(user);
      })
      .catch((err) => {
        res.send(err);
      });
  } catch (error) {
    res.send(error);
  }
});
app.post("/product", (req, res) => {
  try {
    const product = new Product(req.body);
    product
      .save()
      .then((res) => {
        res.send("product is created successfully");
      })
      .catch((err) => {
        res.send(err);
      });
  } catch (error) {}
});
app.get("/products", async (req, res) => {
  try {
    const data = await Product.find({});
    if (data.length > 0) {
      res.status(200).json(data);
    } else {
      res.status(500).json({ status: 500, msg: "not found" });
    }
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});
app.post("/cart", (req, res) => {
  const { product, quantity, userId } = req.body;

  // Create a new cart item
  try {
    const newCartItem = new Cart({
      product,
      quantity,
      userId,
    });

    // Save the cart item to the database
    newCartItem.save();
    res.send("Cart created successfully");
  } catch (error) {
    console.log(error);
  }
});
app.get("/cart/:userId", async (req, res) => {
  try {
    const cartitems = await Cart.find({ userId: req.params.userId })
      .populate("product")
      .populate("userId");
    if (cartitems.length > 0) {
      res.send(cartitems);
      // console.log(cartitems);
    } else {
      res.send("Orders not found");
    }
  } catch (error) {
    res.send(error);
  }
});
app.put("/cart/:productId/increase", (req, res) => {
  const productId = req.params.productId;
  try {
    Cart.findOneAndUpdate(
      { _id: productId },
      { $inc: { quantity: 1 } },
      { new: true }
    )
      .then(() => {
        res.send("Quantity increased successfully");
      })
      .catch((err) => {
        res.send(err);
      });
  } catch (error) {
    res.send(error);
  }
});
app.put("/cart/:productId/decrease", (req, res) => {
  const productId = req.params.productId;

  try {
    Cart.findOneAndUpdate(
      { _id: productId, quantity: { $gt: 1 } },
      { $inc: { quantity: -1 } },
      { new: true }
    )
      .then(() => {
        res.send("Quantity decreased successfully");
      })
      .catch((err) => {
        res.send(err);
      });
  } catch (error) {}
});
app.delete("/cart/:productId/delete", async (req, res) => {
  try {
    await Cart.findOneAndDelete(req.params.productId)
      .then((res) => {
        res.send("Cart deleted successfully");
      })
      .catch((err) => {
        res.send(err);
      });
  } catch (error) {
    res.send(error);
  }
});
app.post("/order", (req, res) => {
  // console.log(req.body)
  try {
    const order = new Order(req.body);
    order
      .save()
      .then((res) => {
        res.send("Order created successfully");
      })
      .catch((err) => {
        res.send(err);
      });
  } catch (error) {
    res.send(error);
  }
});
app.get("/orders/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .populate("product.product")
      .populate("userId");
    if (orders.length > 0) {
      res.send(orders);
      // console.log(orders);
    } else {
      res.send("Orders not found");
    }
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});
// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
