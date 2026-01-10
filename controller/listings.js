const Listing = require("../models/listing.js");

// INDEX ROUTE - Display all listings
module.exports.index = async(req, res) => {
    const { search } = req.query;
    let allListings;
    let searchQuery = '';
    
    if (search && search.trim()) {
        searchQuery = search.trim();
        // Search across title, location, country, and description
        const searchRegex = new RegExp(searchQuery, 'i'); // case-insensitive
        allListings = await Listing.find({
            $or: [
                { title: searchRegex },
                { location: searchRegex },
                { country: searchRegex },
                { description: searchRegex }
            ]
        });
    } else {
        allListings = await Listing.find({});
    }
    
    res.render("listings/index.ejs", { allListings, searchQuery });
};

// NEW ROUTE - Show form to create new listing
module.exports.newForm = (req, res) => {
    res.render('listings/new.ejs');
};

// CREATE ROUTE - Save new listing to database
module.exports.create = async(req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    
    if (req.file) {
        newListing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }
    
    await newListing.save();
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
};

// SHOW ROUTE - Display single listing with reviews
module.exports.show = async(req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews", 
            populate: { path: "author" }
        })
        .populate("owner");
    
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

// EDIT ROUTE - Show form to edit listing
module.exports.editForm = async(req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    if (typeof req.file !== "undefined") {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    await listing.save();
    }
    res.render("listings/edit.ejs", { listing });
};

// UPDATE ROUTE - Update listing in database
module.exports.update = async(req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing updated successfully");
    res.redirect(`/listings/${id}`);
};

// DELETE ROUTE - Remove listing from database
module.exports.delete = async(req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted");
    res.redirect('/listings');
};