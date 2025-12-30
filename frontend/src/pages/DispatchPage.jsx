import React, { useEffect, useState } from "react";
import axios from "axios";
import WhyAssignModal from "../shared/WhyAssignModal";

export default function DispatchPage() {
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [assignModal, setAssignModal] = useState({ open: false, order: null });
  const [whyModal, setWhyModal] = useState({ open: false, order: null });
  const [optimizing, setOptimizing] = useState(false);

  /* ======================
     LOAD DATA
  ====================== */
  async function loadData() {
    const [ordersRes, driversRes] = await Promise.all([
      axios.get("http://localhost:4000/api/orders"),
      axios.get("http://localhost:4000/api/drivers"),
    ]);

    setOrders(ordersRes.data);
    setDrivers(driversRes.data);
  }

  useEffect(() => {
    loadData();
  }, []);

  /* ======================
     MANUAL ASSIGN
  ====================== */
  async function assignOrder(driverId) {
    if (!assignModal.order) return;

    await axios.patch(
      `http://localhost:4000/api/orders/${assignModal.order._id}/assign`,
      { driverId }
    );

    setAssignModal({ open: false, order: null });
    loadData();
  }

  /* ======================
     OPTIMIZE
  ====================== */
  async function optimizeDispatch() {
    try {
      setOptimizing(true);
      await axios.post("http://localhost:4000/api/dispatch/optimize");
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to optimize dispatch");
    } finally {
      setOptimizing(false);
    }
  }

  const newOrders = orders.filter(o => !o.driverId);

  return (
    <div className="min-h-screen p-6 bg-[#F5F7FF] flex gap-6">

      {/* 🟦 ASSIGNED */}
      <div className="w-1/3 bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-bold mb-4 text-slate-800">
          Assigned Orders
        </h2>

        {drivers.map(driver => {
          const assignedOrders = orders.filter(
            o => o.driverId === driver._id && o.status === "assigned"
          );

          return (
            <div key={driver._id} className="mb-6">
              <div className="font-medium text-slate-700 flex items-center gap-2 mb-2">
                <span className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-sm">
                  {driver.name?.[0]}
                </span>
                {driver.name}
              </div>

              {assignedOrders.length === 0 ? (
                <p className="text-xs text-slate-400 ml-10">
                  No assigned orders
                </p>
              ) : (
                assignedOrders.map(order => (
                  <div
                    key={order._id}
                    className="ml-10 p-3 border rounded-lg bg-slate-50 mb-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">
                          {order.customer?.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {order.delivery?.address?.display_name}
                        </p>
                      </div>

                      {/* ℹ️ WHY ICON */}
                      {order.assignmentReason && (
                        <button
                          onClick={() =>
                            setWhyModal({ open: true, order })
                          }
                          className="text-slate-500 hover:text-indigo-600"
                          title="Why this driver?"
                        >
                          ℹ️
                        </button>
                      )}
                    </div>

                    <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded bg-yellow-200 text-yellow-800">
                      Assigned
                    </span>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>

      {/* 🟩 NEW ORDERS */}
      <div className="flex-1 bg-white rounded-xl shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800">
            New Orders
          </h2>

          <button
            onClick={optimizeDispatch}
            disabled={optimizing || newOrders.length === 0}
            className={`px-4 py-2 rounded text-white transition
              ${
                optimizing || newOrders.length === 0
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
          >
            {optimizing ? "Optimizing…" : "⚡ Optimize Routes"}
          </button>
        </div>

        {newOrders.length === 0 ? (
          <p className="text-slate-500">No new orders</p>
        ) : (
          newOrders.map(order => (
            <div
              key={order._id}
              className="border p-3 rounded-lg mb-3 flex items-center justify-between hover:bg-slate-50"
            >
              <div>
                <p className="font-medium">
                  {order.customer?.name || "Unknown"}
                </p>
                <p className="text-sm text-slate-500">
                  {order.delivery?.address?.display_name || "—"}
                </p>
              </div>

              <button
                onClick={() => setAssignModal({ open: true, order })}
                className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
              >
                Assign
              </button>
            </div>
          ))
        )}
      </div>

      {/* MANUAL ASSIGN MODAL */}
      {assignModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[350px] rounded-xl shadow p-6">
            <h3 className="text-xl font-semibold mb-4">
              Assign Order
            </h3>

            {drivers.map(driver => (
              <button
                key={driver._id}
                className="w-full border rounded p-2 mb-2 hover:bg-indigo-50 text-left"
                onClick={() => assignOrder(driver._id)}
              >
                {driver.name}
              </button>
            ))}

            <button
              className="w-full border py-2 rounded mt-2"
              onClick={() => setAssignModal({ open: false, order: null })}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* WHY ASSIGNED MODAL */}
      {whyModal.open && (
        <WhyAssignModal
          order={whyModal.order}
          close={() => setWhyModal({ open: false, order: null })}
        />
      )}
    </div>
  );
}
