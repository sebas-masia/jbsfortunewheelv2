import React, { useState } from "react";
import { Wheel } from "react-custom-roulette";
import axios from "axios";
import { API_URL } from "../config";

const data = [
  { option: "Papitas GRATIS" },
  { option: "Postre GRATIS" },
  { option: "Intenta de nuevo" },
  { option: "Papas Refresco GRATIS" },
  { option: "4 Combos JBs Classic" },
  { option: "Intenta de nuevo" },
];

export const SpinWheel: React.FC = () => {
  const [customerName, setCustomerName] = useState("");
  const [cedula, setCedula] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateCedula = (value: string) => {
    return /^\d{9}$/.test(value); // Validates exactly 9 digits for Costa Rica IDs
  };

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const validatePhoneNumber = (value: string) => {
    return /^[2-8]\d{7}$/.test(value); // Validates Costa Rica phone numbers (8 digits starting with 2-8)
  };

  const checkExistingSpin = async (cedula: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/spins/cedula/${cedula}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  };

  const checkSpecialPrizeAvailable = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/spins/special-prize`);
      return !response.data.awarded; // returns true if special prize hasn't been awarded yet
    } catch (error) {
      console.error("Error checking special prize:", error);
      return false; // assume prize is not available in case of error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName || !cedula || !email || !phoneNumber) {
      setError("Por favor complete todos los campos");
      return;
    }

    if (!validateCedula(cedula)) {
      setError("La cédula debe contener exactamente 9 números");
      return;
    }

    if (!validateEmail(email)) {
      setError("Por favor ingrese un correo electrónico válido");
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError("Por favor ingrese un número de teléfono válido (8 dígitos)");
      return;
    }

    try {
      const existingSpin = await checkExistingSpin(cedula);
      if (existingSpin) {
        setError("Esta cédula ya ha sido utilizada para un giro");
        return;
      }

      // Check if special prize is still available
      const isSpecialPrizeAvailable = await checkSpecialPrizeAvailable();

      let newPrizeNumber;
      if (isSpecialPrizeAvailable) {
        // 1% chance to win the special prize if it's still available
        const random = Math.random();
        if (random < 0.01) {
          newPrizeNumber = 3; // index of "4 Combos JBs Classic"
        } else {
          // Generate number excluding the special prize index
          const availablePrizes = [0, 1, 2, 4];
          const randomIndex = Math.floor(
            Math.random() * availablePrizes.length
          );
          newPrizeNumber = availablePrizes[randomIndex];
        }
      } else {
        // Special prize not available, exclude it from possible outcomes
        const availablePrizes = [0, 1, 2, 4];
        const randomIndex = Math.floor(Math.random() * availablePrizes.length);
        newPrizeNumber = availablePrizes[randomIndex];
      }

      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
    } catch (error) {
      console.error("Error checking spin:", error);
      setError("Ocurrió un error al verificar la cédula");
    }
  };

  const handleStopSpinning = async () => {
    setMustSpin(false);
    setShowResult(true);

    try {
      const response = await axios.post(`${API_URL}/api/spins`, {
        customerName,
        cedula,
        email,
        phoneNumber,
        award: data[prizeNumber].option,
        isSpecialPrize: prizeNumber === 3, // Add flag for special prize
      });
      console.log("Response:", response.data);
    } catch (error) {
      console.error("Error saving spin result:", error);
      if (axios.isAxiosError(error)) {
        console.error("Error details:", error.response?.data);
      }
    }
  };

  const handlePlayAgain = () => {
    setCustomerName("");
    setCedula("");
    setEmail("");
    setPhoneNumber("");
    setShowResult(false);
    setMustSpin(false);
    setError(null);
  };

  if (showResult) {
    const isLose = data[prizeNumber].option === "Intenta de nuevo";
    return (
      <div className="main-container">
        <div className="result-container">
          {isLose ? (
            <>
              <h2>¡Lo sentimos {customerName}!</h2>
              <p>Esta vez no ganaste un premio</p>
              <p style={{ fontSize: "12px" }}>
                Gracias por participar. ¡Mejor suerte la próxima!
              </p>
            </>
          ) : (
            <>
              <h2>¡Felicitaciones {customerName}!</h2>
              <p>Has ganado: {data[prizeNumber].option}</p>
              <p style={{ fontSize: "12px" }}>
                Recuerda mostrar tu factura para reclamar tu premio
              </p>
            </>
          )}
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
                maxLength={9}
                value={cedula}
                onChange={(e) => setCedula(e.target.value.replace(/\D/g, ""))}
                required
                placeholder="123456789"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">CORREO ELECTRÓNICO</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="ejemplo@correo.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">NÚMERO DE CELULAR</label>
              <input
                id="phoneNumber"
                type="tel"
                maxLength={8}
                value={phoneNumber}
                onChange={(e) =>
                  setPhoneNumber(e.target.value.replace(/\D/g, ""))
                }
                required
                placeholder="88888888"
              />
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
            outerBorderColor="#333333"
            outerBorderWidth={3}
            innerBorderColor="#333333"
            innerBorderWidth={1}
            innerRadius={20}
            radiusLineColor="#666666"
            radiusLineWidth={1}
            fontSize={13}
            textDistance={59}
            fontFamily="Montserrat"
            backgroundColors={["#FFFFFF", "#c9c7c7"]}
            textColors={["#333333"]}
            perpendicularText={false}
            spinDuration={0.8}
            pointerProps={{
              style: {
                backgroundColor: "white",
                border: "2px solid #333333",
                color: "#333333",
              },
            }}
            fontWeight={900}
          />
        </div>
      </div>
    </div>
  );
};
