

// import React, { useEffect, useState } from "react";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import axios from "axios";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import DriverRoute from "./DriverRoute";

// /* ======================
//    ICONS
// ====================== */
// const pickupIcon = new L.Icon({
//   iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
//   iconSize: [32, 32],
// });

// export default function MapPage() {
//   const [drivers, setDrivers] = useState([]);
//   const [orders, setOrders] = useState([]);
//   const [businessPickup, setBusinessPickup] = useState(null);

//   useEffect(() => {
//     loadData();
//   }, []);

//   async function loadData() {
//     const [driversRes, ordersRes, businessRes] = await Promise.all([
//       axios.get("http://localhost:4000/api/drivers"),
//       axios.get("http://localhost:4000/api/orders"),
//       axios.get("http://localhost:4000/api/settings/business"),
//     ]);

//     setDrivers(driversRes.data);
//     setOrders(ordersRes.data);
//     setBusinessPickup(businessRes.data?.pickup || null);
//   }

//   /* ======================
//      BUILD ROUTES
//   ====================== */
//   const routes = drivers
//     .map((driver, index) => {
//       const assignedOrders = orders.filter(
//         (o) =>
//           o.driverId === driver._id &&
//           o.delivery?.location?.coordinates
//       );

//       if (assignedOrders.length === 0) return null;
//       if (!businessPickup?.location?.coordinates) return null;

//       const [plng, plat] = businessPickup.location.coordinates;

//       const pickup = [plat, plng];

//       const deliveries = assignedOrders.map((o) => {
//         const [dlng, dlat] = o.delivery.location.coordinates;
//         return [dlat, dlng];
//       });

//       return {
//         driverId: driver._id,
//         driverName: driver.name,
//         pickup,
//         deliveries,
//         colorIndex: index,
//       };
//     })
//     .filter(Boolean);

//   return (
//     <div className="min-h-screen bg-[#F5F7FF] p-4">
//       <h1 className="text-2xl font-bold mb-4">Live Driver Routes</h1>

//       <div className="h-[75vh] rounded-xl overflow-hidden shadow bg-white">
//         <MapContainer
//           center={[28.6139, 77.209]}
//           zoom={12}
//           style={{ height: "100%", width: "100%" }}
//         >
//           <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

//           {/* 🔰 SINGLE BUSINESS PICKUP */}
//           {businessPickup && (
//             <Marker
//               position={[
//                 businessPickup.location.coordinates[1],
//                 businessPickup.location.coordinates[0],
//               ]}
//               icon={pickupIcon}
//             >
//               <Popup>
//                 <b>{businessPickup.name || "Business Pickup"}</b>
//                 <br />
//                 {businessPickup.address?.display_name}
//               </Popup>
//             </Marker>
//           )}

//           {/* 🚚 DRIVER ROUTES */}
//           {routes.map((route) => (
//             <DriverRoute key={route.driverId} route={route} />
//           ))}
//         </MapContainer>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import DriverRoute from "./DriverRoute";

/* ======================
   ICONS
====================== */
const pickupIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
  iconSize: [32, 32],
});

export default function MapPage() {
  const [drivers, setDrivers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [driversRes, ordersRes, businessRes] = await Promise.all([
      axios.get("http://localhost:4000/api/drivers"),
      axios.get("http://localhost:4000/api/orders"),
      axios.get("http://localhost:4000/api/settings/business"),
    ]);

    setDrivers(driversRes.data);
    setOrders(ordersRes.data);
    setBusiness(businessRes.data);
  }

  /* ======================
     BUILD DRIVER ROUTES
  ====================== */
  const routes = drivers
    .map((driver, index) => {
      const assignedOrders = orders.filter(
        (o) =>
          o.driverId === driver._id &&
          o.delivery?.location?.coordinates
      );

      if (assignedOrders.length === 0) return null;
      if (!business?.pickup?.location?.coordinates) return null;

      const [plng, plat] = business.pickup.location.coordinates;

      const pickup = [plat, plng];

      const deliveries = assignedOrders.map((o) => {
        const [dlng, dlat] = o.delivery.location.coordinates;
        return [dlat, dlng];
      });

      return {
        driverId: driver._id,
        driverName: driver.name,
        pickup,
        deliveries,
        colorIndex: index,
      };
    })
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-[#F5F7FF] p-4">
      <h1 className="text-2xl font-bold mb-4">Live Driver Routes</h1>

      <div className="h-[75vh] rounded-xl overflow-hidden shadow bg-white">
        <MapContainer
          center={[28.6139, 77.209]}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* 🏢 SINGLE BUSINESS PICKUP (ONCE) */}
          {business?.pickup?.location && (
            <Marker
              position={[
                business.pickup.location.coordinates[1],
                business.pickup.location.coordinates[0],
              ]}
              icon={pickupIcon}
            >
              <Popup>
                <b>{business.businessName}</b>
                <br />
                {business.pickup.address?.display_name}
              </Popup>
            </Marker>
          )}

          {/* 🚚 DRIVER ROUTES */}
          {routes.map((route) => (
            <DriverRoute key={route.driverId} route={route} />
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

