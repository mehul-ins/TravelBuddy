const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
  // Define any additional fields you want here, e.g.,
  email: {
    type: String,
    required: true,
  },
});

// Apply passport-local-mongoose plugin to the schema
UserSchema.plugin(passportLocalMongoose);

// Compile the schema into a model
const User = mongoose.model("User", UserSchema);

// Export the model
module.exports = User;
