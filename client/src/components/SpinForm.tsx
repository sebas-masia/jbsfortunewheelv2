import React, { useState } from "react";
import { Wheel } from "react-custom-roulette";

interface SpinFormProps {
  onSpinComplete: (data: {
    name: string;
    email: string;
    sucursal: string;
    award: string;
  }) => void;
}

const PRIZES = [
  { option: "Free Pizza" },
  { option: "20% Off" },
  { option: "Free Drink" },
  { option: "2x1 Pizza" },
  { option: "Free Dessert" },
  { option: "10% Off" },
];

const LOCATIONS = ["Downtown", "West Side", "North Mall", "Beach Front"];

export const SpinForm: React.FC<SpinFormProps> = ({ onSpinComplete }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sucursal, setSucursal] = useState("");
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !sucursal) return;

    const newPrizeNumber = Math.floor(Math.random() * PRIZES.length);
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true);
    setIsFormSubmitted(true);
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    onSpinComplete({
      name,
      email,
      sucursal,
      award: PRIZES[prizeNumber].option,
    });
  };

  if (isFormSubmitted) {
    return (
      <div className="wheel-container">
        <Wheel
          mustStartSpinning={mustSpin}
          prizeNumber={prizeNumber}
          data={PRIZES}
          onStopSpinning={handleStopSpinning}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="spin-form">
      <div className="form-group">
        <label htmlFor="name">Name:</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="sucursal">Location:</label>
        <select
          id="sucursal"
          value={sucursal}
          onChange={(e) => setSucursal(e.target.value)}
          required
        >
          <option value="">Select location</option>
          {LOCATIONS.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>

      <button type="submit">Spin the Wheel!</button>
    </form>
  );
};
