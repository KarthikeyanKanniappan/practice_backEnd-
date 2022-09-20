import express from "express";
import cors from "cors";
const app = express();
import { MongoClient } from "mongodb";
const URL =
  "mongodb+srv://kartii:admin123@cluster0.ztfs0cy.mongodb.net/shopDB?retryWrites=true&w=majority";
let user = [];

// MidleWare
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3001",
  })
);

const createConnection = async () => {
  const client = new MongoClient(URL);
  await client.connect();
  console.log("MongoDB connected");
  return client;
};
const client = await createConnection();

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

app.get("/users", (req, res) => {
  let qparms = req.query;

  if (qparms.limit === undefined) {
    res.json(user);
  } else {
    let resUser = [];
    for (
      let i = parseInt(qparms.offset);
      i < parseInt(qparms.offset) + parseInt(qparms.limit);
      i++
    ) {
      resUser.push(user[i]);
    }
    res.json(resUser);
  }
});

// getting the particular Element
app.get("/user/:id", (req, res) => {
  let userId = req.params.id;
  let u = user.find((item) => item.id == userId);
  if (u) {
    res.json(u);
  } else {
    res.json({ message: "User not found" });
  }
});

// Update
app.put("/user/:id", (req, res) => {
  let userId = req.params.id;
  let u = user.findIndex((item) => item.id == userId);
  if (u !== -1) {
    Object.keys(req.body).forEach((el) => {
      user[u][el] = req.body[el];
    });
    res.json({ message: "Done" });
  } else {
    res.json({ message: "User not found" });
  }
});

// Delete
app.delete("/user/:id", (req, res) => {
  let userId = req.params.id;
  let u = user.findIndex((item) => item.id == userId);

  if (u !== -1) {
    user.splice(u, 1);
    res.json({ message: "user Deleted" });
  } else {
    res.json({ message: "User not found" });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("server listening on port 3000");
});