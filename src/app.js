const express = require('express');
const connectDB = require('./config/database')
const app = express();
const User = require('./models/user');
const {validateSignupData} = require('./utils/validate')
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const {userAuth} = require('./middlewares/auth');

app.use(express.json());
app.use(cookieParser());

app.post('/signup', async (req, res) => {

  try {
    validateSignupData(req.body);
    const {firstName, lastName, emailId, password} = req.body;

    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        firstName,
        lastName,
        emailId,
        password: hashedPassword,
      });
      await user.save(); 
    res.status(201).json({message: "user created successfully", user}); 
  } catch (error) {
    console.log("error in signup", error);
    res.status(500).json({message: "Internal server error", error: error.message});
  }})

app.post('/login', async (req, res) => {
    try {
        const {emailId, password} = req.body;
        if (!emailId || !password) {
            return res.status(400).json({message: "Email and password are required"});
        }
        const user = await User.findOne({emailId});
        if (!user) {
            return res.status(404).json({message: "Invalid credentials"});
        }
        const isPAsswordMAtch = await user.validatePassword(password);

        if (isPAsswordMAtch) {
            const token = user.getJWT();
            res.cookie('token', token);
        }


        if (!isPAsswordMAtch) {
            return res.status(401).json({message: "Invalid credentials"});
        }
        res.status(200).json({message: "Login successful", user});
    } catch (error) {
        console.log("error in login", error);
        res.status(500).json({message: "Internal server error", error: error.message});
        
    }
})  

app.get('/profile', userAuth, async (req, res) => {
    try {
       const user = req.user;
        res.status(200).json({message: "Profile fetched successfully", user});
        } catch (error) {
        console.log("error in fetching profile", error);
        res.status(500).json({message: "Internal server error", error: error.message});
        
    }
})

app.get('/user', async (req, res) => {
    try {
       const user = await User.findOne({emailId: req.emailId});
       if (user?.length === 0) {
        return res.status(404).json({message: "User not found"});
       }

       res.status(200).json({message: "User found", user});
    } catch (error) {
        console.log("error in fetching user", error);
        res.status(500).json({message: "Internal server error", error: error.message});
    }
})

app.get('/feed', async (req, res) => {
    try {
        const users = await User.find({});
        if (users.length === 0) {
            return res.status(404).json({message: "No users found"});
        }
        res.status(200).json({message: "Users found", users});
    } catch (error) {
        console.log("error in fetching users", error);
        res.status(500).json({message: "Internal server error", error: error.message});
    }
})

app.patch('/user/:userId', async (req, res) => {
    try {
        const data = req.body.data;
        const userId = req.params?.userId;

        const allowUpdates = ["firstName", "lastName", "age", "gender", "photoUrl", "about", "skills"];
        const isUpdatedAllowed = Object.keys(data).every((key) => allowUpdates.includes(key));

        if (!isUpdatedAllowed) {
            return res.status(400).json({message: "Invalid update fields"});
        }

        if (data?.skills.length > 10) {
            return res.status(400).json({message: "Skills cannot exceed 10 items"});
        }

        const updatedData = await User.findByIdAndUpdate(userId, data, {runValidators:true, new: true});
        if (!updatedData) {
            return res.status(404).json({message: "User not found"});
        }   
        res.status(200).json({message: "User updated successfully", user: updatedData});
    } catch (error) {
        console.log("error in updating user", error);
        res.status(500).json({message: "Internal server error", error: error.message});
        
    }
})

app.delete('/user', async (req, res) => {
    try {
        const {userId} = req.body;
        const deleteUser = await User.findByIdAndDelete(userId);
        if (!deleteUser) {
            return res.status(404).json({message: "User not found"});
        }   
        res.status(200).json({message: "User deleted successfully", user: deleteUser});
    } catch (error) {
        console.log("error in deleting user", error);
        res.status(500).json({message: "Internal server error", error: error.message});      
    }
    })

connectDB()
.then(() => {
    console.log("MongoDB connected successfully");
    app.listen(7777, () => {
    console.log("Server running at port 7777");
}); })
.catch((err) => {
    console.error("MongoDB connection failed:", err);
});
