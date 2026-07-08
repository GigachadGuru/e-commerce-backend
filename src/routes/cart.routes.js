const express= require("express");
const router = express.Router();
const {validate} = require("../middleware/validate.middleware");
const {addToCartSchema,updateCartItemSchema} = require("../validators/cart.validator");
const {getCart,addToCart,updateCartItem,removeCartItem} =require("../controllers/cart.controller");

const {protect} = require("../middleware/auth.middleware");

router.get("/"      ,  protect , getCart);
router.post("/"     ,  protect,validate(addToCartSchema),addToCart);
router.put("/:id"   ,  protect,validate(updateCartItemSchema),updateCartItem);
router.delete("/:id",  protect , removeCartItem);

module.exports =router;