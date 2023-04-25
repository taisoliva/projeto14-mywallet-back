
import {ObjectId } from "mongodb"
import joi from "joi"
import dayjs from "dayjs"
import { db } from "../app.js"


export async function postNovaTransacao (req,res){

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

        await db.collection("registros").insertOne({ ...req.body, idUsuario: usuario._id, tipo: req.params.tipo, name:usuario.name, email:usuario.email, date: dayjs().format("DD/MM")})
    } catch (err) {
        res.status(500).send(err.message)
    }

    return res.sendStatus(200)

}

export async function getRegistros (req,res){

    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")

    if (!token) return res.status(401).send("Token Inexistente")
    const sessao = await db.collection("sessions").findOne({ token })
    if (!sessao) return res.status(401).send("Token inválido")
   
    try {
        const register = await db.collection("registros").find({idUsuario : sessao.idUsuario}).toArray()

        res.send(register)
    } catch (err) {
        return res.status(500).send(err.message)
    }
}