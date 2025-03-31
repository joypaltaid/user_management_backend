const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name: { 
        type: String,
        required: [true, "Please Enter Your Name"],
        maxLength: [30, "Name cannot exceed 30 characters"],
        minLength: [4, "Name should have at least 4 characters"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Please Enter Your Email"], 
        unique: true,
        validate: [validator.isEmail, "Please Enter a valid Email"],
        lowercase: true,
    },
    address: {
        addressLine1: { type: String, required: [true, "Address Line 1 is required"] },
        addressLine2: { type: String },
        city: { type: String, required: [true, "City is required"] },
        district: { type: String, required: [true, "District is required"] },
        state: { type: String, required: [true, "State is required"] },
        pin: { 
            type: String, 
            required: [true, "PIN code is required"],
            validate: {
                validator: function (v) {
                    return /^[0-9]{6}$/.test(v);
                },
                message: "Please enter a valid 6-digit PIN code"
            }
        }
    },
    password: {
        type: String, 
        required: [true, "Please Enter Your Password"],
        minLength: [8, "Password should have at least 8 characters"],
        select: false
    },
    profilePicture: { type: String, default: "" },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Generate JWT token
userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// Compare passwords
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Generate Password Reset Token
userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    // Set token expiration (15 minutes)
    this.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    return resetToken;
};

module.exports = mongoose.model("User", userSchema);
