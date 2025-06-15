const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
    {
    firstName: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 50,
        index: true,
    },
    lastName: {
        type: String
    },
    emailId: {
        type: String,
        lowercase: true,
        trim: true,
        required: true, 
        unique: true,  // this is equal to index: true. mongodb indexes if there is unique: true.
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid email format: " + value)
            }   
        }   
    },
    password: {
        type: String,
        validate (value) {
            if (! validator.isStrongPassword(value)) {
                throw new Error("Password must be strong")
            }
        }
    },
    age: {
        type: Number,
        min: 18
    },
    gender: {
        type: String,
        validate(value) {    //this function u can write for every one. when u try to insert a value in db, mongodb checks this shema, whether its throwing any error or not.
            if (! ["male", "female", "other"].includes(value)) {
                throw new Error("Invalid gender type")
            }
        }
    },
    photoUrl: {
        type: String,
        default: "https://static-00.iconduck.com/assets.00/avatar-default-icon-1975x2048-2mpk4u9k.png",
        validate(value) {
            if (!validator.isURL(value)) {
                throw new Error("Invalid URL format: " + value)
            }
        }
    },
    about: {
        type: String,
        default: "This is a default about"
    },
    skills: {
        type: [String]
    }

}, {
    timestamps: true
})

userSchema.methods.getJWT = function () {
    const user = this;
    const token = jwt.sign({userId: user._id}, "DevTinder@790", {expiresIn: '90d'});
    return token;
}

userSchema.methods.validatePassword = function (password) {
    const user = this;
    const isPAsswordMatch = bcrypt.compare(password, user.password);
    return isPAsswordMatch;
}

module.exports = mongoose.model("User", userSchema);

