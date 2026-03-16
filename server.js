import express from "express";
import multer from "multer";
import path from "path";
import cors from "cors";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3002;

// In-memory storage for vehicle images (in production, use a database)
const vehicleImages = new Map();

// Enable CORS for frontend
app.use(cors());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Serve uploaded images statically
app.use("/uploads", express.static(uploadsDir));

// Upload endpoint
app.post("/upload", upload.array("images", 5), (req, res) => {
  try {
    const files = req.files || [];
    const vehicleId = req.body.vehicleId; // Get vehicle ID from form data

    if (!vehicleId) {
      return res.status(400).json({
        success: false,
        error: "Vehicle ID is required",
      });
    }

    const imageUrls = files.map((file) => `/uploads/${file.filename}`);

    // Store the mapping
    vehicleImages.set(vehicleId, imageUrls);

    res.json({
      success: true,
      images: imageUrls,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get images for a specific vehicle
app.get("/api/vehicle/:id/images", (req, res) => {
  const vehicleId = req.params.id;
  const images = vehicleImages.get(vehicleId) || [];

  res.json({
    success: true,
    images: images,
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Image server running on http://localhost:${PORT}`);
  console.log(`Uploads served from: http://localhost:${PORT}/uploads`);
  console.log(`Upload endpoint: POST http://localhost:${PORT}/upload`);
});
