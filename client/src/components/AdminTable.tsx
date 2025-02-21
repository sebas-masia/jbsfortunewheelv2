import React, { useState, useMemo } from "react";
import { Spin } from "../types/types";
import "./AdminTable.css";

interface AdminTableProps {
  spins: Spin[];
  onDisbursed?: (id: string) => void;
}

const LOCATIONS = ["Escazu", "Belen", "Alajuela", "San Ramon"];

const FIELD_LABELS: Record<string, string> = {
  id: "ID",
  customerName: "Nombre del Cliente",
  cedula: "Cédula",
  email: "Email",
  phoneNumber: "Teléfono",
  sucursal: "Sucursal",
  award: "Premio",
  createdAt: "Fecha",
  isSpecialPrize: "Es Premio Especial",
  isDisbursed: "Entregado",
};

const COLUMNS = [
  { field: "id", label: "ID", className: "col-id" },
  { field: "customerName", label: "Nombre del Cliente", className: "col-name" },
  { field: "cedula", label: "Cédula", className: "col-cedula" },
  { field: "email", label: "Email", className: "col-email" },
  { field: "phoneNumber", label: "Teléfono", className: "col-phone" },
  { field: "sucursal", label: "Sucursal", className: "col-branch" },
  { field: "award", label: "Premio", className: "col-prize" },
  { field: "createdAt", label: "Fecha", className: "col-date" },
  { field: "isSpecialPrize", label: "Especial", className: "col-special" },
  { field: "isDisbursed", label: "Estado", className: "col-status" },
] as const;

export const AdminTable: React.FC<AdminTableProps> = ({
  spins,
  onDisbursed,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Spin>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  const sortedAndFilteredSpins = useMemo(() => {
    return spins
      .filter((spin) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          spin.customerName.toLowerCase().includes(searchLower) ||
          spin.cedula.toLowerCase().includes(searchLower) ||
          spin.sucursal.toLowerCase().includes(searchLower) ||
          spin.award.toLowerCase().includes(searchLower);

        // Apply location filter
        const matchesLocation = selectedLocation
          ? spin.sucursal === selectedLocation
          : true;

        return matchesSearch && matchesLocation;
      })
      .sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        if (sortDirection === "asc") {
          return aValue < bValue ? -1 : 1;
        } else {
          return aValue > bValue ? -1 : 1;
        }
      });
  }, [spins, searchTerm, sortField, sortDirection, selectedLocation]);

  const handleSort = (field: keyof Spin) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="admin-table">
      <div className="filters-container">
        <div className="filters-wrapper">
          <div className="filter-group">
            <label htmlFor="search">Buscar:</label>
            <div className="search-bar">
              <input
                id="search"
                type="text"
                placeholder="Buscar por orden, nombre, cédula, sucursal o premio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-group">
            <label htmlFor="location">Filtrar por sucursal:</label>
            <div className="location-filter">
              <select
                id="location"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="location-select"
              >
                <option value="">Todas las Sucursales</option>
                {LOCATIONS.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              {COLUMNS.map(({ field, label, className }) => (
                <th
                  key={field}
                  onClick={() => handleSort(field as keyof Spin)}
                  className={`${className || ""} ${
                    sortField === field ? `sorted-${sortDirection}` : ""
                  }`}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredSpins.map((spin) => (
              <tr key={spin.id}>
                <td className="col-id">{spin.id}</td>
                <td className="col-name">{spin.customerName}</td>
                <td className="col-cedula">{spin.cedula}</td>
                <td className="col-email">{spin.email}</td>
                <td className="col-phone">{spin.phoneNumber}</td>
                <td className="col-branch">{spin.sucursal}</td>
                <td className="col-prize">{spin.award}</td>
                <td className="col-date">
                  {new Date(spin.createdAt).toLocaleString()}
                </td>
                <td className="col-special">
                  {spin.isSpecialPrize ? "Si" : "No"}
                </td>
                <td className="col-status">
                  {spin.isDisbursed ? (
                    <span className="status-badge">Si</span>
                  ) : (
                    <div className="button-group">
                      <button
                        onClick={() => onDisbursed?.(spin.id)}
                        className="status-button approve"
                      >
                        Entregar
                      </button>
                      <button className="status-button reject">Rechazar</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
