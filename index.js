const express = require("express");
const cors = require("cors");
const app = express();

let user = [];

// MidleWare
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3001",
  })
);

app.get("/", (req, res) => {
  res.json({ message: "Success" });
});

app.post("/user", (req, res) => {
  req.body.id = user.length + 1;
  user.push(req.body);
  res.json({ message: "User Created Successfully" });
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
