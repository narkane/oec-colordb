const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Cell = require("../models/cellModel");
const auth = require("../middleware/auth");

router.post("/register", async (req, res) => {
    try {
        // Creating new user!! :O
        const newUser = new User({
            // username: username,
            // password: passwordHash,
            // firstName: firstName,
            // lastName: lastName,
            // email: email,
        });
        const savedUser = await newUser.save();
        console.log('newUser._id: ' + newUser._id)
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
        res.json({token, savedUser});
    } catch (error) {
        res.status(500).json({ err: error.message });
    }
});

router.put("/edit", auth, async (req, res) => {
    try {
        const { username, password, passwordCheck, firstName, lastName, email } = req.body;

        userEdit = {};

        // validate
        // 400 = bad request
        // 500 = internal server error
        
        console.log("PUT /edit: " + req.body)

        // if (!username || !password || !passwordCheck || !firstName || !lastName || !email)) {
        //     return res.status(400).json({ msg: "Not all required fields have been entered." });
        // }

        if (firstName) userEdit.firstName = firstName;
        if (lastName) userEdit.lastName = lastName;

        // Checking to ensure password length is at least 8 characters
        if (password && password.length < 8) {
            return res
                .status(400)
                .json({ msg: "Your password needs to be at least 8 characters long."});
        }

        // Checking password entered vs the password checker
        if (password && (password !== passwordCheck)) {
            return res
                .status(400)
                .json({ msg: "The passwords entered do not match. Please try again."});
        }

        // Checking DB for any existing user using the desired username
        if (username) {
            console.log('ll')
            const existingUsername = await User.findOne({ username: username });
            if (existingUsername) {
                return res
                    .status(400)
                    .json({ msg: "An account with this username already exists."});
            }
            userEdit.username = username;
        }

        // Checking DB for any existing user using the desired email
        if (email) {
            const existingEmail = await User.findOne({ email: email });
            if (existingEmail) {
                return res
                    .status(400)
                    .json({ msg: "An account with this email already exists."});
            }
            userEdit.email = email;
        }

        // Using bcrypt to hash passwords - for sekuritty, duh :P
        if (password && passwordCheck) {
            const salt = await bcrypt.genSalt();
            const passwordHash = await bcrypt.hash(password, salt);

            userEdit.password = passwordHash;
        }

        console.log(userEdit);

        const editedUser = await User.findByIdAndUpdate(req.user, userEdit);
        if (!editedUser) {
            return res
                .status(400)
                .json({ msg: "An account with this username already exists. (Q,Q ) Sad day."});
        }
        res.json(editedUser);
    } catch (error) {
        res.status(500).json({ err: error.message });
    }
})

router.post("/login",  async (req, res) => {
    try {
        const { username, password } = req.body;

        // validate

        if (!username || !password) {
            return res.status(400).json({ msg: "Not all fields have been entered." });
        }

        // Checking username that was entered and comparing username from database
        const user = await User.findOne({ username: username });
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
        const deletedUser = await User.findByIdAndDelete(req.user);
        res.json(deletedUser);
    } catch (error) {
        res.status(500).json({ err: error.message });
    }
});

// validating if user is logged in (with a boolean return)
router.post("/tokenIsValid", async (req, res) => {
    try {
        const token = req.header("Authorization");
        if (!token) return res.json(false);

        const verified = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
        if (!verified) return res.json(false);

        const user = await User.findById(verified.id);
        if (!user) return res.json(false);

        return res.json(true);
    } catch (error) {
        res.status(500).json({ err: error.message });
    }
});

module.exports = router;