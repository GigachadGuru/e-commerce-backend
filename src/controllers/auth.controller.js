const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");

const register = async (req,res) =>{
    try{
        const {name,email,password} = req.body;
        if(!name||!email||!password){
            return res.status(400).json({error:"All fields are required"});
        }
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
    }catch(err){
        res.status(500).json({error :"Something went wrong"});
    }
}
const login = async (req,res) => {
    try{
        const {email,password} = req.body;

        if(!email || !password){
            return res.status(400).json("All Fields Are to be Filled");
        }
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
    }
    catch(err){
        res.status(500).json({error: "Something went wrong"});
    }
 }
module.exports = {register,login};

