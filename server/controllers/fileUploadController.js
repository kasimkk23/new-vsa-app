const ExcelJS = require("exceljs");
const db = require("../utils/db");

exports.uploadExcel = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    const worksheet = workbook.worksheets[0];

    const rows = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header

      const [company_name, car_id, plate_number, status] = row.values.slice(1);
      rows.push([company_name, car_id, plate_number, status || ""]);
    });

    const connection = await db.getConnection();

    for (const [company_name, car_id, plate_number, status] of rows) {
      await connection.execute(
        `INSERT INTO cars (company_name, car_id, plate_number, status)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         company_name = VALUES(company_name),
         car_id = VALUES(car_id),
         status = VALUES(status)`,
        [company_name, car_id, plate_number, status]
      );
    }

    connection.release();
    res.status(200).json({ message: "File processed successfully" });
  } catch (error) {
    console.error("Excel Upload Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// GET /api/car/:plate_number
exports.getCarByPlate = async (req, res) => {
    const { plate_number } = req.params;
  
    try {
      const connection = await db.getConnection();
      const [rows] = await connection.execute(
        "SELECT * FROM cars WHERE plate_number = ?",
        [plate_number]
      );
      connection.release();
  
      if (rows.length === 0) {
        return res.status(404).json({ error: "Car not found" });
      }
  
      res.json(rows[0]);
    } catch (error) {
      console.error("Search Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  
  // PUT /api/car/:plate_number
  exports.updateCarStatus = async (req, res) => {
    const { plate_number } = req.params;
    const { status } = req.body;
  
    try {
      const connection = await db.getConnection();
  
      const [result] = await connection.execute(
        "UPDATE cars SET status = ? WHERE plate_number = ?",
        [status, plate_number]
      );
      connection.release();
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Car not found" });
      }
  
      res.json({ message: "Status updated successfully" });
    } catch (error) {
      console.error("Update Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  
