const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware to verify the JWT token
exports.auth = async (req, res, next) => {
    try {
        // 1. Extract the token using Optional Chaining to prevent crashes if req.cookies is undefined
        const token =
            req.body?.token ||
            req.cookies?.token || 
            req.header("Authorization")?.replace("Bearer ", ""); 

        // 2. Check if the token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token is missing. Please log in.",
            });
        }

        // 3. Verify the token
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);

            // 4. Attach decoded info to request
            req.user = decode;
            
            // 5. Move next() inside the success block for better control
            return next(); 

        } catch (error) {
            console.error("JWT Verification Error:", error.message);
            return res.status(401).json({
                success: false,
                message: "Token is invalid or expired. Please log in again.",
            });
        }
        
    } catch (error) {
        console.error("Authentication Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error during authentication process.",
        });
    }
};