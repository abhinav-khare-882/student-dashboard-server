const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    studentID: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    image: {
      type: String,
      validate: {
        validator: function (v) {
          return /^https?:\/\/res\.cloudinary\.com\/.*\.(jpg|jpeg|png|gif|webp)$/.test(
            v
          );
        },
        message: "Invalid Cloudinary image URL format",
      },
    },
    subjects: {
      type: [String],
      required: true,
      validate: {
        validator: function (arr) {
          return arr.length > 0;
        },
        message: "At least one subject is required",
      },
    },
  },
  { timestamps: true }
);

const StudentModel = mongoose.model("Student", StudentSchema);
module.exports = StudentModel;
