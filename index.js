import express from 'express'
import 'dotenv/config'
import { MongoClient, ObjectId } from 'mongodb';
import cors from "cors";


const app = express()
const PORT = 8000

app.use(cors());
app.use(express.json());
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGODB_URI);

export async function connectToMongoDB() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    console.log("You successfully connected to mongoDB");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const mongoClient = await connectToMongoDB()
const db = mongoClient.db("booknook")

const bookCollection = db.collection('books')
 
app.post('/books/add',async(req,res) => {
  const data = req.body

  const result = await bookCollection.insertOne(data)
   console.log(result);
   res.send(result)
})

app.get('/books',async(req,res) => {
  const result = await bookCollection.find({}).toArray()
  res.send(result)
})

app.get('/book/:id',async(req,res) => {
    const {id} = req.params
   const result = await bookCollection.findOne({
    _id: new ObjectId(id)
   })

    res.send(result)
})

app.patch('/book/:id',async(req,res)=>{
  const {id} = req.params
  const updataData = req.body
  console.log(updataData);
  const result = await bookCollection.updateOne(
      { _id: new ObjectId(id)},
      { $set: updataData}
  )
  res.json(result)
})


app.delete("/book/:id",async(req,res) => {
  const {id} = req.params
  const result = await bookCollection.deleteOne({
    _id: new ObjectId(id),
  })
  res.json(result)
})




// http://localhost:8000/book/:id
app.get('/',(req,res)=>{
    res.send({messege:'server is running fine'})
})

app.listen(PORT,()=>{
    console.log(`server is running at ${PORT}`);
})