 const Pin = require('./models/Pin');
 const Board = require('./models/Board');

//🔐 Middleware to check if user is logged 
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

 


 

// ======= Middleware to check if current user is the owner of the pin =========
async function isPinOwner(req, res, next) {
  try {
    const pin = await Pin.findById(req.params.pinId);
    if (!pin) {
      req.flash('error', 'Pin not found');
      return res.redirect('back');
    }

    if (!pin.user.equals(req.user._id)) {
      req.flash('error', 'You do not have permission to do that.');
      return res.redirect(`/boards/${req.params.boardId}`);
    }

    next();
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong');
    res.redirect('back');
  }
}

module.exports = {
  isLoggedIn,
  isBoardOwner,
  isPinOwner
};