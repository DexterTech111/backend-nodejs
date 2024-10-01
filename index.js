// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();
const multer = require('multer');
const fs = require('fs');

const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: '*', // Replace with your frontend's domain
    methods: 'GET,POST,PUT,DELETE,PATCH',
    credentials: true,}
));
app.use(express.json());

mongoose.connect('mongodb+srv://preshitech111:CIjL8FqW225m99Im@cluster-confluencedb.lycpcuc.mongodb.net/pwa_users', {
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
  vreg: String,
  makeAndModel: String,
  endDateAndTime: String,
  policyHolderName: String,
  startDateAndTime: String,
  isActive: { type: Boolean, default: true }, // Add the isActive field
});

const User = mongoose.model('User', userSchema);




app.post('/create-user', async (req, res) => {
  try {
    const generateRegNumber = () => {
      const randomNumbers = Math.floor(10000000 + Math.random() * 90000000).toString();
      return `TVC-MOT-${randomNumbers}`;
    };

    const user = new User({
      ...req.body,
      regNumber: generateRegNumber(),
    });

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
  const { pincode } = req.body;
  
  try {
    const user = await User.findOne({ pincode });
    
    if (user) {
      // Check if the user is active
      if (user.isActive) {
        return res.status(200).send(user); // Send user if isActive is true
      } else {
        return res.status(403).send({ message: 'User is not active' }); // User found but inactive
      }
    } else {
      return res.status(404).send({ message: 'Pin not found' }); // Pin not found
    }
  } catch (error) {
    return res.status(500).send({ message: 'Error checking pin' }); // Handle errors
  }
});



app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching users' });
  }
});



// New route to update user status
app.patch('/users/:id/status', async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body; // Get the new status from the request body

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isActive }, // Update the isActive field
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).send({ message: 'User not found' });
    }

    res.status(200).send({ message: 'User status updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).send({ message: 'Error updating user status' });
  }
});



// Configure multer for file storage
// Create the uploads directory if it doesn't exist
const dir = './uploads';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the directory for uploaded files
  },
  filename: (req, file, cb) => {
    // Save the file with a temporary unique filename
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// Upload endpoint
app.post('/upload-pdf', upload.single('file'), async (req, res) => {
  try {
    const pincode = req.body.pincode;
    if (!pincode) {
      return res.status(400).json({ message: 'Pincode is required' });
    }

    // Sanitize the pincode
    const sanitizedPincode = pincode.replace(/[^a-zA-Z0-9]/g, '_');

    // Get the file extension
    const ext = path.extname(req.file.originalname);

    // Set the new filename
    const newFilename = `${sanitizedPincode}${ext}`;

    // Construct old and new file paths
    const oldPath = req.file.path;
    const newPath = path.join(req.file.destination, newFilename);

    // Rename the file
    await fs.promises.rename(oldPath, newPath);

    // Update req.file with the new filename and path
    req.file.filename = newFilename;
    req.file.path = newPath;

    console.log('File uploaded and renamed:', req.file);

    res.status(200).json({
      message: 'File uploaded and renamed successfully',
      filePath: req.file.path,
    });
  } catch (error) {
    console.error('Error uploading and renaming file:', error);
    res.status(500).json({ message: 'Error uploading and renaming file' });
  }
});



app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Delete User Endpoint
app.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
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
