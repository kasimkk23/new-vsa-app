import React, { useEffect, useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import deliveryImage from './assets/delivery.png';


const CarPage = () => {
  const [cars, setCars] = useState([]);
  const [plateNumberInput, setPlateNumberInput] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [matchedCar, setMatchedCar] = useState(null);
  const [statusInput, setStatusInput] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const carsPerPage = 10;

  useEffect(() => {
    axios
      .get("http://localhost:5000/cars")
      .then((res) => setCars(res.data))
      .catch((err) => console.error("Error fetching cars:", err));
  }, []);

  // Stats
  const totalCars = cars.length;
  const inspectedCars = cars.filter((car) => car.status && car.status.trim() !== "").length;
  const remainingCars = totalCars - inspectedCars;

  const handlePlateInputChange = (e) => {
    const input = e.target.value;
    setPlateNumberInput(input);

    if (input === "") {
      setFilteredSuggestions([]);
      setMatchedCar(null);
      return;
    }

    const suggestions = cars.filter(
      (car) =>
        car.plate_number.toLowerCase().includes(input.toLowerCase()) ||
        car.company_name.toLowerCase().includes(input.toLowerCase())
    );

    setFilteredSuggestions(suggestions);

    const exactMatch = suggestions.find(
      (car) =>
        car.plate_number.toLowerCase() === input.toLowerCase() ||
        car.company_name.toLowerCase() === input.toLowerCase()
    );

    if (exactMatch) {
      setMatchedCar(exactMatch);
      setStatusInput(exactMatch.status || "");
      setFilteredSuggestions([]);
    } else {
      setMatchedCar(null);
    }
  };

  const handleSuggestionClick = (plate) => {
    setPlateNumberInput(plate);
    const match = cars.find(
      (car) =>
        car.plate_number.toLowerCase() === plate.toLowerCase() ||
        car.company_name.toLowerCase() === plate.toLowerCase()
    );
    setMatchedCar(match);
    setStatusInput(match.status || "");
    setFilteredSuggestions([]);
  };

  const handleStatusSubmit = async () => {
    if (!matchedCar) return;

    try {
      await axios.post("http://localhost:5000/update-status", {
        plate_number: matchedCar.plate_number,
        status: statusInput,
      });

      setSuccessMessage("Status updated successfully!");
      setTimeout(() => setSuccessMessage(""), 2000);

      const res = await axios.get("http://localhost:5000/cars");
      setCars(res.data);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Pagination logic
  const indexOfLastCar = currentPage * carsPerPage;
  const indexOfFirstCar = indexOfLastCar - carsPerPage;
  const currentCars = cars.slice(indexOfFirstCar, indexOfLastCar);
  const totalPages = Math.ceil(cars.length / carsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // Download updated Excel without QR codes
  const handleDownloadExcel = () => {
    const exportData = cars.map(({ car_id, plate_number, company_name, status }) => ({
      ID: car_id,
      "Plate Number": plate_number,
      Company: company_name,
      Status: status || ""
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cars");

    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });

    saveAs(blob, "cars_updated.xlsx");
  };






  // ------------------- Non-empty Status -----------------------

  const handleDownloadFilteredExcel = () => {
  // Filter cars with non-empty status
  const filteredData = cars
    .filter((car) => car.status && car.status.trim() !== "")
    .map(({ car_id, plate_number, company_name, status }) => ({
      ID: car_id,
      "Plate Number": plate_number,
      Company: company_name,
      Status: status,
    }));

  const worksheet = XLSX.utils.json_to_sheet(filteredData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Cars");

  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/octet-stream" });

  saveAs(blob, "cars_filtered_status.xlsx");
};

  // ------------------- Non-empty Status ------------




// ------------------- RETURNS -----------------------
  return (
    <div className="container mt-5">
      <img src={deliveryImage} alt="Delivery" />
            <h1 className="mb-4"><b>DSY 1</b></h1>
            <h1 className="mb-4">VSA - Position 4</h1>

      <input
        type="text"
        placeholder="Search by Plate Number or Company Name"
        className="form-control mb-2"
        value={plateNumberInput}
        onChange={handlePlateInputChange}
      />

      {filteredSuggestions.length > 0 && (
        <ul className="list-group mb-3">
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={index}
              className="list-group-item"
              onClick={() => handleSuggestionClick(suggestion.plate_number)}
              style={{ cursor: "pointer" }}
            >
              {suggestion.plate_number} – {suggestion.company_name}
            </li>
          ))}
        </ul>
      )}

      {matchedCar && (
        <div className="mb-4">
          <h5>Company: {matchedCar.company_name}</h5>

          {matchedCar.car_id && (
            <div className="mt-3">
              <h6>QR Code:</h6>
              <QRCodeCanvas
                value={matchedCar.car_id.toString()}
                size={150}
                level="H"
                includeMargin={true}
              />
            </div>
          )}

          <select
            className="form-select mt-3"
            value={statusInput}
            onChange={(e) => setStatusInput(e.target.value)}
          >
            <option value="">Select Status</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Grounded</option>
            <option value="Pending">Pending</option>
          </select>

          <button className="btn btn-primary mt-2" onClick={handleStatusSubmit}>
            Submit Status
          </button>

          {successMessage && (
            <div className="text-success mt-2">{successMessage}</div>
          )}
        </div>
      )}

      <h4 className="mb-4">Car Inspection Summary</h4>
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-white bg-primary">
            <div className="card-body">
              <h5 className="card-title">Total Cars</h5>
              <p className="card-text fs-4">{totalCars}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-success">
            <div className="card-body">
              <h5 className="card-title">Inspected </h5>
              <p className="card-text fs-4">{inspectedCars}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-warning">
            <div className="card-body">
              <h5 className="card-title">Remaining</h5>
              <p className="card-text fs-4">{remainingCars}</p>
            </div>
          </div>
        </div>
      </div>

      <hr />

      {/* Download Excel Button */}
      <button className="btn btn-success mb-3" onClick={handleDownloadExcel}>
        Download Updated Excel
      </button>

      {/* Download Excel Button non-empty status*/}
      <button
        className="btn btn-warning mb-3 ms-2"
        onClick={handleDownloadFilteredExcel}
        >
        Download Only Inspected Cars
      </button>


      <h3>All Cars</h3>
      <div className="table-responsive">
        <table className="table table-bordered table-hover mt-3">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Plate Number</th>
              <th>Company</th>
              <th>Status</th>
              <th>QR Code</th>
            </tr>
          </thead>
          <tbody>
            {currentCars.map((car) => (
              <tr key={car.car_id}>
                <td>{car.car_id}</td>
                <td>{car.plate_number}</td>
                <td>{car.company_name}</td>
                <td>{car.status}</td>
                <td>
                  <QRCodeCanvas value={car.car_id.toString()} size={64} level="H" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between mt-3">
        <button
          className="btn btn-secondary"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="align-self-center">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="btn btn-secondary"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CarPage;