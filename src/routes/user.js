const express = require('express');
const router = express.Router();
const connectionRequest = require('../models/connectionRequests');
const User = require('../models/user');
const user = require('../models/user');

router.get('/user/requests', async (req, res) => {
    try {
        const user = req.user;

        const connectionRequests = await connectionRequest.find({
            toUserId: user._id,
            status: 'intrested'
        }).populate('fromUserId', ['firstName', 'lastName', 'photoUrl', 'about', 'skills']);

        return res.status(200).json({ connectionRequests });

    } catch (error) {
        console.log("Error in fetching user requests", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
});

router.get('/user/connections', async (req, res) => {
    try {
        const user = req.user;
        const connections = await connectionRequest.find({
            $or: [
                {fromUserId: user._id, status: 'accepted'},
                {toUserId: user._id, status: 'accepted'}
            ]
        })
        .populate('fromUserId', ['firstName', 'lastName', 'photoUrl', 'about', 'skills'])
        .populate('toUserId', ['firstName', 'lastName', 'photoUrl', 'about', 'skills']);
        const userConnections = connections.map(connection => {
            if (connection.fromUserId._id.toString() === user._id.toString()) {
                return {
                    ...connection.toUserId._doc,
                    connectionId: connection._id
                };
            } else {
                return {
                    ...connection.fromUserId._doc,
                    connectionId: connection._id
                };
            }
        });
        res.status(200).json({ userConnections });

    } catch (error) {
        console.log("Error in fetching user connections", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
        
    }
});

router.get('/user/feed', async (req, res) => {
    try {
        const user = req.user;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        limit = limit > 50 ? 50 : limit;

        const userConnections = await connectionRequest.find({
            $or: [
                {fromUserId: user._id},
                {toUserId: user._id}
            ]
        });

        const hideUsersFeed = new Set();
        hideUsersFeed.add(user._id.toString());
        userConnections.forEach(connection => {
            hideUsersFeed.add(connection.fromUserId.toString());
            hideUsersFeed.add(connection.toUserId.toString());
        });

        const userFeed = await User.find({
           _id: { $nin: Array.from(hideUsersFeed) }
    }).select(['firstName', 'lastName', 'photoUrl', 'about', 'skills']).skip(skip).limit(limit);

        res.status(200).json({ userFeed,  pagination: {
        page,
        limit,
        totalFetched: userFeed.length
    } }); 
        
    } catch (error) {
        console.log("Error in fetching user feed", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
        
    }
})

module.exports = router;
