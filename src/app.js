import express from "express"
import cors from "cors"
import { MongoClient } from "mongodb"

const app = express()
const PORT = 5000

app.use(express.json())
app.use(cors())

app.listen(PORT, () => console.log(`Server Running in ${PORT}`))