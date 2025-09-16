const Pin = require("./models/Pin");
const Board = require("./models/Board");

const multer = require("multer");
const fs = require("fs");
const { uploadToCloudinary } = require("./config/cloudinary");

// ====== Auth Middlewares ======

// 🔐 Check if user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  req.flash("error", "You must be logged in to do that.");
  res.redirect("/login");
}

// 🛡️ Check if current user owns the board
async function isBoardOwner(req, res, next) {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      req.flash("error", "Board not found.");
      return res.redirect("/boards");
    }
    if (!board.user.equals(req.user._id)) {
      req.flash("error", "You do not have permission to do that.");
      return res.redirect("/boards");
    }
    next();
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong.");
    res.redirect("/boards");
  }
}

// 🖼️ Check if current user owns the pin
async function isPinOwner(req, res, next) {
  try {
    const pin = await Pin.findById(req.params.pinId);
    if (!pin) {
      req.flash("error", "Pin not found");
      return res.redirect("back");
    }
    if (!pin.user.equals(req.user._id)) {
      req.flash("error", "You do not have permission to do that.");
      return res.redirect(`/boards/${req.params.boardId}`);
    }
    next();
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong");
    res.redirect("back");
  }
}

// ====== Upload Middleware ======

// Multer temp storage
const upload = multer({ dest: "uploads/" });

// Middleware wrapper for Cloudinary upload
const uploadMiddleware = (fieldName) => {
  return [
    upload.single(fieldName), // Step 1: handle file with Multer
    async (req, res, next) => {
      try {
        if (!req.file) return next();

        // Step 2: Upload to Cloudinary
        const result = await uploadToCloudinary(req.file.path, "pins");

        // Step 3: Attach URL to req
        req.fileUrl = result;

        // Step 4: Remove local temp file
        fs.unlinkSync(req.file.path);

        next();
      } catch (err) {
        console.error("Upload Middleware Error:", err);
        req.flash("error", "File upload failed");
        return res.redirect("back");
      }
    },
  ];
};

module.exports = {
  isLoggedIn,
  isBoardOwner,
  isPinOwner,
  uploadMiddleware,
};
