const Listing = require('./models/listing.js');
const Review = require('./models/review.js');


module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "Log in to proceed");
        return res.redirect("/login")
    }

    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    // 'owner' is an ObjectId unless populated; compare ObjectIds directly
    if (!listing.owner || !listing.owner.equals(req.user._id)) {
      req.flash("error", "You don't have access to edit this listing");
      return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);

  if (!review || !review.author || !review.author.equals(req.user._id)) {
    req.flash("error", "You are not the author");
    return res.redirect(`/listings/${id}`);
  }
  next();
};