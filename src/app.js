const express = require("express");
const helmet = require("helmet");// the color is white because of structural difference in the package of helmet
const cors = require("cors");
const morgan = require("morgan");
const authRoutes = require("./routes/auth.routes");
const app = express();
const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use("/api/auth",authRoutes);
app.use("/api/products",productRoutes);
app.use("/api/cart",cartRoutes);

app.get("/",(req,res) =>{
    res.json({message : "E-Commerce API running", status : "OK"});
})


 
//404 handler
app.use((req,res) =>{
    res.status(404).json({error: "Route Not Found"});
})

//global error handler
app.use((err,req,res,next) =>{ 
    console.error(err.stack);
    res.status(err.status || 500).json({error: err.message || "Internal Server Error"});
})

module.exports = app