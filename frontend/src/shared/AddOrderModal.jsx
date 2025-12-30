import React, { useEffect, useState } from "react";
import axios from "axios";
import AddressSearch from "./AddressSearch";
import MapPinPicker from "./MapPinPicker";

export default function AddOrderModal({ close, saved }) {
  /* =======================
     BUSINESS PICKUP (READ-ONLY)
  ======================= */
  const [pickupName, setPickupName] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupLocation, setPickupLocation] = useState(null);

  /* =======================
     DELIVERY
  ======================= */
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryObj, setDeliveryObj] = useState(null);
  const [deliveryLocation, setDeliveryLocation] = useState(null);

  /* =======================
     ORDER DETAILS
  ======================= */
  const [weightKg, setWeightKg] = useState(1);
  const [priority, setPriority] = useState("normal");
  const [fragile, setFragile] = useState(false);
  const [vehicleRestriction, setVehicleRestriction] = useState("");
  const [notes, setNotes] = useState("");

  const [mapOpen, setMapOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  /* =======================
     LOAD BUSINESS SETTINGS
  ======================= */
  useEffect(() => {
    axios.get("http://localhost:4000/api/settings/business").then(res => {
      const b = res.data;
      if (!b) return;

      setPickupName(b.businessName || "Business");
      setPickupAddress(b.pickup?.address?.display_name || "");
      setPickupLocation(b.pickup?.location || null);
    });
  }, []);

  const isValidPhone = (phone) => /^[0-9]{10}$/.test(phone);

  async function save() {
    if (!customerName.trim()) return alert("Enter customer name");
    if (!deliveryLocation) return alert("Select delivery address");
    if (customerPhone && !isValidPhone(customerPhone))
      return alert("Invalid phone number");

    setSaving(true);

    try {
      await axios.post("http://localhost:4000/api/orders", {
        customer: { name: customerName, phone: customerPhone },
        delivery: {
          address: deliveryObj || { display_name: deliveryAddress },
          location: deliveryLocation,
        },
        weightKg,
        priority,
        fragile,
        vehicleRestriction: vehicleRestriction || null,
        notes,
      });

      saved();
      close();
    } catch (err) {
      console.error(err);
      alert("Failed to save order");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white w-[760px] p-6 rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">

          <h2 className="text-xl font-bold mb-4">New Order</h2>

          <div className="grid grid-cols-2 gap-6">
            {/* LEFT */}
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium">Business</label>
                <input disabled className="border w-full px-3 py-2 rounded bg-slate-50" value={pickupName} />
              </div>

              <div>
                <label className="text-sm font-medium">Pickup Address</label>
                <input disabled className="border w-full px-3 py-2 rounded bg-slate-50" value={pickupAddress} />
              </div>

              <div>
                <label className="text-sm font-medium">Customer Name *</label>
                <input className="border w-full px-3 py-2 rounded" value={customerName} onChange={e => setCustomerName(e.target.value)} />
              </div>

              <div>
                <label className="text-sm font-medium">Phone</label>
                <input className="border w-full px-3 py-2 rounded" value={customerPhone} onChange={e => setCustomerPhone(e.target.value.replace(/\D/g, ""))} />
              </div>

              <AddressSearch
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
                onSelect={(place) => {
                  setDeliveryObj(place);
                  setDeliveryAddress(place.display_name);
                  setDeliveryLocation({
                    type: "Point",
                    coordinates: [parseFloat(place.lon), parseFloat(place.lat)],
                  });
                }}
                onManualPick={() => setMapOpen(true)}
              />

              {/* MAP PICK BUTTON */}
                <button
                  type="button"
                  onClick={() => setMapOpen(true)}
                  className="
                    mt-2
                    inline-flex
                    items-center
                    gap-2
                    px-3
                    py-1.5
                    text-sm
                    font-medium
                    text-indigo-600
                    border
                    border-indigo-200
                    rounded-lg
                    bg-indigo-50
                    hover:bg-indigo-100
                    hover:border-indigo-300
                    transition
                  "
                >
                  <span className="text-base">📍</span>
                  Pick on map
                </button>
            </div>

            {/* RIGHT */}
            <div className="space-y-4">
              <label className="text-sm font-medium">Weight (kg)</label>
              <input type="number" className="border w-full px-3 py-2 rounded" value={weightKg} onChange={e => setWeightKg(e.target.value)} />

              <label className="text-sm font-medium">Priority</label>
              <select className="border w-full px-3 py-2 rounded" value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={fragile} onChange={e => setFragile(e.target.checked)} />
                Fragile item
              </label>

              <label className="text-sm font-medium">Vehicle Restriction</label>
              <select className="border w-full px-3 py-2 rounded" value={vehicleRestriction} onChange={e => setVehicleRestriction(e.target.value)}>
                <option value="">Any</option>
                <option value="bike">Bike</option>
                <option value="van">Van</option>
                <option value="truck">Truck</option>
              </select>

              <label className="text-sm font-medium">Notes</label>
              <textarea className="border w-full px-3 py-2 rounded" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button onClick={close} className="border px-4 py-2 rounded">Cancel</button>
            <button onClick={save} disabled={saving} className="bg-indigo-600 text-white px-5 py-2 rounded">
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>

      {mapOpen && (
        <MapPinPicker
          onClose={() => setMapOpen(false)}
          onConfirm={(place, coords) => {
            setDeliveryObj(place);
            setDeliveryAddress(place.display_name);
            setDeliveryLocation({
              type: "Point",
              coordinates: [coords.lng, coords.lat],
            });
            setMapOpen(false);
          }}
        />
      )}
    </>
  );
}
