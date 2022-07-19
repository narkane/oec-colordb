const jwt = require("jsonwebtoken");

// status code 401 = unauthorized

const auth = (req, res, next) => {
    try {
        // checking x-auth-token with our jwt token
        const token = req.header("Authorization");
        if (!token) {
            return res
                .status(401)
                .json({ msg: "No authentication token, authorization denied! :O" });
        }
        // Grabbing our jwt token, passing our JWT_SECRET and checking it coordinates with our user we have selected
        const verified = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
        if (!verified) {
            return res
                .status(401)
                .json({ msg: "Token verification failed, authorization denied! Nuuuu~" });
        }
        req.user = verified.id;
        next();
    } catch (error) {
        res.status(500).json({ err: error.message });
    }
};

module.exports = auth;