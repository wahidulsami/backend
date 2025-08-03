import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
})


const uploadCloudinary = async (localfilePath) => {
    try {
        if (!localfilePath)
        return null;
            // file upload of cloudinary
         const Response =  await cloudinary.uploader.upload(localfilePath , {
                resource_type: "auto",})
            // file upload  successfully
            console.log("File uploaded successfully to Cloudinary" , Response.url);
            return Response;

    } catch (error) {
        fs.unlinkSync(localfilePath); // delete the file from local storage
        console.error("Error uploading file to Cloudinary:", error);
    }
}


export  {uploadCloudinary};;