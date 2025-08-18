const express = require("express");
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;


// middleware 
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.5eg9x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const menuCollection = client.db('American_restoreant').collection('menu');
    const cartCollection = client.db('American_restoreant').collection('carts');
    const userCollection = client.db('American_restoreant').collection('users');

    // user data load 
    app.get('/users', async (req, res) =>{
      const result = await userCollection.find().toArray();
      res.send(result);
    })

    // All users data 
    app.post('/users', async (req, res) =>{
      const user = req.body;
      // Existing user data not send again database 
      const query = {email: user.email}
      const existingUser = await userCollection.findOne(query);
      if(existingUser){
        return res.send({message: 'User already exists', insertedId: null})
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    })

    app.get('/menu', async(req, res) =>{
        const result= await menuCollection.find().toArray();
        res.send(result);
    })

    // Add to cart

    app.post('/carts', async (req, res)=>{
      const cartItem = req.body;
      const result = await cartCollection.insertOne(cartItem);
      res.send(result);
    })


    // Add to cart data ui show 
    app.get('/carts', async (req, res) =>{
      const email = req.query.email;
      const query = {email: email};
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    })


    // Item delete 
    app.delete('/carts/:id', async (req, res) =>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) =>{
    res.send('American rastorent');
})

app.listen(port, () =>{
    console.log(`American Res server is runing ${port}`);
})