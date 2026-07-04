const express = require("express");
const router = express.router();

const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require("../controllers/product.controller");
const {protect,isAdmin} = require("../middleware/auth.middleware");

router.get("/",getAllProducts);
router.get("/:id", getProductById);
router.post("/",protect,isAdmin,createProduct);
router.put("/:id",protect,isAdmin,updateProduct);
router.delete("/:id",protect,isAdmin,deleteProduct);

module.exports = router;
