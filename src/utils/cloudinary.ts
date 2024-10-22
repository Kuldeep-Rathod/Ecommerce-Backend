// import { v2 as cloudinary } from "cloudinary";
// import fs from "fs";
// import { TryCatch } from "../middlewares/error.js";
// import errorHandler from "./utilityClass.js";
// import dotenv from "dotenv";

// dotenv.config();

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const uploadOnCloudinary = TryCatch(async (localFilePath: string) => {
//     if (!localFilePath) {
//         throw new errorHandler("File path is required", 499);
//     }

//     console.log(localFilePath);

//     const uploadResult = await cloudinary.uploader.upload(localFilePath, {
//         resource_type: "auto",
//     });

//     if (!uploadResult || !uploadResult.url) {
//         throw new errorHandler("Failed to retrieve the uploaded file URL", 500);
//     }

//     // Remove local file after upload if needed
//     if (fs.existsSync(localFilePath)) {
//         fs.unlinkSync(localFilePath);
//     }

//     return uploadResult.url;
// });

// export default uploadOnCloudinary;
