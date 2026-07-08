const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");
const catchAsync = require("../utils/catchAsync");

const register = catchAsync(async (req,res) =>{
   
        const {name,email,password} = req.body;
        
        const existingUser = await prisma.user.findUnique({where:{email}});
        if (existingUser){
            return res.status(400).json({error:"Mail Already Registered"});
        }
        const hashedPassword = await bcrypt.hash(password,10);
        
        const user = await prisma.user.create({
            data:{
                name,
                email,
                password:hashedPassword
            }
        })
        res.status(201).json({
            message:"User Registered Successfully",
            user :{
                id: user.id,
                name : user.name,
                email : user.email
            }
        })
    
})
const login = catchAsync(async (req,res) => {
    
        const {email,password} = req.body;

        
        const user = await prisma.user.findUnique({
              where: {email}
         });
        
        if(!user){
            return res.status(401).json({error : "Invalid credentials"});
        }
        const isMatch = await bcrypt.compare(password,user.password);
          if(!isMatch){
             return res.status(401).json({error:"Invalid Credentials"});
         }
         const token = jwt.sign(
             {id: user.id , role : user.role},
              process.env.JWT_SECRET,
            {expiresIn:"7d"}
         )
         res.json({
             message:"login successfull",
             token,
             user : {
                 id : user.id,
                 name : user.name,
                 email: user.email,
                role : user.role
             }
         })
    
 })
module.exports = {register,login};

