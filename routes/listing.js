const express = require('express');
const router = express.Router();
const { listingSchema } = require("../schema.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const {isLoggedIn} = require('../middleware.js');
const {isOwner} = require('../middleware.js');

const listingController = require("../controller/listings.js");

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((e) => e.message).join(",");
        throw new ExpressError(400, error);
    }else{
        next();
    }
}

// INDEX ROUTE
router.get("/", wrapAsync(listingController.index));
// CREATE NEW ROUTE
router.get("/new", isLoggedIn, (req, res) => {
    res.render('listings/new.ejs')
});
// SHOW ROUTE
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({path: "reviews", 
        populate: {
          path: "author"
        },
  })
      .populate("owner");
    if (!listing) {
      req.flash("error", "Listing you requested for does not exits");
    }
    res.render("listings/show.ejs", { listing });
  })
);

// SAVED NEW
router.post(
  "/add",
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
  })
); 

// EDIT ROUTE
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  })
);

// UPDATE ROUTE
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    req.flash("success", "Listing updated successfully");
    res.redirect(`/listings/${id}`);
  })
);

// DELETE ROUTE
router.delete("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted");
    res.redirect('/listings');
}));

module.exports = router;