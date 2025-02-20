import React, { useState, useMemo } from "react";
import { Spin } from "../types/types";

interface AdminTableProps {
  spins: Spin[];
}

const LOCATIONS = [
  "Atenas",
  "Rio Segundo",
  "Ciruelas",
  "Turrucares",
  "Santa Barbara",
  "Parrita",
  "San Isidro",
];

const FIELD_LABELS: Record<string, string> = {
  id: "ID",
  orderNumber: "Número de Orden",
  customerName: "Nombre del Cliente",
  cedula: "Cédula",
  sucursal: "Sucursal",
  award: "Premio",
  createdAt: "Fecha",
};

export const AdminTable: React.FC<AdminTableProps> = ({ spins }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Spin>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  const sortedAndFilteredSpins = useMemo(() => {
    return spins
      .filter((spin) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          spin.orderNumber.toLowerCase().includes(searchLower) ||
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

      <table>
        <thead>
          <tr>
            {[
              "id",
              "orderNumber",
              "customerName",
              "cedula",
              "sucursal",
              "award",
              "createdAt",
            ].map((field) => (
              <th
                key={field}
                onClick={() => handleSort(field as keyof Spin)}
                className={sortField === field ? `sorted-${sortDirection}` : ""}
              >
                {FIELD_LABELS[field]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedAndFilteredSpins.map((spin) => (
            <tr key={spin.id}>
              <td>{spin.id}</td>
              <td>{spin.orderNumber}</td>
              <td>{spin.customerName}</td>
              <td>{spin.cedula}</td>
              <td>{spin.sucursal}</td>
              <td>{spin.award}</td>
              <td>{new Date(spin.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
