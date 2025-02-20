import React, { useState } from "react";
import { Wheel } from "react-custom-roulette";
import axios from "axios";
import { API_URL } from "../config";

const data = [
  { option: "Pan de Ajo" },
  { option: "Cheesesticks" },
  { option: "Pizza Personal" },
  { option: "Coca Cola 355Ml" },
  { option: "10% descuento" },
  { option: "Intenta de nuevo" },
  { option: "Pizza Mediana" },
];

const LOCATIONS = [
  "Atenas",
  "Rio Segundo",
  "Ciruelas",
  "Turrucares",
  "Santa Barbara",
  "Parrita",
  "San Isidro",
];

export const SpinWheel: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [sucursal, setSucursal] = useState("");
  const [cedula, setCedula] = useState("");
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateOrderNumber = (value: string) => {
    return /^\d+$/.test(value);
  };

  const validateCedula = (value: string) => {
    return /^\d+$/.test(value);
  };

  const checkExistingSpin = async (orderNumber: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/spins/${orderNumber}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!orderNumber || !customerName || !sucursal || !cedula) {
      setError("Por favor complete todos los campos");
      return;
    }

    if (!validateOrderNumber(orderNumber)) {
      setError("El número de orden debe contener solo números");
      return;
    }

    if (!validateCedula(cedula)) {
      setError("La cédula debe contener solo números");
      return;
    }

    try {
      const existingSpin = await checkExistingSpin(orderNumber);
      if (existingSpin) {
        setError("Este número de orden ya ha sido utilizado para un giro");
        return;
      }

      const newPrizeNumber = Math.floor(Math.random() * data.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
    } catch (error) {
      console.error("Error checking spin:", error);
      setError("Ocurrió un error al verificar el número de orden");
    }
  };

  const handleStopSpinning = async () => {
    setMustSpin(false);
    setShowResult(true);

    try {
      console.log("Attempting to post to:", `${API_URL}/api/spins`);
      const response = await axios.post(`${API_URL}/api/spins`, {
        orderNumber: orderNumber,
        customerName: customerName,
        cedula,
        sucursal,
        award: data[prizeNumber].option,
      });
      console.log("Response:", response.data);
    } catch (error) {
      console.error("Error saving spin result:", error);
      if (axios.isAxiosError(error)) {
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers,
        });
      }
    }
  };

  const handlePlayAgain = () => {
    setOrderNumber("");
    setCustomerName("");
    setSucursal("");
    setCedula("");
    setShowResult(false);
    setMustSpin(false);
    setError(null);
  };

  if (showResult) {
    return (
      <div className="main-container">
        <div className="result-container">
          <h2>¡Felicitaciones {customerName}!</h2>
          <p>Has ganado: {data[prizeNumber].option}</p>
          <p style={{ fontSize: "12px" }}>
            Recuerda mostrar tu factura para reclamar tu premio
          </p>
          <button onClick={handlePlayAgain}>JUGAR DE NUEVO</button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="content-container">
        <div className="form-section">
          <h1>LLENA, GIRA, ¡GANA!</h1>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit} className="spin-form">
            <div className="form-group">
              <label htmlFor="orderNumber">NÚMERO DE ORDEN</label>
              <input
                id="orderNumber"
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="name">NOMBRE</label>
              <input
                id="name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="cedula">CÉDULA</label>
              <input
                id="cedula"
                type="text"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="restaurant">RESTAURANTE DE LA ORDEN</label>
              <select
                id="restaurant"
                value={sucursal}
                onChange={(e) => setSucursal(e.target.value)}
                required
              >
                <option value="">Seleccionar restaurante</option>
                {LOCATIONS.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit">GIRAR</button>
          </form>
        </div>
        <div className="wheel-section">
          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={data}
            onStopSpinning={handleStopSpinning}
            outerBorderColor="#FF0000"
            outerBorderWidth={8}
            innerBorderColor="#FF0000"
            innerBorderWidth={1}
            innerRadius={10}
            radiusLineColor="#FF0000"
            radiusLineWidth={1}
            fontSize={15}
            textDistance={60}
            fontFamily="Montserrat"
            backgroundColors={["#FFFFFF", "#000000"]}
            textColors={["#FF0000"]}
            perpendicularText={false}
            spinDuration={0.8}
          />
        </div>
      </div>
    </div>
  );
};
