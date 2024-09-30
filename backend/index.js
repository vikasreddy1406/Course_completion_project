import "dotenv/config.js"
import express from "express"
import cors from "cors"
import connectToDB from "./config/db.js"
import cookieParser from "cookie-parser"

connectToDB()
const app=express()

app.use(cors({
    origin: "*",
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())
const PORT = process.env.PORT

import userRoutes from "./routes/userRoutes.js"



app.use('/api/user',userRoutes)



app.listen(PORT,()=>{
    console.log(`Server running on PORT ${PORT}`)
})