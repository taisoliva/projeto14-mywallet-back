import { Router } from "express";
import { postNovaTransacao, getRegistros } from "../controllers/registros.controller.js"

const registrosRouter = Router()



registrosRouter.post("/nova-transacao/:tipo", postNovaTransacao)
registrosRouter.get("/registros", getRegistros)

export default registrosRouter