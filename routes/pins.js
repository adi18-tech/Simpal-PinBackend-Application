const express = require('express');
const router = express.Router({ mergeParams: true });

const Board = require('../models/Board');
const Pin = require('../models/Pin');
const upload = require('../config/multer');
 
const { isLoggedIn, isPinOwner } = require('../middlware');

 
// ======= NEW PIN FORM =========
router.get('/new', isLoggedIn, async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);
    if (!board) {
      req.flash('error', 'Board not found');
      return res.redirect('/boards');
    }
    res.render('pins/new', { board });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Server error while loading form');
    res.redirect('/boards');
  }
});

// ======= CREATE PIN =========
router.post('/', isLoggedIn, upload.single('image'), async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);
    if (!board) {
      req.flash('error', 'Board not found');
      return res.redirect('/boards');
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const pin = new Pin({
      title: req.body.title,
      description: req.body.description,
      image: imagePath,
      board: board._id,
      user: req.user._id
    });

    await pin.save();
    board.pins.push(pin._id);
    await board.save();

    req.flash('success', 'Pin added successfully');
    res.redirect(`/boards/${board._id}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to add pin');
    res.redirect(`/boards/${req.params.boardId}`);
  }
});

// ======= SHOW EDIT FORM =========
router.get('/:pinId/edit', isLoggedIn, isPinOwner, async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.pinId);
    if (!pin) {
      req.flash('error', 'Pin not found');
      return res.redirect(`/boards/${req.params.boardId}`);
    }

    res.render('pins/edit', { pin, boardId: req.params.boardId });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Server error');
    res.redirect(`/boards/${req.params.boardId}`);
  }
});

// ======= UPDATE PIN =========
router.put('/:pinId', isLoggedIn, isPinOwner, upload.single('image'), async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.pinId);
    if (!pin) {
      req.flash('error', 'Pin not found');
      return res.redirect(`/boards/${req.params.boardId}`);
    }

    pin.title = req.body.title;
    pin.description = req.body.description;

    if (req.file) {
      pin.image = `/uploads/${req.file.filename}`;
    }

    await pin.save();

    req.flash('success', 'Pin updated successfully');
    res.redirect(`/boards/${req.params.boardId}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to update pin');
    res.redirect(`/boards/${req.params.boardId}`);
  }
});

// ======= DELETE PIN =========
router.delete('/:pinId', isLoggedIn, isPinOwner, async (req, res) => {
  try {
    const { boardId, pinId } = req.params;

    await Board.findByIdAndUpdate(boardId, { $pull: { pins: pinId } });
    await Pin.findByIdAndDelete(pinId);

    req.flash('success', 'Pin deleted successfully');
    res.redirect(`/boards/${boardId}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to delete pin');
    res.redirect(`/boards/${req.params.boardId}`);
  }
});

module.exports = router;
