const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const {validateSignupData} = require('../utils/validate');
const User = require('../models/user');

router.post('/signup', async (req, res) => {

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

router.post('/login', async (req, res) => {
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

router.post('/logout', async (req, res) => {
  res.cookie('token', null, {expires: new Date()});
  res.status(200).json({message: "Logout successful"});
})

module.exports = router;