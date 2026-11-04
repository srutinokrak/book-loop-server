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
const borrowCollection = db.collection('borrows')

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


app.post('/borrows', async (req, res) => {
  const { bookId, bookTitle, bookImage, userEmail, borrowDate, returnDate } = req.body

 
  const existing = await borrowCollection.findOne({ bookId, userEmail })
  if (existing) {
    return res.status(409).send({ message: "You have already borrowed this book." })
  }


  const updated = await bookCollection.findOneAndUpdate(
    { _id: new ObjectId(bookId), availableCopies: { $gt: 0 } },
    { $inc: { availableCopies: -1 } },
    { returnDocument: "after" }
  )
  if (!updated) {
    return res.status(409).send({ message: "No copies available." })
  }

  const result = await borrowCollection.insertOne({ bookId, bookTitle, bookImage, userEmail, borrowDate, returnDate })
  res.status(201).send(result)
})
app.get('/borrows', async (req, res) => {
  const result = await borrowCollection.find({ userEmail: req.query.email }).toArray()
  res.send(result)
})




// http://localhost:8000/book/:id



app.delete('/borrows/:id', async (req, res) => {
  const borrow = await borrowCollection.findOne({ _id: new ObjectId(req.params.id) })
  if (!borrow) return res.status(404).send({ message: "Borrow not found." })

 
  await bookCollection.updateOne(
    { _id: new ObjectId(borrow.bookId) },
    { $inc: { availableCopies: 1 } }
  )

  const result = await borrowCollection.deleteOne({ _id: new ObjectId(req.params.id) })
  res.json(result)
})

app.get('/',(req,res)=>{
    res.send({messege:'server is running fine'})
})

app.listen(PORT,()=>{
    console.log(`server is running at ${PORT}`);
})