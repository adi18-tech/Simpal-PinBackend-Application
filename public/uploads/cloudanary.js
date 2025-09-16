// cloudinary.js
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

dotenv.config(); // Load CLOUDINARY_* keys from .env file

// 🔹 Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🔹 Function to upload a file
const uploadToCloudinary = async (filePath, folderName = "uploads") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folderName, // optional: keeps files organized in a folder
    });
    console.log(" Uploaded:", result.secure_url);
    return result.secure_url; // returns file URL
  } catch (error) {
    console.error(" Cloudinary Upload Error:", error);
    throw error;
  }
};

module.exports = { uploadToCloudinary };
