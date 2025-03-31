const express = require("express");
const upload = require("../utils/multer_config");
const {
    logout,
    registerUser,
    loginUser,
    getUserDetails,
    updateUserDetails,
    forgotPassword,
    resetPassword,
    deleteUser
} = require("../controllers/userController");
const { isAuthenticatedUser } = require("../middlewares/auth");

const router = express.Router();

// User Registration with Profile Picture Upload
router.post("/register", upload.single("profilePicture"), registerUser);

// User Login
router.post("/login", loginUser);

// User Logout
router.get("/logout", isAuthenticatedUser, logout);

// Get User Details
router.get("/me", isAuthenticatedUser, getUserDetails);

// Update User Details (conditionally upload profile picture)
router.put("/me/update", isAuthenticatedUser, (req, res, next) => {
    upload.single("profilePicture")(req, res, (err) => {
        if (err) return next(err);
        next();
    });
}, updateUserDetails);

// Forgot Password
router.post("/password/forgot", forgotPassword);

// Reset Password
router.put("/password/reset/:token", resetPassword);

// delete user
router.delete("/me/delete", isAuthenticatedUser, deleteUser);

module.exports = router;
