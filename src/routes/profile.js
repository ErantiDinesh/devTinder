const express = require('express');
const router = express.Router();
const {userAuth} = require('../middlewares/auth');   
const User = require('../models/user');
const {validateEditProfileData} = require('../utils/validate');



router.get('/profile/view', async (req, res) => {
    try {
       const user = req.user;
        res.status(200).json({message: "Profile fetched successfully", user});
        } catch (error) {
        console.log("error in fetching profile", error);
        res.status(500).json({message: "Internal server error", error: error.message});
        
    }
})

router.patch('/profile/edit', async (req, res) => {
    try {
        const data = req.body.data;
        validateEditProfileData(data);

        const updatedData = await User.findByIdAndUpdate(req.user._id, data, {runValidators:true, new: true});
        
        if (!updatedData) {
            return res.status(404).json({message: "User not found"});   
        }   
        res.status(200).json({message: "User updated successfully", user: updatedData});
    } catch (error) {
        console.log("error in updating user", error);
        res.status(500).json({message: "Internal server error", error: error.message});
        
    }
})

module.exports = router;