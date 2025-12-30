import React, { useState, useEffect } from "react";
import axios from "axios";

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleType, setVehicleType] = useState("bike");
  const [maxWeight, setMaxWeight] = useState(10);
  const [canHandleFragile, setCanHandleFragile] = useState(false);

  const [filterVehicle, setFilterVehicle] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  const isValidPhone = (phone) => /^[0-9]{10}$/.test(phone);

  const vehicleLimits = {
    bike: 10,
    van: 100,
    truck: 1000,
  };

  async function loadDrivers() {
    const res = await axios.get("http://localhost:4000/api/drivers");
    setDrivers(res.data);
  }

  async function addDriver() {
    if (!name.trim()) return alert("Enter driver name");
    if (!isValidPhone(phone)) return alert("Invalid phone");

    await axios.post("http://localhost:4000/api/drivers", {
      name,
      phone,
      vehicleType,
      maxWeight,
      canHandleFragile,
      status: "online",
    });

    setShowAdd(false);
    setName("");
    setPhone("");
    setVehicleType("bike");
    setMaxWeight(10);
    setCanHandleFragile(false);
    loadDrivers();
  }

  useEffect(() => {
    loadDrivers();
  }, []);

  // auto lock weight & fragile based on vehicle
  useEffect(() => {
    setMaxWeight(vehicleLimits[vehicleType]);

    if (vehicleType === "bike") {
      setCanHandleFragile(false);
    }
  }, [vehicleType]);

  // sorting + filtering
  const visibleDrivers = drivers
    .filter((d) =>
      filterVehicle === "all" ? true : d.vehicleType === filterVehicle
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "capacity") return a.maxWeight - b.maxWeight;
      return 0;
    });

  return (
    <div className="p-6 min-h-screen bg-[#EEF2FF]">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Drivers</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          + Add Driver
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex gap-4 mb-4">
        <select
          className="border px-3 py-2 rounded"
          value={filterVehicle}
          onChange={(e) => setFilterVehicle(e.target.value)}
        >
          <option value="all">All Vehicles</option>
          <option value="bike">Bike</option>
          <option value="van">Van</option>
          <option value="truck">Truck</option>
        </select>

        <select
          className="border px-3 py-2 rounded"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name">Sort by Name</option>
          <option value="capacity">Sort by Capacity</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white p-4 rounded-xl shadow">
        {visibleDrivers.length === 0 ? (
          <p className="text-center text-slate-500">No drivers found</p>
        ) : (
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="text-sm text-slate-500 border-b">
                <th className="text-left p-2 w-1/4">Name</th>
                <th className="text-left p-2 w-1/4">Vehicle</th>
                <th className="text-left p-2 w-1/4">Capacity</th>
                <th className="text-left p-2 w-1/4">Fragile</th>
              </tr>
            </thead>
            <tbody>
              {visibleDrivers.map((d) => (
                <tr key={d._id} className="border-b text-sm">
                  <td className="p-2">{d.name}</td>
                  <td className="p-2 capitalize">{d.vehicleType}</td>
                  <td className="p-2">{d.maxWeight} kg</td>
                  <td className="p-2">
                    {d.canHandleFragile ? "Yes" : "No"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[360px] space-y-3">
            <h2 className="text-lg font-semibold">Add Driver</h2>

            <input
              placeholder="Name"
              className="border w-full px-3 py-2 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              placeholder="Phone"
              className="border w-full px-3 py-2 rounded"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, ""))
              }
            />

            <label className="text-sm font-medium">Vehicle Type</label>
            <select
              className="w-full border px-3 py-2 rounded"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
            >
              <option value="bike">Bike</option>
              <option value="van">Van</option>
              <option value="truck">Truck</option>
            </select>

            <label className="text-sm font-medium">
              Max Weight: {maxWeight} kg
            </label>
            <input
              type="range"
              min="1"
              max={vehicleLimits[vehicleType]}
              value={maxWeight}
              onChange={(e) => setMaxWeight(Number(e.target.value))}
              className="w-full"
            />

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={canHandleFragile}
                disabled={vehicleType === "bike"}
                onChange={(e) => setCanHandleFragile(e.target.checked)}
              />
              Can handle fragile items
            </label>

            {vehicleType === "bike" && (
              <p className="text-xs text-slate-500 ml-6">
                Bikes cannot handle fragile orders
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 border py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={addDriver}
                className="flex-1 bg-indigo-600 text-white py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
