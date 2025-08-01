const express = require('express');
const router = express.Router();
const connectionRequest = require('../models/connectionRequests');
const User = require('../models/user');

router.post ('/request/send/:status/:toUserId', async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        if (!fromUserId || !toUserId || !status) {
            return res.status(400).json({message: "fromUserId, toUserId and status are required"});
        }

        const allowesStatus = ['ignore', 'intrested'];

        if (!allowesStatus.includes(status)) {
            return res.status(400).json({message: `Invalid status type ${status}`});
        }

        const isToUserFound = await User.findById(toUserId);
        if (!isToUserFound) {
            return res.status(404).json({message: "To User not found"});
        }

        const existingConnectionRequest = await connectionRequest.findOne({
            $or: [
                {fromUserId, toUserId},
                {fromUserId: toUserId, touserId: fromUserId}
            ]
        });

        if (existingConnectionRequest) {
            return res.status(400).json({message: "Connection request already exists between these users"});
        }

        const connectionRequests = new connectionRequest({
            fromUserId,
            toUserId,
            status
        })
        const data = await connectionRequests.save();
        res.status(201).json({message: `${req.user.firstName} has ${status}  ${isToUserFound.firstName}`, data});

    } catch (error) {
        console.log("error in sending request", error);
        res.status(500).json({message: "Internal server error", error: error.message});
        
    }
})

router.post('/request/review/:status/:requestId', async (req, res) => {
    try {
        const user = req.user;
        const {requestId, status} = req.params;

        if (!requestId || !status) {
            return res.status(400).json({message: "requestId and status are required"});
        }

        const allowedStatus = ['accepted', 'rejected'];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({message: `Invalid status type ${status}`});
        }

        const connectionRequestData = await connectionRequest.findOne({
            fromUserId: requestId,
            toUserId: user._id,
            status: 'intrested'
        });

        if (!connectionRequestData) {
            return res.status(404).json({message: "Connection request not found or already reviewed"});
        }

        connectionRequestData.status = status;
        const data = await connectionRequestData.save();

        res.status(200).json({message: `You have ${status} the request from ${connectionRequestData.fromUserId}`, data});

    } catch (error) {
        console.log("error in reviewing request", error);
        res.status(500).json({message: "Internal server error", error: error.message});
        
    }
})

module.exports = router;