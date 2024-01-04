
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://b022210217:Meg04fEK7vmuXK0h@class0.qzwsbgr.mongodb.net/?retryWrites=true&w=majority";

const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const bcrypt = require('bcrypt');

app.use(express.json())
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
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.post('/record', (req, res) => {
})

app.post('/login', (req, res) => {
})

app.post('/Create User/Students', (req, res) => {
  client.db("Assignment").collection("Users").insertOne({
    "username": req.body.username,
    "password": req.body.password,
    "student_id": req.body.student_id,
    "email": req.body.email,
    "role": "Student",
    "phone": req.body.phone,
    "PA": req.body.PA, //Pensyarah Akademik
  })
})

app.post('/Create User/Staff', (req, res) => {
  client.db("Assignment").collection("Users").insertOne({
    "username": req.body.username,
    "password": req.body.password,
    "staff_id": req.body.staff_id,
    "phone": req.body.phone,
    "role": "Staff",
})

app.post('/Create User/Admin', (req, res) => {
  "username": req.body.username,
  "password": req.body.password,
  "phone": req.body.phone,
  "role": "Admin",
})

app.delete('/', (req, res) => {
})

app.get('/student', (req, res) => {
})

app.get('/attendance-details', (req, res) => {
})

app.get('/report', (req, res) => {
})

app.get('/logout', (req, res) => {  
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})