
// import React, { useEffect, useRef } from "react";
// import { Marker, Polyline, Popup } from "react-leaflet";
// import L from "leaflet";

// // Icons
// const pickupIcon = new L.Icon({
//   iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
//   iconSize: [32, 32],
// });

// const deliveryIcon = new L.Icon({
//   iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
//   iconSize: [32, 32],
// });

// // Colors per driver
// const COLORS = ["#4f46e5", "#16a34a", "#dc2626", "#f59e0b", "#0ea5e9"];

// const movingDot = (color) =>
//   L.divIcon({
//     html: `<div style="
//       width:14px;
//       height:14px;
//       background:${color};
//       border-radius:50%;
//       border:2px solid white;
//     "></div>`,
//   });

// // Loop animation
// function animate(markerRef, path) {
//   let index = 0;

//   return setInterval(() => {
//     if (!markerRef.current) return;
//     markerRef.current.setLatLng(path[index]);
//     index = (index + 1) % path.length; // 🔁 loop forever
//   }, 900);
// }

// export default function DriverRoute({ route }) {
//   const markerRef = useRef(null);
//   const color = COLORS[route.colorIndex % COLORS.length];
//   const path = [route.pickup, ...route.deliveries];

//   useEffect(() => {
//     const timer = animate(markerRef, path);
//     return () => clearInterval(timer);
//   }, [route.driverId]); // 👈 safe dependency

//   return (
//     <>
//       {/* Route */}
//       <Polyline positions={path} pathOptions={{ color, weight: 4 }} />

//       {/* Pickup */}
//       <Marker position={route.pickup} icon={pickupIcon}>
//         <Popup>
//           <b>{route.driverName}</b>
//           <br />
//           Pickup Location
//         </Popup>
//       </Marker>

//       {/* Deliveries */}
//       {route.deliveries.map((pos, i) => (
//         <Marker key={i} position={pos} icon={deliveryIcon}>
//           <Popup>
//             <b>{route.driverName}</b>
//             <br />
//             Delivery #{i + 1}
//           </Popup>
//         </Marker>
//       ))}

//       {/* Moving driver */}
//       <Marker ref={markerRef} position={path[0]} icon={movingDot(color)} />
//     </>
//   );
// }


import React, { useEffect, useRef } from "react";
import { Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";

/* ======================
   ICONS
====================== */
const deliveryIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  iconSize: [32, 32],
});

/* ======================
   COLORS PER DRIVER
====================== */
const COLORS = ["#4f46e5", "#16a34a", "#dc2626", "#f59e0b", "#0ea5e9"];

/* ======================
   MOVING DRIVER ICON
====================== */
const movingDot = (color) =>
  L.divIcon({
    html: `<div style="
      width:14px;
      height:14px;
      background:${color};
      border-radius:50%;
      border:2px solid white;
    "></div>`,
  });

/* ======================
   LOOPED ANIMATION
====================== */
function animate(markerRef, path) {
  let index = 0;

  return setInterval(() => {
    if (!markerRef.current || path.length === 0) return;
    markerRef.current.setLatLng(path[index]);
    index = (index + 1) % path.length;
  }, 900);
}

export default function DriverRoute({ route }) {
  const markerRef = useRef(null);
  const color = COLORS[route.colorIndex % COLORS.length];

  // Pickup → delivery1 → delivery2 → …
  const path = [route.pickup, ...route.deliveries];

  useEffect(() => {
    const timer = animate(markerRef, path);
    return () => clearInterval(timer);
  }, [route.driverId]);

  return (
    <>
      {/* 🛣 ROUTE LINE */}
      <Polyline positions={path} pathOptions={{ color, weight: 4 }} />

      {/* 📍 DELIVERY POINTS */}
      {route.deliveries.map((pos, i) => (
        <Marker key={i} position={pos} icon={deliveryIcon}>
          <Popup>
            <b>{route.driverName}</b>
            <br />
            Delivery #{i + 1}
          </Popup>
        </Marker>
      ))}

      {/* 🚚 MOVING DRIVER */}
      <Marker
        ref={markerRef}
        position={path[0]}
        icon={movingDot(color)}
      >
        <Popup>
          <b>{route.driverName}</b>
        </Popup>
      </Marker>
    </>
  );
}
