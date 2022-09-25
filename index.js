import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();
import mongodb from "mongodb";
import { MongoClient } from "mongodb";
const URL = process.env.DB;
// let user = [];

const app = express();
// MidleWare
app.use(express.json());
app.use(cors());

const createConnection = async () => {
  const client = new MongoClient(URL);
  await client.connect();
  console.log("MongoDB connected");
  return client;
};
const client = await createConnection();

let authenticate = (req, res, next) => {
  try {
    if (req.headers.authorization) {
      let decode = jwt.verify(req.headers.authorization, process.env.SECRET);
      if (decode) {
        next();
      } else {
        res.status(401).json({ message: "Unauthorized" });
      }
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (err) {
    console.log(err);
  }
};

app.get("/", (req, res) => {
  res.json({ message: "Success" });
});

// create
app.post("/user", async (req, res) => {
  try {
    // step1: create a Connection between Nodejs and MongoDB
    // step2:Select the DB
    // step3:Select the collection
    // step4:Do the operation (create,update,Read,Delete)
    let response = await client
      .db("shopDB")
      .collection("users")
      .insertOne(req.body);
    // step5:Close the connection
    // await client.close();
    if (response.acknowledged) {
      res.status(200).json({ message: "Data inserted" });
    } else {
      throw new Error("Something went wrong");
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
  // req.body.id = user.length + 1;
  // user.push(req.body);
  // res.json({ message: "User Created Successfully" });
});

app.get("/users", authenticate, async (req, res) => {
  // let qparms = req.query;

  // if (qparms.limit === undefined) {
  //   res.json(user);
  // } else {
  //   let resUser = [];
  //   for (
  //     let i = parseInt(qparms.offset);
  //     i < parseInt(qparms.offset) + parseInt(qparms.limit);
  //     i++
  //   ) {
  //     resUser.push(user[i]);
  //   }
  // }
  try {
    let resUser = await client
      .db("shopDB")
      .collection("users")
      .find()
      .toArray();
    res.json(resUser);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

// getting the particular Element
app.get("/user/:id", authenticate, async (req, res) => {
  //   let userId = req.params.id;
  //   let u = user.find((item) => item.id == userId);
  //   if (u) {
  //     res.json(u);
  //   } else {
  //     res.json({ message: "User not found" });
  //   }
  // });
  try {
    let User = await client
      .db("shopDB")
      .collection("users")
      .findOne({ _id: mongodb.ObjectId(req.params.id) });
    res.json(User);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Update
app.put("/user/:id", authenticate, async (req, res) => {
  // let userId = req.params.id;
  // let u = user.findIndex((item) => item.id == userId);
  // if (u !== -1) {
  //   Object.keys(req.body).forEach((el) => {
  //     user[u][el] = req.body[el];
  //   });
  //   res.json({ message: "Done" });
  // } else {
  //   res.json({ message: "User not found" });
  // }
  try {
    let User = await client
      .db("shopDB")
      .collection("users")
      .findOneAndUpdate(
        { _id: mongodb.ObjectId(req.params.id) },
        { $set: req.body }
      );
    res.json(User);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Delete
app.delete("/user/:id", authenticate, async (req, res) => {
  // let userId = req.params.id;
  // let u = user.findIndex((item) => item.id == userId);

  // if (u !== -1) {
  //   user.splice(u, 1);
  //   res.json({ message: "user Deleted" });
  // } else {
  //   res.json({ message: "User not found" });
  // }
  try {
    let User = await client
      .db("shopDB")
      .collection("users")
      .findOneAndDelete({ _id: mongodb.ObjectId(req.params.id) });
    res.json(User);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

//register
app.post("/register", async (req, res) => {
  try {
    let user = client.db("shopDB").collection("Registration");
    let salt = await bcrypt.genSalt(10);
    let hash = await bcrypt.hash(req.body.password, salt);
    req.body.password = hash;
    let final = await user.insertOne(req.body);
    res.json({ message: "User successfully registered" });
  } catch (err) {
    console.log(err);
    res.json(err);
  }
});

//login
app.post("/login", async (req, res) => {
  try {
    //getting the data from the db for the sent email
    let user = await client
      .db("shopDB")
      .collection("Registration")
      .findOne({ email: req.body.email });
    console.log(user);
    // Login logic
    if (user) {
      let compare = await bcrypt.compare(req.body.password, user.password);
      if (compare) {
        let token = jwt.sign({ _id: user._id }, process.env.SECRET, {
          expiresIn: "20m",
        });
        res.json({ token });
        // res.json({ message: "logged in successfully" });
      } else {
        res.json({ message: "password is wrong" });
      }
    } else {
      res.status(401).json({ message: "user email not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.get("/login", (req, res) => {
  res.send("hi");
});

app.listen(process.env.PORT || 8000, () => {
  console.log("server listening on port 8000");
});
