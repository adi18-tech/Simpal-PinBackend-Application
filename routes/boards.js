const express = require('express');
const router = express.Router();
const Board = require('../models/Board');
const Pin = require('../models/Pin');
const User = require('../models/User');
const upload = require('../config/multer');

// 🔐 Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  req.flash('error', 'You must be logged in to do that.');
  res.redirect('/login');
}

// 🛡️ Middleware to check if current user owns the board
async function isBoardOwner(req, res, next) {
  const board = await Board.findById(req.params.id);
  if (!board) {
    req.flash('error', 'Board not found.');
    return res.redirect('/boards');
  }
  if (!board.user.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to do that.');
    return res.redirect('/boards');
  }
  next();
}

// -------------------- Boards Routes --------------------

// GET /boards - List all boards
router.get('/', async (req, res) => {
  const boards = await Board.find().populate('user');
  res.render('boards/index', { boards });
});

// GET /boards/new - Form to create a new board
router.get('/new', isLoggedIn, (req, res) => {
  res.render('boards/new');
});

// POST /boards - Create a new board
router.post('/', isLoggedIn, async (req, res) => {
  try {
    const { name, description } = req.body;
    const board = new Board({ name, description, user: req.user._id });
    await board.save();
    req.flash('success', 'Board created successfully!');
    res.redirect('/boards');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to create board.');
    res.redirect('/boards');
  }
});

// GET /boards/:id/edit - Form to edit a board
router.get('/:id/edit', isLoggedIn, isBoardOwner, async (req, res) => {
  const board = await Board.findById(req.params.id);
  res.render('boards/edit', { board });
});

// PUT /boards/:id - Update board
router.put('/:id', isLoggedIn, isBoardOwner, async (req, res) => {
  try {
    const { name, description } = req.body;
    await Board.findByIdAndUpdate(req.params.id, { name, description });
    req.flash('success', 'Board updated successfully!');
    res.redirect('/boards');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to update board.');
    res.redirect('/boards');
  }
});

// DELETE /boards/:id - Delete board
router.delete('/:id', isLoggedIn, isBoardOwner, async (req, res) => {
  try {
    await Board.findByIdAndDelete(req.params.id);
    req.flash('success', 'Board deleted successfully!');
    res.redirect('/boards');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to delete board.');
    res.redirect('/boards');
  }
});

// GET /boards/:id - Show board with its pins
router.get('/:id', async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('user')
      .populate({
        path: 'pins',
        populate: { path: 'user' }
      });

    if (!board) {
      req.flash('error', 'Board not found.');
      return res.redirect('/boards');
    }

    res.render('boards/show', { board });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Server error loading board.');
    res.redirect('/boards');
  }
});

module.exports = router;
