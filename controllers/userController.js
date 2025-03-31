const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const ErrorHandler = require("../utils/errorHandler");
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const path = require("path");
const fs = require("fs");

// Register a User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password, address } = req.body;
    const profilePicture = req.file ? req.file.path : null;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new ErrorHandler("Email already exists", 400));
    }
    const user = await User.create({ name, email, password, address, profilePicture});
    sendToken(user, 201, res);
});

// Login User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ErrorHandler("Please Enter Email & Password", 400));
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }
    sendToken(user, 200, res);
});

// Logout User
exports.logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", "", {
        expires: new Date(0),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    res.status(200).json({
        success: true,
        message: "Logged Out Successfully",
    });
});

// Fetching User Details
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }
    res.status(200).json({
        success: true,
        user,
    });
});

// Updating User Details
exports.updateUserDetails = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id;
    let user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }
    // Only update fields that are provided in the request
    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.email) updateData.email = req.body.email;
    if (req.body.address) updateData.address = { ...user.address, ...req.body.address };

    if (req.file) {
        const newProfilePicture = path.basename(req.file.path);
        if (user.profilePicture) {
            const oldImagePath = path.join("uploads/images", user.profilePicture);
            fs.unlink(oldImagePath, (err) => {
                if (err) console.log("Error deleting old profile picture:", err);
            });
        }
        updateData.profilePicture = newProfilePicture;
    }
    user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
    });
    res.status(200).json({
        success: true,
        user,
    });
});

// Forgot Password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(200).json({
            success: true,
            message: "If an account with that email exists, you will receive a password reset email."
        });
    }
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/password/reset/${resetToken}`;
    const message = `You requested a password reset. Click the link below to reset your password:\n\n${resetPasswordUrl}\n\n
    If you didn't request this, please ignore this email.`;
    try {
        await sendEmail({
            email: user.email,
            subject: "Password Reset Request",
            message,
        });

        res.status(200).json({
            success: true,
            message: "If an account with that email exists, you will receive a password reset email."
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler("Error sending email. Please try again later.", 500));
    }
});

// Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    const { newPassword } = req.body;
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
    });
    console.log(user);
    if (!user) {
        return next(new ErrorHandler("Invalid or expired reset token", 400));
    }
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.status(200).json({
        success: true,
        message: "Password reset successful. You can now log in with your new password.",
    });
});

// Delete a user
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }
    if (user.profilePicture) {
        const imagePath = `uploads/images/${user.profilePicture}`;
        fs.unlink(imagePath, (err) => {
            if (err) console.log("Error deleting profile picture:", err);
        });
    }
    await User.findByIdAndDelete(userId);
    res.status(200).json({
        success: true,
        message: "User deleted successfully.",
    });
});
