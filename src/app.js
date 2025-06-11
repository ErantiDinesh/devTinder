const express = require('express');
const connectDB = require('./config/database')
const app = express();
const User = require('./models/user');

app.use(express.json());

app.post('/signup', async (req, res) => {

  try {
      const user = new User(req.body);
      await user.save(); 
    res.status(201).json({message: "user created successfully", user}); 
  } catch (error) {
    console.log("error in signup", error);
    res.status(500).json({message: "Internal server error", error: error.message});
  }})


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
