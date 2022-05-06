const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();

const app = express();

//middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xeou1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const collection = client.db("bike-warehouse").collection("inventories");
    const userCollection = client.db("bike-warehouse").collection("useritem");

    app.get("/inventory", async (req, res) => {
      const query = {};
      const cursor = collection.find(query);
      const inventories = await cursor.toArray();
      res.send(inventories);
    });

    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const inventory = await collection.findOne(query);
      res.send(inventory);
    });

    app.post("/inventory", async (req, res) => {
      const newProduct = req.body;
      const result = await collection.insertOne(newProduct);
      res.send(result);
    });

    app.delete("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await collection.deleteOne(query);
      res.send(result);
    });
    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const object = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          quantity: object.decrease,
        },
      };
      const result = await collection.updateOne(filter, updateDoc, options);
      res.send(result);
    });


    app.post("/useritem", async (req, res) => {
      const userItem = req.body;
      const result = await userCollection.insertOne(userItem);
      res.send(result);
    });

  } finally {
    //  await client.close();
  }
}

run().catch(console.dir);

// client.connect((err) => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   //   client.close();
//   console.log("connected to db");
// });

app.get("/", (req, res) => {
  res.send("running warehouse server ");
});

app.listen(port, () => {
  console.log("listening to port", port);
});
