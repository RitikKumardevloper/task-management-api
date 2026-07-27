const jwt = require("jsonwebtoken");

const revokedTokens = new Set();

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  if (revokedTokens.has(token)) {
    return res.status(401).json({
      success: false,
      message: "Token has been revoked",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = {
  authenticate,
  revokeToken: (token) => revokedTokens.add(token),
};
