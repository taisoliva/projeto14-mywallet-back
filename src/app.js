import express from "express"
import cors from "cors"
import { MongoClient} from "mongodb"
import dotenv from "dotenv"

import router from "./routes/index.routes.js"

const app = express()

app.use(express.json())
app.use(cors())
app.use(router)
dotenv.config()


const mongoClient = new MongoClient(process.env.DATABASE_URL)
try{
    await mongoClient.connect()
} catch (err){
    console.log(err.message)
}

export const db = mongoClient.db("myWallet-Cluster")

app.listen(process.env.PORT, () => console.log(`Server Running on port ${process.env.PORT}`))
/* app.listen(5000, () => console.log(`Server Running on port 5000`)) */