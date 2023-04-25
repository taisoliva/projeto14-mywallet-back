import { Router } from "express"
import {postCadastro, postLogin, getCadastro, getLogin } from "../controllers/users.controller.js"

const userRoutes = Router()

userRoutes.post("/cadastro", postCadastro)
userRoutes.post("/", postLogin)
userRoutes.get("/cadastro", getCadastro)
userRoutes.get("/", getLogin)

export default userRoutes