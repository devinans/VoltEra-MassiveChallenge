const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
// const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "voltera_db",
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("MySQL connected...");
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Endpoint to get all rentals
app.get("/api/rentals", (req, res) => {
  const sql = "SELECT * FROM pengajuansewa";
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// PENGAJUAN SEWA START HERE //
// Endpoint to submit new rental data
app.post("/submit-form", (req, res) => {
  const {
    nama_lengkap,
    nama_penyewaan,
    no_telepon,
    email,
    area_sewa,
    jenis_sewa,
    durasi_sewa,
    foto_sepeda, // This should be handled with file upload in a real scenario
  } = req.body;

  const sql =
    "INSERT INTO pengajuansewa (nama_lengkap, nama_penyewaan, no_telepon, email, area_sewa, jenis_sewa, durasi_sewa, foto_sepeda) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  const values = [
    nama_lengkap,
    nama_penyewaan,
    no_telepon,
    email,
    area_sewa,
    jenis_sewa,
    durasi_sewa,
    foto_sepeda, // Replace with actual path after handling file upload
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Terjadi kesalahan saat menyimpan data.",
        error: err,
      });
    }
    res.status(200).json({ message: "Data berhasil disimpan." });
  });
});

// Endpoint to update rental data
app.post("/api/rentals/update", upload.single("foto_sepeda"), (req, res) => {
  const {
    id,
    nama_lengkap,
    nama_penyewaan,
    no_telepon,
    email,
    area_sewa,
    jenis_sewa,
    durasi_sewa,
  } = req.body;
  const foto_sepeda = req.file ? req.file.filename : req.body.foto_sepeda;

  const sql =
    "UPDATE pengajuansewa SET nama_lengkap = ?, nama_penyewaan = ?, no_telepon = ?, email = ?, area_sewa = ?, jenis_sewa = ?, durasi_sewa = ?, foto_sepeda = ? WHERE id = ?";
  const values = [
    nama_lengkap,
    nama_penyewaan,
    no_telepon,
    email,
    area_sewa,
    jenis_sewa,
    durasi_sewa,
    foto_sepeda,
    id,
  ];

  db.query(sql, values, (err, result) => {
    if (err) throw err;
    res.send("Rental data updated...");
  });
});

// Endpoint to delete rental data
app.post("/api/rentals/delete", (req, res) => {
  const { id } = req.body;
  const sql = "DELETE FROM pengajuansewa WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.send("Rental data deleted...");
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});