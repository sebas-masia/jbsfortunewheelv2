import React, { useEffect, useState } from "react";
import { AdminTable } from "./AdminTable";
import { Spin } from "../types/types";
import { API_URL } from "../config";
import axios from "axios";

export const AdminDashboard: React.FC = () => {
  const [spins, setSpins] = useState<Spin[]>([]);

  useEffect(() => {
    const fetchSpins = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/spins`);
        setSpins(response.data);
      } catch (error) {
        console.error("Error fetching spins:", error);
      }
    };

    fetchSpins();
  }, []);

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <AdminTable spins={spins} />
    </div>
  );
};
