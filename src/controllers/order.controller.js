const prisma = require("../config/db");
const catchAsync = require("../utils/catchAsync");

const createOrder = catchAsync(async (req,res) => {
    
         const cartItems = await prisma.cartItem.findMany({
            where:{userId:req.user.id},
            include:{product:true}
         })
         
         if(cartItems.length ===0){
            return res.status(400).json({error:"Cart is empty"});
         }
         for(const item of cartItems){
            if(item.product.stock < item.quantity){
                return res.status(400).json({error:`Not enough stock for ${item.product.name}`});
            }
         }
         const total= cartItems.reduce(
            (sum,item) => sum+item.product.price*item.quantity ,0
         )
        
         const order = await prisma.$transaction(async (tx)=> {
            const newOrder = await tx.order.create({
                data:{
                    userId:req.user.id,
                    total,
                    status:"PENDING"
                }
            })
            for(const item of cartItems){
                await tx.orderItem.create({
                    data:{
                        orderId: newOrder.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        price : item.product.price
                    }
                })

                await tx.product.update({
                    where:{id:item.productId},
                    data:{stock: item.product.stock - item.quantity}
                })
            }
            await tx.cartItem.deleteMany({
                where:{userId:req.user.id}
            })

            return newOrder;
         })
         res.status(201).json({message:"Order Created",order});
    
})

const getMyOrders = catchAsync(async (req,res) =>  {
    
        const orders= await prisma.order.findMany({
            where:{userId:req.user.id},
            include:{items:{include:{product:true}}},
            orderBy:{createdAt:"desc"}
        })

        res.json({count: orders.length,orders});
   
})

const getOrderById = catchAsync(async (req,res) => {
  
        const id = parseInt(req.params.id,10);
        const order = await prisma.order.findUnique({
            where:{id},
            include:{items:{include:{product:true}}}
        })

        if(!order){
            return res.status(404).json({error:"Order Not Found"});
        }
        if(order.userId !== req.user.id && req.user.role !== "ADMIN"){
            return res.status(403).json({error:"Not Authorized to Look this order"});
        }
        res.status(200).json({order});
   
}
)
module.exports = {createOrder,getMyOrders,getOrderById};
