const prisma = require("../config/db");
const catchAsync = require("../utils/catchAsync");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const getAllProducts = catchAsync(async (req,res) => {
        const {search,sortBy,order}=req.query;
        const where = {};
        if(search){
            where.name = {
                contains: search,
                mode: "insensitive"
            }
        }
        const allowedSortFields = ["name","price","stock","createdAt"];
        const sortField = allowedSortFields.includes(sortBy)?sortBy:"createdAt";
        const products = await prisma.product.findMany({
            where,
            orderBy:{[sortField]:order==="desc"?"desc":"asc"}
        })
        res.json({count:products.length,products});
})

const getProductById = catchAsync(async (req,res) => {
    
    const id = parseInt(req.params.id,10);
    if(isNaN(id)){
        return res.status(400).json({error:"Invalid Product Id"});
    }
    const product = await prisma.product.findUnique({
        where:{id}
    })
    if(!product){
        return  res.status(400).json({error:"Product Not Found"});
    }
    res.json({product});
    
})

const createProduct = catchAsync( async (req,res) => {
    
        const {name,description,price,stock} = req.body;
        let imageUrl;
        if(req.file){
            const result = await uploadToCloudinary(req.file.buffer);
            imageUrl =result.secure_url;
        }

        const product = await prisma.product.create({
            data:{
                name,
                description,
                price,
                stock: stock!==undefined?stock:0,
                imageUrl
            }
        })
        res.status(201).json({message:"Product Created",product});
    
})

const updateProduct = catchAsync(async (req,res) => {
        let imageUrl;
        const id = parseInt(req.params.id,10);
        const {name,description,price,stock} = req.body;
        if(req.file){
            const result = await uploadToCloudinary(req.file.buffer);
            imageUrl =result.secure_url;
        }
        
        const data ={}
        if (name        !== undefined) data.name        = name
        if (description !== undefined) data.description = description
        if (price       !== undefined) data.price       = price
        if (stock       !== undefined) data.stock       = stock
        if (imageUrl    !== undefined) data.imageUrl    = imageUrl

        const updatedProduct = await prisma.product.update({
            where: {id},
            data
        })
        res.status(200).json({message:"Product updated"});

    
})

const deleteProduct = catchAsync(async (req,res) => {
        const id = parseInt(req.params.id,10);
        await prisma.product.delete({
            where:{id}
        })
        res.json({message:"Product deleted"});
    
})

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
}

