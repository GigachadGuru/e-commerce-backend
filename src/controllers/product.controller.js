const prisma = require("../config/db");

const getAllProducts = async (req,res) => {
    try{
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
    }
    catch(err){
        console.error(err);
        res.status(500).json({error : "Something went wrong"});
    }
}

const getProductById = async (req,res) => {
    try{
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
    }
    catch(err){
        res.status(500).json({error:"Something Went Wrong"});
    }
}

const createProduct = async (req,res) => {
    try{
        const {name,description,price,stock,imageUrl} = req.body;
        if(!name || !price){
            return res.status(400).json({error:"Name and Price are required"});
        }

        const product = await prisma.product.create({
            data:{
                name,
                description,
                price: parseFloat(price),
                stock: stock!==undefined?parseInt(stock,10):0,
                imageUrl
            }
        })
        res.status(201).json({message:"Product Created",product});
    }
    catch(err){
        res.status(500).json({error:"Something went wrong"});
    }
}

const updateProduct = async (req,res) => {
    try{
        const id = parseInt(req.params.id,10);
        const {name,description,price,stock,imageUrl} = req.body;
        const data ={}
        if (name        !== undefined) data.name        = name
        if (description !== undefined) data.description = description
        if (price       !== undefined) data.price       = parseFloat(price)
        if (stock       !== undefined) data.stock       = parseInt(stock, 10)
        if (imageUrl    !== undefined) data.imageUrl    = imageUrl

        const updatedProduct = await prisma.product.update({
            where: {id},
            data
        })
        res.status(201).json({message:"Product updated"});

    }
    catch(err){
        if(err.code =="P2025"){
            return res.status(404).json({error:"Product Not Found"});
        }
        res.status(500).json({error:"Something went wrong"});
    }
}

const deleteProduct = async (req,res) => {
    try{
        const id = parseInt(req.params.id,10);
        await prisma.product.delete({
            where:{id}
        })
        res.json({message:"Product deleted"});
    }
    catch(err){
        if(err.code == "P2025"){
             return res.status(404).json({error:"Product Not Found"});
        }
        res.status(500).json({error:"Something went wrong"});
    }
}

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
}

