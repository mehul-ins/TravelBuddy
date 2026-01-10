const express = require('express');
const router = express.Router({mergeParams: true});
const { reviewSchema } = require("../schema.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { isLoggedIn, isReviewAuthor } = require("../middleware.js");
const reviewController = require("../controller/review.js");

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((e) => e.message).join(",");
    throw new ExpressError(400, error);
  } else {
    next();
  }
};

// POST REVIEW - Create new review
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.create)
);

// DELETE REVIEW - Remove review
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewController.delete)
);

module.exports = router;