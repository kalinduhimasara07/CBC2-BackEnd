import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export function createUser(req, res) {
  if (req.body.role == "admin") {
    if (req.user != null) {
      if (req.user.role != "admin") {
        res
          .status(403)
          .json({ error: "you are not authorized to create admin account" });
        return;
      }
    } else {
      res.status(403).json({
        error:
          "you are not authorized to create admin account.Please logging first",
      });
      return;
    }
  }

  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: hashedPassword,
    role: req.body.role,
  });
  user
    .save()
    .then(() => {
      res.json({ message: "User saved successfully" });
    })
    .catch((error) => {
      console.error("Error saving user:", error);
      res.status(500).json({ error: "Error saving user" });
    });
}

export function loginUser(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email }).then((user) => {
    console.log(user);
    if (!user) {
      res.json({ error: "User not found" });
    } else {
      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (isPasswordValid) {
        const token = jwt.sign(
          {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            img: user.img,
          },
          process.env.SECRET
        );
        console.log(token);
        res.json({
          message: "Login successful",
          token: token,
          user: {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            img: user.img,
          },
        });
      } else {
        res.json({ error: "Invalid credentials", message: "Login failed" });
      }
    }
  });
}

export function isAdmin(req, res) {
  if (req.user == null) {
    return false;
  }
  if (req.user.role != "admin") {
    return false;
  }
  return true;
}

export function isCustomer(req, res) {
  if (req.user == null) {
    return false;
  }
  if (req.user.role != "customer") {
    return false;
  }
  return true;
}
