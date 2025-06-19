const express = require("express");
const upload = require("../utils/multer");
const { uploadExcel } = require("../controllers/fileUploadController");

const router = express.Router();

router.post("/upload", upload.single("file"), uploadExcel);

module.exports = router;

const {
    uploadExcel,
    getCarByPlate,
    updateCarStatus,
  } = require("../controllers/fileUploadController");
  
  router.post("/upload", upload.single("file"), uploadExcel);
  router.get("/car/:plate_number", getCarByPlate);
  router.put("/car/:plate_number", updateCarStatus);
  