const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const msUser = require("../models/msUserModel");
const auth = require("../middleware/auth");

router.post("/register", async (req, res) => {
    try {
        const { username, password, passwordCheck, msName, firstName, lastName, email } = req.body;

        // validate
        // 400 = bad request
        // 500 = internal server error
        
        if (!username || !password || !passwordCheck || !msName || !firstName || !lastName || !email) {
            return res.status(400).json({ msg: "Not all required fields have been entered." });
        }

        // Checking DB for any existing user using the desired username
        const existingUser = await msUser.findOne({ username: username });
        if (existingUser) {
            return res
                .status(400)
                .json({ msg: "An account with this username already exists. (Q,Q ) Sad day."});
        }

        // Checking to ensure password length is at least 8 characters
        if (password.length < 8) {
            return res
                .status(400)
                .json({ msg: "Your password needs to be at least 8 characters long."});
        }

        // Checking password entered vs the password checker
        if (password !== passwordCheck) {
            return res
                .status(400)
                .json({ msg: "The passwords entered do not match. Please try again."});
        }

        // Checking DB for any existing user using the desired email
        const existingEmail = await msUser.findOne({ email: email });
        if (existingEmail) {
            return res
                .status(400)
                .json({ msg: "An account with this email already exists."});
        }

        // Using bcrypt to hash passwords - for sekuritty, duh :P
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        // Creating new user!! :O
        const newUser = new msUser({
            username: username,
            password: passwordHash,
            msName: msName,
            firstName: firstName,
            lastName: lastName,
            email: email,
        });
        const savedUser = await newUser.save();
        res.json(savedUser);
    } catch (error) {
        res.status(500).json({ err: error.message });
    }
});

router.post("/login",  async (req, res) => {
    try {
        const { username, password } = req.body;

        // validate

        if (!username || !password) {
            return res.status(400).json({ msg: "Not all fields have been entered." });
        }

        // Checking username that was entered and comparing username from database
        const user = await msUser.findOne({ username: username });
        if (!user) {
            return res
                .status(400)
                .json({ msg: "No account exists with this username. Try again?" });
        }

        // Checking password that was entered against hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials :(" });
        }

        // Creating our json web token by passing the user id and our JWT sekrit *shhhh*
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            },
        });
    } catch (error) {
        res.status(500).json({ err: error.message });
    }
});

// delete user account route
router.delete("/delete", auth, async (req, res) => {
    try {
        const deletedUser = await msUser.findByIdAndDelete(req.user);
        res.json(deletedUser);
    } catch (error) {
        res.status(500).json({ err: error.message });
    }
});

// validating if user is logged in (with a boolean return)
router.post("/tokenIsValid", async (req, res) => {
    try {
        const token = req.header("x-auth-token");
        if (!token) return res.json(false);

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (!verified) return res.json(false);

        const user = await msUser.findById(verified.id);
        if (!user) return res.json(false);

        return res.json(true);
    } catch (error) {
        res.status(500).json({ err: error.message });
    }
});

module.exports = router;