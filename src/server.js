const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// const MongoClient = require("mongodb").MongoClient;

// .env
require("dotenv").config();
const PORT = process.env.PORT || 3000;
const DBURL = process.env.MONGO_URI;

// EXPRESS!
const app = express()
app.use(express.json());
app.use(cors());
// app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => console.log(`The server has started on port: ${PORT}`));

// Mongeese!
mongoose.connect(
  DBURL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (error) => {
    if (error) throw error;
    console.log("MongoDB connection established!");
  }
);

// ROUTES!

// user routes
// app.use("/users", require('./routes/userRouter'));
// app.use("/msUsers", require('./routes/msUserRouter'));
app.use("/cell", require('./routes/cellRouter'));

// !!! OLD CODE
/*app.get('/', (req, res) => {
  return res.send('Received a GET HTTP method')
})
 
app.post('/', (req, res) => {
  return res.send('Received a POST HTTP method')
})
 
app.put('/', (req, res) => {
  return res.send('Received a PUT HTTP method')
})
 
app.delete('/', (req, res) => {
  return res.send('Received a DELETE HTTP method')
})

//- /USERS routes -/////////////////////////////////
//- /USERS/LOGIN -//////////////////////////////////
app.post('/users/login', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*')
  const user = req.body
  return res.send("User logged in: " + user.username)
})
 
app.listen(process.env.PORT, () =>
  console.log(`Example app listening on port ${process.env.PORT}!`),
)*/