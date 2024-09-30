import jwt from "jsonwebtoken"
import { User } from "../models/User.js"

export const verifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        // console.log(token);
        if (!token) {
            return res.status(401).send("Invalid token")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password")

        if (!user) {

            return res.status(404).send("Invalid user")
        }

        req.user = user;
        next()
    } catch (error) {
        return res.status(401).send(error)
    }

}