// cloudinary.js
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// file can be a path (string) or a Buffer. Set isBuffer = true for Buffer
const uploadToCloudinary = (file, folderName = "pins", isBuffer = false) => {
  return new Promise((resolve, reject) => {
    if (isBuffer) {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: folderName },
        (error, result) => {
          if (error) return reject(error);
          return resolve(result.secure_url);
        }
      );
      streamifier.createReadStream(file).pipe(uploadStream);
    } else {
      cloudinary.uploader
        .upload(file, { folder: folderName })
        .then((res) => resolve(res.secure_url))
        .catch((err) => reject(err));
    }
  });
};

module.exports = { uploadToCloudinary };
