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

module.exports = {validateSignupData}