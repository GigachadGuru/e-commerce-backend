const {z} = require("zod");

const registerSchema = z.object({
    name:  z.string().min(1,"Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6,"Password of atleast length 6 is required")
});

const loginSchema = z.object({
    email:  z.string().email("Invalid email address"),
    password: z.string().min(1,"Password is required")
});

module.exports = {registerSchema,loginSchema}
