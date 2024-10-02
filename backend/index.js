import "dotenv/config.js"
import express from "express"
import cors from "cors"
import connectToDB from "./config/db.js"
import cookieParser from "cookie-parser"
import path from 'path';
import { fileURLToPath } from 'url';




connectToDB()
const app=express()

app.use(cors({
    origin: "*",
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())
const PORT = process.env.PORT

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the "uploads" directory
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static('uploads'));

import userRoutes from "./routes/userRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"


app.use('/api/user',userRoutes)
app.use('/api/admin', adminRoutes);


app.listen(PORT,()=>{
    console.log(`Server running on PORT ${PORT}`)
})