// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: '*', // Replace with your frontend's domain
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,}
));
app.use(express.json());

mongoose.connect('mongodb+srv://preshitech111:CIjL8FqW225m99Im@cluster-confluencedb.lycpcuc.mongodb.net/users', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  pincode: String,
  phoneNumber: String,
  email: String,
  fullName: String,
  dateOfBirth: String,
  occupation: String,
  address: String,
  licenseNumber: String,
  licenseHeldFor: String,
  regNumber: String,
  makeAndModel: String,
  endDateAndTime: String,
  policyHolderName: String,
  startDateAndTime: String
});

const User = mongoose.model('User', userSchema);




app.post('/create-user', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).send({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).send({ message: 'Error creating user' });
  }
});

app.post('/admin-login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === '12345') {
    res.send({ token: 'admin-token' });
  } else {
    res.status(401).send({ message: 'Invalid credentials' });
  }
});

app.post('/check-pin', async (req, res) => {
  //  console.log("user");
  const { pincode } = req.body;
  //console.log(pincode);
  const user = await User.findOne({ pincode });
  if (user) {
   // console.log(user);
    res.status(200).send(user);
  } else {
    res.status(404).send({ message: 'Pin not found' });
  }
});


////
////

// Serve static files from the "client/dist" directory
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all handler to serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

////
////

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
