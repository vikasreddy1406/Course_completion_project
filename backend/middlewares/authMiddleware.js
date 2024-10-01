import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const verifyJWT = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).send("Access token not provided or invalid");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select("-password");
    if (!user) {
      return res.status(404).send("User not found");
    }

    req.user = user;  // Attach user details to the request object
    next();           
  } catch (error) {
    return res.status(401).send("Unauthorized");
  }
};

// Middleware to check if the user has admin role
export const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next(); 
  } else {
    return res.status(403).send("Access denied. Admins only.");
  }
};

// Middleware to check if the user has employee role
export const verifyEmployee = (req, res, next) => {
  if (req.user && req.user.role === "employee") {
    next(); 
  } else {
    return res.status(403).send("Access denied. Employees only.");
  }
};
