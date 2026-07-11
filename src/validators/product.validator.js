const {z} = require("zod");

const createProductSchema = z.object({
    name:           z.string().min(1,"Name is required"),
    description:    z.string().min(1,"Description is required").optional(),
    price:          z.coerce.number().positive("Price must be greater than 0"),
    stock:          z.coerce.number().int().nonnegative("Stock cannot be negative or float"),
    imageUrl:       z.string().optional()
});

const updateProductSchema = z.object({
    name:           z.string().min(1).optional(),
    description:    z.string().optional(),
    price:          z.coerce.number().positive("Price must be greater than 0").optional(),
    stock:          z.coerce.number().int().nonnegative("Stock cannot be negative or float").optional(),
    imageUrl:       z.string().optional()
})

module.exports = {createProductSchema,updateProductSchema};