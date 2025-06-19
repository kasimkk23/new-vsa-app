const express = require("express");
const QRCode = require('qrcode'); // Import QRCode package
const cors = require("cors");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));


const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL");
});

// Endpoint to upload and save Excel data to DB
app.post("/upload", async (req, res) => {
  const cars = req.body.data;

  if (!cars || !Array.isArray(cars)) {
    return res.status(400).json({ error: "Invalid data format" });
  }

  const insertPromises = cars.map((car) => {
    return new Promise((resolve, reject) => {
      db.query(
        "REPLACE INTO cars (plate_number, car_id, company_name, status) VALUES (?, ?, ?, ?)",
        [car.plate_number,car.car_id, car.company_name, car.status === "" ? null : car.status],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  });


  try {
    await Promise.all(insertPromises);
    res.status(200).json({ message: "Data uploaded successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to upload data" });
  }
});

  app.get("/cars", (req, res) => {
  db.query("SELECT * FROM cars", (err, rows) => {
    if (err) {
      console.error("Fetch error:", err);
      res.status(500).json({ error: "Failed to fetch cars" });
    } else {
      res.status(200).json(rows);
    }
  });
});


// Endpoint to update status
app.post("/update-status", (req, res) => {
  const { plate_number, status } = req.body;
  db.query(
    "UPDATE cars SET status = ? WHERE plate_number = ?",
    [status, plate_number],
    (err, result) => {
      if (err) {
        console.error("Update error:", err);
        res.status(500).json({ error: "Failed to update status" });
      } else {
        res.status(200).json({ message: "Status updated" });
      }
    }
  );
});

// Endpoint to download updated Excel
app.get("/download-excel", (req, res) => {
  db.query("SELECT * FROM cars", (err, results) => {
    if (err) {
      console.error("Excel download error:", err);
      return res.status(500).json({ error: "Failed to retrieve data" });
    }
    res.json(results);
  });
});

// Check if Excel data exists
app.get('/file-status', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT COUNT(*) AS count FROM cars");
    res.json({ exists: rows[0].count > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error checking file status" });
  }
});

// Delete Excel data
app.delete('/delete-excel', (req, res) => {
  db.query('DELETE FROM cars', (err, result) => {
    if (err) {
      console.error('Error deleting Excel data:', err);
      return res.status(500).json({ message: 'Failed to delete Excel data' });
    }
    res.status(200).json({ message: 'Excel data deleted successfully' });
  });
});



// Example route in your Express server
app.get("/file-exists", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT COUNT(*) AS count FROM cars");
    res.json({ exists: rows[0].count > 0 });
  } catch (err) {
    res.status(500).json({ error: "Failed to check" });
  }
});



app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
