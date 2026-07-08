const express = require("express");
const router = express.Router();
const {validate} = require("../middleware/validate.middleware");
const {createProductSchema,updateProductSchema} = require("../validators/product.validator");


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
router.post("/",protect,isAdmin,validate(createProductSchema),createProduct);
router.put("/:id",protect,isAdmin,validate(updateProductSchema),updateProduct);
router.delete("/:id",protect,isAdmin,deleteProduct);

module.exports = router;
