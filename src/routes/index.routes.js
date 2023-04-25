import { Router } from "express";

import userRoutes from "./users.routes.js";
import registrosRouter from "./registros.routes.js";

const router = Router()
router.use(userRoutes)
router.use(registrosRouter)

export default router