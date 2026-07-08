const {z} = require("zod");

const addToCartSchema = z.object({
    productId:       z.number().int().positive("productId must be a positive integer"),
    quantity :       z.number().int().positive("Quantity must be atleast one").optional()
});

const updateCartItemSchema = z.object({
    quantity:        z.number().int().positive("Quantity must be atleast 1")
});

module.exports = {addToCartSchema,updateCartItemSchema};