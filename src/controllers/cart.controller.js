
const prisma = require("../config/db");
const catchAsync = require("../utils/catchAsync");


const getCart = catchAsync(async (req, res) => {
    
        const cartItems = await prisma.cartItem.findMany({
            where: {userId:req.user.id},
            include: {product:true}
        })
        const total = cartItems.reduce(
            (sum,item) => sum + item.product.price*item.quantity,0
        )
        res.json({count:cartItems.length,total,cartItems});
})

const addToCart = catchAsync(async (req,res) => {
    
        const {productId,quantity} = req.body;

        const product = await prisma.product.findUnique({
            where:{id:parseInt(productId,10)}
        })

        if(!product){
            return res.status(400).json({error:"Product not found"});
        }
        const qty = quantity!==undefined ?quantity:1;

        const existingItem = await prisma.cartItem.findFirst({
            where:{
                userId:req.user.id,
                productId:parseInt(productId,10)
            }
        })
        let cartItem;
        if(existingItem){
            cartItem = await prisma.cartItem.update({
                where:{id:existingItem.id},
                data:{quantity: existingItem.quantity + qty}
            })
        }
        else{
            cartItem = await prisma.cartItem.create({
                data:{
                    userId: req.user.id,
                    productId: parseInt(productId, 10),
                    quantity: qty
                }
            })
        }
        res.status(201).json({message:"Item added to cart"});
    
})

const updateCartItem = catchAsync(async (req , res) => {
   
        const id = parseInt(req.params.id,10);
        const {quantity} = req.body;

        if(quantity=== undefined || quantity<1){
            return res.status(400).json({error:"Quantity must be atleast one"});
        }
        const cartItem = await prisma.cartItem.findUnique({
            where:{id}
        })
        if(!cartItem){
            return res.status(404).json({error:"Cart Item Not Found"});
        }
        if(cartItem.userId !== req.user.id){
            return res.status(403).json({error:"Not authorixed to modify this cart"});
        }

        const updatedItem = await prisma.cartItem.update({
            where:{id},
            data: {quantity:parseInt(quantity,10)}
        });
        res.status(201).json({message:"Cart item updated",cartItem:updatedItem});
    
}
)
const removeCartItem = catchAsync(async (req,res) => {
 
        const id = parseInt(req.params.id,10);
        const cartItem = await prisma.cartItem.findUnique({
            where:{id}
        })

        if(!cartItem){
            return res.status(404).json({error:"Cart Item Not Found"});
        }
        if(cartItem.userId !== req.user.id){
            return res.status(403).json({error:"Not Authorixed For This Cart"});
        }
        await prisma.cartItem.delete({
            where: {id}
        })
        res.status(201).json({message:"Cart Item Removed"});
    
}
)
module.exports = {getCart,addToCart,updateCartItem,removeCartItem};