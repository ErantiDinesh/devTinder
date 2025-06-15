const validator = require('validator');

const validateSignupData = (data) => {

    const {firstName, lastName, emailId, password} = data;

    if (!firstName && !lastName) {
        throw new Error("PLease enter the name")
    }else if (firstName.length < 4 || firstName.length > 50) {
        throw new Error("First name must be between 4 and 50 characters")
    }else if (!validator.isEmail(emailId)) {
        throw new Error("Invalid email format: " + emailId);
    }else if (!validator.isStrongPassword(password)) {
        throw new Error("Password must be strong");
    }

}

const validateEditProfileData = (data) => {
    console.log("upadteDAta", data)

    const allowUpdates = ["firstName", "lastName", "age", "gender", "photoUrl", "about", "skills"];
    const isUpdatedAllowed = Object.keys(data).every((key) => allowUpdates.includes(key));

    if (!isUpdatedAllowed) {
       throw new Error("Invalid update fields");
        }

    if (Array.isArray(data.skills) && data?.skills.length > 10) {
        throw new Error("Skills cannot exceed 10 items");
        }
}

module.exports = {validateSignupData, validateEditProfileData}