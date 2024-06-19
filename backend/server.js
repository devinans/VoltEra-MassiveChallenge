// database lebih baru
const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// Create an instance of express
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // replace with your MySQL username
  password: "", // replace with your MySQL password
  database: "voltera_db", // replace with your database name
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("MySQL connected...");
});

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Routes

// Fetch all submissions from pengajuansewa
app.get("/api/submissions", (req, res) => {
  const sql = "SELECT * FROM pengajuansewa";
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

// Fetch all rentals from nyewasepeda
app.get("/api/rentals", (req, res) => {
  const sql = "SELECT * FROM nyewasepeda";
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

// Submit new "pengajuansewa" data
app.post(
  "/api/pengajuansewa/submit",
  upload.single("foto_sepeda"),
  (req, res) => {
    const {
      nama_lengkap,
      nama_penyewaan,
      no_telepon,
      email,
      area_sewa,
      jenis_sewa,
      durasi_sewa,
    } = req.body;
    const foto_sepeda = req.file ? req.file.filename : null;

    const sql = `
    INSERT INTO pengajuansewa (nama_lengkap, nama_penyewaan, no_telepon, email, area_sewa, jenis_sewa, durasi_sewa, foto_sepeda)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
    const values = [
      nama_lengkap,
      nama_penyewaan,
      no_telepon,
      email,
      area_sewa,
      jenis_sewa,
      durasi_sewa,
      foto_sepeda,
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
  }
);

// Submit new rental data to nyewasepeda
app.post("/submit-form", (req, res) => {
  const {
    nama_lengkap,
    nik,
    tempat_tanggal_lahir,
    alamat,
    no_telepon,
    area_sewa,
    jenis_sewa,
    tanggal_sewa,
    durasi_sewa,
    total_harga_sewa,
    foto_ktp,
  } = req.body;

  const sql =
    "INSERT INTO nyewasepeda (nama_lengkap, nik, tempat_tanggal_lahir, alamat, no_telepon, area_sewa, jenis_sewa, tanggal_sewa, durasi_sewa, total_harga_sewa, foto_ktp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const values = [
    nama_lengkap,
    nik,
    tempat_tanggal_lahir,
    alamat,
    no_telepon,
    area_sewa,
    jenis_sewa,
    tanggal_sewa,
    durasi_sewa,
    total_harga_sewa,
    foto_ktp,
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

// Update rental data in pengajuansewa
app.post("/api/submissions/update", upload.single("foto_ktp"), (req, res) => {
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
    "UPDATE pengajuansewa SET nama_lengkap = ?, nama_penyewaan = ?,  no_telepon = ?, email = ? , area_sewa = ?, jenis_sewa = ?, durasi_sewa = ?, foto_sepeda = ? WHERE id = ?";
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

// Update rental data in nyewasepeda
app.post("/api/rentals/update", upload.single("foto_ktp"), (req, res) => {
  const {
    id,
    nama_lengkap,
    nik,
    tempat_tanggal_lahir,
    alamat,
    no_telepon,
    area_sewa,
    jenis_sewa,
    tanggal_sewa,
    durasi_sewa,
    total_harga_sewa,
  } = req.body;
  const foto_ktp = req.file ? req.file.filename : req.body.foto_ktp;

  const sql =
    "UPDATE nyewasepeda SET nama_lengkap = ?, nik = ?, tempat_tanggal_lahir = ?, alamat = ?, no_telepon = ?, area_sewa = ?, jenis_sewa = ?, tanggal_sewa = ?, durasi_sewa = ?, total_harga_sewa = ?, foto_ktp = ? WHERE id = ?";
  const values = [
    nama_lengkap,
    nik,
    tempat_tanggal_lahir,
    alamat,
    no_telepon,
    area_sewa,
    jenis_sewa,
    tanggal_sewa,
    durasi_sewa,
    total_harga_sewa,
    foto_ktp,
    id,
  ];

  db.query(sql, values, (err, result) => {
    if (err) throw err;
    res.send("Rental data updated...");
  });
});

// Delete rental data from pengajuansewa
app.post("/api/submissions/delete", (req, res) => {
  const { id } = req.body;
  const sql = "DELETE FROM pengajuansewa WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.send("Rental deleted successfully");
  });
});

// Delete rental data from nyewasepeda
app.post("/api/rentals/delete", (req, res) => {
  const { id } = req.body;
  const sql = "DELETE FROM nyewasepeda WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.send("Rental data deleted...");
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});