

// import { useState } from "react";
// import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";

// // Fix default Leaflet marker icons
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
//   iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
// });

// function LocationPicker({ onPick }) {
//   useMapEvents({
//     click(e) {
//       onPick(e.latlng);
//     },
//   });
//   return null;
// }

// export default function MapPinPicker({ onClose, onConfirm }) {
//   const [pos, setPos] = useState({ lat: 28.6139, lng: 77.2090 }); // Default Delhi
//   const [picked, setPicked] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // Reverse lookup → calls backend /api/reverse
//   async function confirmPick() {
//     if (!picked) return;

//     setLoading(true);

//     try {
//       const res = await fetch(
//         `http://localhost:4000/api/reverse?lat=${picked.lat}&lon=${picked.lng}`
//       );
//       const place = await res.json();

//       // 'place' contains display_name, lat, lon — perfect for modal
//       onConfirm(place, picked);
//     } catch (err) {
//       console.error(err);
//       alert("Failed to reverse geocode");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//       <div className="bg-white p-4 rounded-xl w-[700px] h-[550px] shadow-xl flex flex-col">

//         <h2 className="text-lg font-semibold mb-3">Pick Location on Map</h2>

//         <div className="flex-1 rounded overflow-hidden border">
//           <MapContainer
//             center={[pos.lat, pos.lng]}
//             zoom={13}
//             style={{ height: "100%", width: "100%" }}
//           >
//             <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

//             <LocationPicker
//               onPick={(latlng) => {
//                 setPicked(latlng);
//                 setPos(latlng);
//               }}
//             />

//             {picked && <Marker position={[picked.lat, picked.lng]} />}
//           </MapContainer>
//         </div>

//         <div className="flex gap-2 mt-4">
//           <button
//             className="flex-1 border py-2 rounded"
//             onClick={onClose}
//           >
//             Cancel
//           </button>

//           <button
//             disabled={!picked || loading}
//             className={`flex-1 py-2 rounded text-white ${
//               picked && !loading
//                 ? "bg-indigo-600 hover:bg-indigo-700"
//                 : "bg-gray-400 cursor-not-allowed"
//             }`}
//             onClick={confirmPick}
//           >
//             {loading ? "Fetching address…" : "Confirm"}
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// }


import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

function LocationPicker({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    },
  });
  return null;
}

export default function MapPinPicker({ onClose, onConfirm }) {
  const [picked, setPicked] = useState(null);
  const [loading, setLoading] = useState(false);

  async function confirmPick() {
    if (!picked) return;
    setLoading(true);

    try {
      const res = await axios.get(
        `http://localhost:4000/api/reverse?lat=${picked.lat}&lon=${picked.lng}`
      );

      onConfirm(res.data, picked);
    } catch (err) {
      alert("Failed to fetch address");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-xl w-[700px] h-[550px] shadow-xl flex flex-col">
        <h2 className="text-lg font-semibold mb-2">Pick Location</h2>

        <div className="flex-1 rounded overflow-hidden">
          <MapContainer
            center={[28.6139, 77.2090]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationPicker onPick={setPicked} />
            {picked && <Marker position={[picked.lat, picked.lng]} />}
          </MapContainer>
        </div>

        <div className="flex gap-2 mt-3">
          <button className="flex-1 border py-2 rounded" onClick={onClose}>
            Cancel
          </button>

          <button
            disabled={!picked || loading}
            onClick={confirmPick}
            className={`flex-1 py-2 rounded text-white ${
              picked
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? "Fetching address..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
