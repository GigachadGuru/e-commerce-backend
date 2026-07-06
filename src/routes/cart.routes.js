const express= require("express");
const router = express.Router();

const {getCart,addToCart,updateCartItem,removeCartItem} =require("../controllers/cart.controller");

const {protect} = require("../middleware/auth.middleware");

router.get("/"      ,  protect , getCart);
router.post("/"     ,  protect,addToCart);
router.put("/:id"   ,  protect,updateCartItem);
router.delete("/:id",  protect , removeCartItem);

module.exports =router