 



//🔐 Middleware to check if user is logged in

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

module.exports = {
  isLoggedIn,isBoardOwner
};