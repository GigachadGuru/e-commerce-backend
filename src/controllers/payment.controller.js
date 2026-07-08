const crypto = require("crypto");
const prisma = require("../config/db");
const Razorpay = require("razorpay");
const { error } = require("console");
const catchAsync = require("../utils/catchAsync");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

const initiatePayment = catchAsync(async (req , res) => {
    
        const orderId = parseInt(req.params.orderId,10);
        const order = await prisma.order.findUnique({
            where:{id:orderId}
        });
        if(!order){
            return res.status(404).json({error:"Order Not Found"});
        }
        if(order.userId!=req.user.id){
            return res.status(403).json({error:"Not Authorized For This Order"});
        }
        if(order.status !== "PENDING"){
            return res.status(400).json({error:"Order has no pending payment"});
        }
        console.log("Order fetched from DB:", order);
        const razorpayOrder = await razorpay.orders.create({
            amount:Math.round(order.total*100),
            currency:"INR",
            receipt:`order_${order.id}`
        })

        await prisma.order.update({
            where:{id:order.id},
            data:{razorpayOrderId:razorpayOrder.id}
        })

        res.json({
            razorpayOrderId:razorpayOrder.id,
            amount:razorpayOrder.amount,
            currency:razorpayOrder.currency,
            keyId:process.env.RAZORPAY_KEY_ID
        })
    
}
)
const verifyPayment = catchAsync(async (req,res) => {
    
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        }= req.body;
        if(!razorpay_order_id||!razorpay_payment_id||!razorpay_signature){
            return res.status(400).json({error:"Missing payment verification fields"});
        }
        const order = await prisma.order.findFirst({
            where:{razorpayOrderId:razorpay_order_id},
        });
        if(!order){
            return res.status(404).json({error:"Order Not Found"});
        }
        if(order.userId!==req.user.id){
            return res.status(403).json({error:"Not Authorize For This Order"});
        }
        const body = razorpay_order_id +"|"+razorpay_payment_id;
        const expectedSignature = crypto
        .createHmac("sha256",process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");
        if(expectedSignature!== razorpay_signature){
            return res.status(400).json({error:"Payment Verification Failed"});
        }
        const updatedOrder= await prisma.order.update({
            where:{id:order.id},
            data:{status:"PAID"}
        });
        res.status(201).json({message:"Payment Verified Successfully",order:updatedOrder});
   
})

module.exports= {initiatePayment,verifyPayment};