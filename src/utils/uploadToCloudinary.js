const cloudinary = require("cloudinary");
const streamifier = require("streamifier");


const uploadToCloudinary = (buffer) => {
    return new Promise((resolve,reject)=>{
        const uploadStream = cloudinary.uploader.upload_stream(
            {folder:"ecommerce-products"},
        (error,result)=>{
            if(error){
                reject(error);
            }
            else{
                resolve(result);
            }
        });
        streamifier.createReadStream(buffer).pipe(uploadStream);
    })
}

module.exports =uploadToCloudinary;