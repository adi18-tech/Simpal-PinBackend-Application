const express = require('express');
const router = express.Router();
const Board = require('../models/Board');
const Pin = require('../models/Pin');
const User = require('../models/User');
const upload = require('../config/multer');
const { isLoggedIn, isBoardOwner } = require('../middlware');



// -------------------- Boards Routes --------------------

// - List all boards
router.get('/', async (req, res) => {
  const boards = await Board.find().populate('user');
  res.render('boards/index', { boards });
});

// - Form to create a new board
router.get('/new', isLoggedIn, (req, res) => {
  res.render('boards/new');
});

// Create a new board
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

//   - Form to edit a board
router.get('/:id/edit', isLoggedIn, isBoardOwner, async (req, res) => {
  const board = await Board.findById(req.params.id);
  res.render('boards/edit', { board });
});

//  - Update board
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

// - Delete board
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
