import bcrypt from "bcrypt"
import { v4 as uuid } from "uuid"

import { db } from "../app.js"
import { validateSchemaLogin, validateSchemaUser } from "../middlewares/validateSchema.middleware.js"


export async function postCadastro (req,res){

    const { email, name, password, confirmPassword } = req.body

    const errors = validateSchemaUser(req.body)
    if (errors) return res.status(422).send(errors)

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

}

export async function postLogin (req,res) {

    const { email, password } = req.body
    
    const errors = validateSchemaLogin(req.body)
    if (errors) return res.status(422).send(errors)

    const checkEmail = await db.collection("users").findOne({ email })
    if (!checkEmail) return res.status(404).send("Email não cadastrado")

    const checkPassword = bcrypt.compareSync(password, checkEmail.password)
    if (!checkPassword) return res.status(401).send("Senha Incorreta")

    const token = uuid()
    await db.collection("sessions").insertOne({ token, idUsuario: checkEmail._id })
    return res.status(200).send(token)


}

export async function getCadastro (req,res){

    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")

    if (!token) return res.status(401).send("Token Inexistente")
    const sessao = await db.collection("sessions").findOne({ token })
    if (!sessao) return res.status(401).send("Token inválido")

    console.log(sessao)

    try {
        const usuarios = await db.collection("users").find({_id : sessao.idUsuario}).toArray()

        usuarios.forEach((user) => {
            delete user.password
        })
        res.send(usuarios)
    } catch (err) {
        return res.status(500).send(err.message)
    }
}

export async function getLogin (req,res){
    try {
        const sessao = await db.collection("sessions").find().toArray()

        res.send(sessao)
    } catch (err) {
        return res.status(500).send(err.message)
    }
}