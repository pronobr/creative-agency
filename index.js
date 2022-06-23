const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt  = require('jsonwebtoken')
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());


// Z12C2nDVlGjPMjMo
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9mdct.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'UnAuthorized access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' })
    }
    req.decoded = decoded;
    next();
  });
}

async function run(){
try{
await client.connect()

const serviceCollection =client.db('creative').collection('services')
const bookingCollection =client.db('creative').collection('booking')
const userCollection =client.db('creative').collection('user')
const reviewCollection =client.db('creative').collection('review')
app.post('/booking',async(req,res) =>{
  const booking =req.body;
  // const decodedEmail = req.decoded.email;
  // if(decodedEmail ==='pronobroy3601@gmail.com'){
    console.log(booking)
    const exits =await bookingCollection.findOne(booking)
    if(exits){
      return res.send({success:false})
    }
    
      const result =await bookingCollection.insertOne(booking)
      res.send(result)
  // }
  // else {
    // return res.status(403).send({ message: 'forbidden access' });
  // }
  
})

app.post('/review',async(req,res) =>{
  const review =req.body;
  const reviewing =await reviewCollection.insertOne(review)
  res.send(reviewing)
})
app.put('/user/admin/:email',verifyJWT, async(req,res) =>{
  const email =req.params.email
const requster =req.decoded.email;
console.log(requster)
const requsterAecount =await userCollection.findOne({email:requster})
if(requsterAecount.role == 'admin'){
  const filter = { email: email };

  const updateDoc = {
    $set: {role:'admin'},
  };
  const result = await userCollection.updateOne(filter, updateDoc);
  const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      res.send({ result, token });
}
else{
  return res.status(403).send({ message: 'forbidden access' });
}
  
})

app.get('/admin/:email', async (req, res) => {
  const email = req.params.email;
  console.log(email)
  const user = await userCollection.findOne({ email: email });
  const isAdmin = user.role === 'admin';
  res.send({ admin: isAdmin })
})


app.put('/user/:email', async(req,res) =>{
  const email =req.params.email;
  const user = req.body;
   const filter = { email: email };
   const options = { upsert: true };
   const updateDoc = {
     $set: user,
   };
   const result = await userCollection.updateOne(filter, updateDoc, options);
   const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
   res.send({result, token})
})


// app.get('/user/:email',verifyJWT, async(req,res) =>{
//   const email =req.params.email
//   const user = req.body;
//   const filter = { email: email };
//   const options = { upsert: true };
//   const updateDoc = {
//     $set: user,
//   };
//   const result = await userCollection.updateOne(filter, updateDoc, options);
//   const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
//       res.send({ result, token });
// })


app.get('/booking/:email',verifyJWT ,async(req,res) =>{
  const email =req.params.email
  // const query ={email:email}
  const decodedEmail =req.decoded.email;
  // console.log(email,decodedEmail)
  if(email === decodedEmail){
    const query = { email: email };
    console.log(query)
      const bookings = await bookingCollection.find(query).toArray();
      return res.send(bookings);
  }

else{
  return res.status(403).send({ message: 'forbidden access' });
}
  })

app.get('/user',verifyJWT,async(req,res) =>{
  const users =await userCollection.find().toArray()
  res.send(users)
})

app.get('/review',async(req,res) =>{
const review = await reviewCollection.find().toArray()
res.send(review)
})

  }


finally{

}
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Hello From Doctor Uncle!')
  })
  
  app.listen(port, () => {
    console.log(`Doctors App listening on port ${port}`)
  })