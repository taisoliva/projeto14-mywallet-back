import express from "express"
import cors from "cors"
import { MongoClient, ObjectId } from "mongodb"
import dotenv from "dotenv"
import joi from "joi"
import bcrypt from "bcrypt"
import { v4 as uuid } from "uuid"

const app = express()
const PORT = 5000

app.use(express.json())
app.use(cors())
dotenv.config()

let db
const mongoClient = new MongoClient(process.env.DATABASE_URL)
mongoClient.connect()
    .then(() => {
        db = mongoClient.db()
    })
    .catch((err) => console.log(err.message))


const userSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required().min(3),
    confirmPassword: joi.string().required().min(3)
})

const loginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required().min(3),

})


app.post("/cadastro", async (req, res) => {

    const { email, name, password, confirmPassword } = req.body
    const validation = userSchema.validate(req.body, { abortEarly: false })

    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message)
        return res.status(422).send(errors)
    }

    try {
        const lookingEmail = await db.collection("users").findOne({ email })

        if (lookingEmail) return res.status(409).send("Usuário Cadastrado")

        const hash = bcrypt.hashSync(password, 10)

        await db.collection("users").insertOne({ email, name, password: hash })
        res.sendStatus(201)
    }
    catch (err) {
        return res.status(500).send(err.message)
    }

})

app.post("/", async (req, res) => {

    const { email, password } = req.body
    const validation = loginSchema.validate(req.body, { abortEarly: false })

    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message)
        return res.status(422).send(errors)
    }

    const checkEmail = await db.collection("users").findOne({ email })
    if (!checkEmail) return res.status(404).send("Email não cadastrado")

    const checkPassword = bcrypt.compareSync(password, checkEmail.password)
    if (!checkPassword) return res.status(401).send("Senha Incorreta")

    const token = uuid()
    await db.collection("sessions").insertOne({ token, idUsuario: checkEmail._id })
    return res.status(200).send(token)


})

app.post("/nova-transacao/:tipo", async (req, res) => {

    const { authorization } = req.headers
    console.log(req.params.tipo)

    const token = authorization?.replace("Bearer ", "")

    if (!token) return res.status(401).send("Token Inexistente")

    const registroSchema = joi.object({
        valor: joi.number().precision(2).required().positive(),
        descricao: joi.string().required()
    })

    try {
        const sessao = await db.collection("sessions").findOne({ token })
        if (!sessao) return res.status(401).send("Token inválido")

        const usuario = await db.collection("users").findOne({ _id: new ObjectId(sessao.idUsuario) })
        const validation = registroSchema.validate(req.body, { abortEarly: false })

        if (validation.error) {
            const errors = validation.error.details.map((detail) => detail.message)
            return res.status(422).send(errors)
        }

        await db.collection("registros").insertOne({ ...req.body, idUsuario: usuario._id, tipo: req.params.tipo })
    } catch (err) {
        res.status(500).send(err.message)
    }

    return res.sendStatus(200)

})

app.get("/cadastro", async (req, res) => {

    try {
        const usuarios = await db.collection("users").find().toArray()

        usuarios.forEach((user) => {
            delete user.password
        })
        res.send(usuarios)
    } catch (err) {
        return res.status(500).send(err.message)
    }
})

app.get("/", async (req, res) => {
    try {
        const sessao = await db.collection("sessions").find().toArray()

        res.send(sessao)
    } catch (err) {
        return res.status(500).send(err.message)
    }
})

app.get("/registros", async (req, res) => {
    try {
        const register = await db.collection("registros").find().toArray()

        res.send(register)
    } catch (err) {
        return res.status(500).send(err.message)
    }
})






app.listen(PORT, () => console.log(`Server Running in ${PORT}`))