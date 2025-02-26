require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const StudentModel = require("./models/Students");
const subjectsRoutes = require("./routes/Subject");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/subjects", subjectsRoutes);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "student_images",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage: storage });

app.get("/students", async (req, res) => {
  try {
    const students = await StudentModel.find();
    res.json(students);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching students", details: err.message });
  }
});

app.get("/students/:id", async (req, res) => {
  try {
    const student = await StudentModel.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

app.post("/students", upload.single("image"), async (req, res) => {
  try {
    const { firstName, lastName, studentID, email, phone, address, subjects } =
      req.body;

    const subjectsArray = subjects ? subjects.split(",") : [];
    const imageUrl = req.file ? req.file.path : "";
    const student = await StudentModel.create({
      firstName,
      lastName,
      studentID,
      email,
      phone,
      address,
      subjects: subjectsArray,
      image: imageUrl,
    });

    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/students/:id", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      studentID,
      email,
      phone,
      address,
      image,
      subjects,
    } = req.body;

    console.log("Received Update Request for ID:", req.params.id);
    console.log("Update Data:", req.body);

    if (
      !firstName ||
      !lastName ||
      !studentID ||
      !email ||
      !phone ||
      !address ||
      !subjects
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (!Array.isArray(subjects)) {
      return res.status(400).json({ error: "Subjects must be an array." });
    }

    const updatedStudent = await StudentModel.findByIdAndUpdate(
      req.params.id,
      {
        firstName,
        lastName,
        studentID,
        email,
        phone,
        address,
        image,
        subjects,
      },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(updatedStudent);
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/students/:id", async (req, res) => {
  try {
    const deletedStudent = await StudentModel.findByIdAndDelete(req.params.id);
    if (!deletedStudent)
      return res.status(404).json({ error: "Student not found" });
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete student", details: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
