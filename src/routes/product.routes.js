const express = require("express");
const router = express.Router();
const {validate} = require("../middleware/validate.middleware");
const {createProductSchema,updateProductSchema} = require("../validators/product.validator");
const upload = require("../middleware/upload.middleware");


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
router.post("/",protect,isAdmin,upload.single("image"),validate(createProductSchema),createProduct);
router.put("/:id",protect,isAdmin,upload.single("image"),validate(updateProductSchema),updateProduct);
router.delete("/:id",protect,isAdmin,deleteProduct);

module.exports = router;
