import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import deliveryImage from './assets/delivery.png';

function App() {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Check on mount if a file is already uploaded
  useEffect(() => {
    const checkIfFileExists = async () => {
      try {
        const res = await axios.get("http://localhost:5000/file-exists");
        setFileUploaded(res.data.exists); // true or false
        if (res.data.exists) {
          setSuccessMessage("You already uploaded the Excel file to your database.");
        }
      } catch (err) {
        console.error("Error checking file existence", err);
      }
    };

    checkIfFileExists();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      try {
        await axios.post("http://localhost:5000/upload", { data });
        setSuccessMessage("Your Excel file is uploaded to the database.");
        setFileUploaded(true);
      } catch (err) {
        console.error("Failed to save to DB", err);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleDelete = async () => {
  const confirmDelete = window.confirm("Are you sure you want to delete the uploaded Excel data from the database?");
  if (!confirmDelete) return;

  try {
    await axios.delete("http://localhost:5000/delete-excel");
    setFileUploaded(false);
    setSuccessMessage("");
  } catch (err) {
    console.error("Failed to delete file from DB", err);
  }
};


  return (
    <div className="container text-center py-5">
      <img src={deliveryImage} alt="Delivery" />
      <h1 className="mb-4"><b>DSY 1</b></h1>
      <h1 className="mb-4">VSA - Position 4</h1>
      <div class="alert alert-info" role="alert">
        Please upload your excel file for VSA Positon 4 
      </div>

      {fileUploaded ? (
  <>
    <div className="alert alert-warning">{successMessage}</div>
    <button className="btn btn-danger" onClick={handleDelete}>
      Delete File from Database
    </button>
  </>
) : (
  <>
    <input
      type="file"
      accept=".xlsx, .xls"
      onChange={handleFileUpload}
      className="form-control mb-4"
    />
    {successMessage && (
      <div className="alert alert-success mt-3">{successMessage}</div>
    )}
  </>
)}

      
    </div>

    
  );
}

export default App;
