const express = require("express");
const router  = express.Router();

const { initiatePayment, verifyPayment } = require("../controllers/payment.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/:orderId/initiate", protect, initiatePayment);
router.post("/verify",            protect, verifyPayment);

module.exports = router;