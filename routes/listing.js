const express = require('express');
const router = express.Router();
const { listingSchema } = require("../schema.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const {isLoggedIn} = require('../middleware.js');
const {isOwner} = require('../middleware.js');
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });


const listingController = require("../controller/listings.js");

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((e) => e.message).join(",");
        throw new ExpressError(400, error);
    }else{
        next();
    }
};

// INDEX + CREATE
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.create)
  );

// NEW ROUTE - Show form to create new listing (must be before /:id)
router.get("/new", isLoggedIn, wrapAsync(listingController.newForm));

// SHOW + UPDATE + DELETE
router
  .route("/:id")
  .get(wrapAsync(listingController.show))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.update)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.delete));

// EDIT ROUTE - Show form to edit listing
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.editForm)
);

module.exports = router;