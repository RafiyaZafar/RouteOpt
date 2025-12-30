import React, { useEffect, useState } from "react";
import axios from "axios";
import AddOrderModal from "../shared/AddOrderModal";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:4000/api/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to load orders", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const filtered = orders.filter((o) => {
    const customer = o.customer?.name?.toLowerCase() || "";
    const address = o.delivery?.address?.display_name?.toLowerCase() || "";

    return (
      customer.includes(search.toLowerCase()) ||
      address.includes(search.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen p-6 bg-[#F5F7FF]">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Orders</h1>
        <button
          onClick={() => setOpenAdd(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          + Add Order
        </button>
      </div>

      {/* SEARCH */}
      <div className="mb-4">
        <input
          className="border w-full md:w-72 px-3 py-2 rounded"
          placeholder="Search by customer or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* CONTENT */}
      <div className="bg-white shadow rounded-xl p-4">
        {loading ? (
          <p className="text-slate-500">Loading orders…</p>
        ) : orders.length === 0 ? (
          <p className="text-slate-500">No orders yet</p>
        ) : filtered.length === 0 ? (
          <p className="text-slate-500">No matching orders found</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-sm text-slate-500 border-b">
                <th className="py-2">Customer</th>
                <th className="py-2">Delivery Address</th>
                <th className="py-2">Weight</th>
                <th className="py-2">Added</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((o) => (
                <tr
                  key={o._id}
                  className="border-b last:border-none hover:bg-slate-50"
                >
                  <td className="py-3 font-medium">
                    {o.customer?.name || "—"}
                  </td>

                  <td className="py-3 text-slate-600 text-sm">
                    {o.delivery?.address?.display_name || "—"}
                  </td>

                  <td className="py-3">{o.weightKg} kg</td>

                  <td className="py-3 text-xs text-slate-500">
                    {o.createdAt
                      ? new Date(o.createdAt).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ADD ORDER MODAL */}
      {openAdd && (
        <AddOrderModal
          close={() => setOpenAdd(false)}
          saved={loadOrders}
        />
      )}
    </div>
  );
}
