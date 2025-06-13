const jwt = require('jsonwebtoken');
const User = require('../models/user');

const userAuth = async (req, res, next) => {
    try {
    const decodedToken = jwt.verify(req.cookies.token, "DevTinder@790");
    if (!decodedToken) {
        return res.status(401).json({message: "Unauthorized access"});
    }
    const {userId} = decodedToken;
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({message: "User not found"});
    }
    req.user = user;
    next();
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(401).json({ message: "Unauthorized" });
        
    }
}

module.exports = {userAuth};