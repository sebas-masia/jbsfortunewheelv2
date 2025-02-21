import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import Logo from "../../public/assets/Logo.png";

export const Navbar: React.FC = () => {
  const sucursales = [
    {
      name: "Escazu",
      location: "https://maps.app.goo.gl/vs1ArLzSubmfoRpA6",
      express:
        "https://www.ubereats.com/cr-en/store/jbs-burgers-escazu/KoXbu46cROqOdd4_YwtkGw",
    },
    {
      name: "Alajuela",
      location: "https://maps.app.goo.gl/isEEHrBHQ4KfU8hL8",
      express:
        "https://www.ubereats.com/cr/store/jbs-burgers-alajuela/8qN1q0W2WCisrKYvzLPqDA",
    },
    {
      name: "San Ramon",
      location: "https://maps.app.goo.gl/aaNVtLsFHeyELcn36",
      express:
        "https://www.ubereats.com/cr-en/store/jbs-san-ramon/_8_BSt-ZXgGYaCStxS0M_A",
    },
    {
      name: "Belen",
      location: "https://maps.app.goo.gl/y83aovdDqe6yivdn9",
      express:
        "https://www.ubereats.com/cr-en/store/jbs-burgers-belen/kd75zV_sSH-M7_1rcxukXg",
    },
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const handleDropdownClick = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside as (e: MouseEvent) => void
    );
    document.addEventListener(
      "touchstart",
      handleClickOutside as (e: TouchEvent) => void
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside as (e: MouseEvent) => void
      );
      document.removeEventListener(
        "touchstart",
        handleClickOutside as (e: TouchEvent) => void
      );
    };
  }, []);

  return (
    <nav
      style={{
        background: "#e1261c",
        padding: "1rem",
        position: "fixed",
        width: "100%",
        top: 0,
        zIndex: 1000,
      }}
    >
      <div
        ref={navRef}
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 2rem",
        }}
      >
        <Link to="/" style={{ display: "flex", alignItems: "center" }}>
          <img src={Logo} alt="Peperonni's" height="70" width="auto" />
        </Link>

        <button className="navbar-hamburger" onClick={() => setIsOpen(!isOpen)}>
          <div
            className="hamburger-line"
            style={{
              transform: isOpen ? "rotate(45deg) translate(5px, 5px)" : "none",
            }}
          />
          <div
            className="hamburger-line"
            style={{
              opacity: isOpen ? 0 : 1,
            }}
          />
          <div
            className="hamburger-line"
            style={{
              transform: isOpen
                ? "rotate(-45deg) translate(7px, -7px)"
                : "none",
            }}
          />
        </button>

        <div className={`navbar-links ${isOpen ? "open" : ""}`}>
          <div className="nav-item">
            <button
              className={`nav-button ${
                activeDropdown === "express" ? "active" : ""
              }`}
              onClick={() => handleDropdownClick("express")}
            >
              EXPRESS
            </button>
            <div
              className={`dropdown-content ${
                activeDropdown === "express" ? "active" : ""
              }`}
            >
              {sucursales.map((sucursal) => (
                <a
                  key={sucursal.name}
                  href={sucursal.express}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {sucursal.name}
                </a>
              ))}
            </div>
          </div>

          <div className="nav-item">
            <button
              className={`nav-button ${
                activeDropdown === "locations" ? "active" : ""
              }`}
              onClick={() => handleDropdownClick("locations")}
            >
              UBICACIONES
            </button>
            <div
              className={`dropdown-content ${
                activeDropdown === "locations" ? "active" : ""
              }`}
            >
              {sucursales.map((sucursal) => (
                <a
                  key={sucursal.name}
                  href={sucursal.location}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {sucursal.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
