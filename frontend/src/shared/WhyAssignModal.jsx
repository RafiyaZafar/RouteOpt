import React from "react";

export default function WhyAssignModal({ order, close }) {
  const reason = order.assignmentReason;

  if (!reason) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[420px] rounded-xl shadow-xl p-6">
        <h3 className="text-xl font-semibold mb-4">
          Why this driver?
        </h3>

        <div className="space-y-2 text-sm text-slate-700">
          <p>
            <b>Assigned to:</b> {reason.assignedDriver}
          </p>

          <p>
            <b>Distance from depot:</b> {reason.distanceKm} km
          </p>

          <p>
            <b>Vehicle type:</b> {reason.vehicleType}
          </p>

          <p>
            <b>Remaining capacity:</b>{" "}
            {reason.remainingCapacityKg} kg
          </p>

          <p>
            <b>Fragile support:</b>{" "}
            {reason.fragileAllowed ? "Yes" : "No"}
          </p>
        </div>

        {reason.rejectedDrivers?.length > 0 && (
          <>
            <hr className="my-4" />
            <h4 className="font-medium mb-2">
              Other drivers rejected
            </h4>

            <ul className="text-sm text-slate-600 space-y-1">
              {reason.rejectedDrivers.map((d, i) => (
                <li key={i}>
                  • <b>{d.driverName}</b>: {d.reason}
                </li>
              ))}
            </ul>
          </>
        )}

        <button
          onClick={close}
          className="mt-6 w-full border py-2 rounded hover:bg-slate-100"
        >
          Close
        </button>
      </div>
    </div>
  );
}
