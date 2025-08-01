const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/User");

// ========== Register ==========

// Show register form
router.get("/register", (req, res) => {
  res.render("auth/register");
});

// Handle register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email });

    const registeredUser = await User.register(user, password);

    req.login(registeredUser, (err) => {
      if (err) {
        req.flash("error", "Login after registration failed.");
        return res.redirect("/login");
      }
      req.flash("success", "Welcome to PinBoard App!");
      res.redirect("/");
    });
  } catch (err) {
    console.log("Registration error:", err.message);
    req.flash("error", err.message);
    res.redirect("/register");
  }
});

// ========== Login ==========

// Show login form
router.get("/login", (req, res) => {
  res.render("auth/login");
});

// Handle login
router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  (req, res) => {
    req.flash("success", `Welcome back, ${req.user.username}!`);
    const redirectUrl = req.session.returnTo || "/";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  }
);

// ========== Logout ==========

// Handle logout
router.post("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    req.flash("success", "You have been logged out.");
    res.redirect("/login");
  });
});

module.exports = router;
