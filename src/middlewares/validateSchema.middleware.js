import { userSchema } from "../schemas/user.schemas.js"
import { loginSchema } from "../schemas/login.schemas.js"

export function validateSchemaUser(schema) {
    const validation = userSchema.validate(schema, { abortEarly: false })

    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message)
        return errors
    }
}

export function validateSchemaLogin (schema){

    const validation = loginSchema.validate(schema, { abortEarly: false })

    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message)
        return errors
    }
}
