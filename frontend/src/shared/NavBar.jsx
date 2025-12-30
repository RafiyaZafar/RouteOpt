import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../state/auth";

export default function NavBar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation();

  if (!user) return null; // hide on login page

  // ORDER the way you want them
  const menu = [
    { label: "Dispatch", path: "/dispatch", adminOnly: true },
    { label: "Orders", path: "/orders" },
    { label: "Drivers", path: "/drivers", adminOnly: true },
    { label: "Map", path: "/map" },
  ];

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-6 py-3 flex items-center">

        {/* Left Logo */}
        <div 
          onClick={() => nav("/dispatch")}
          className="text-xl font-bold cursor-pointer flex-1 select-none"
        >
          <span className="text-indigo-600">Route</span>Opt
        </div>

        {/* Right side menu */}
        <div className="flex items-center gap-6">

          {/* Navigation links */}
          <div className="flex gap-6">
            {menu.map(item=>{
              if(item.adminOnly && user.role!=="admin") return null;

              const active = pathname === item.path;

              return (
                <Link 
                  key={item.path}
                  to={item.path}
                  className={`font-medium transition pb-1 ${
                    active 
                      ? "text-indigo-600 border-b-2 border-indigo-600" 
                      : "text-gray-700 hover:text-indigo-600"
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Logout button */}
          <button
            onClick={() => { logout(); nav("/login") }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-medium"
          >
            Logout
          </button>

        </div>

      </nav>
    </header>
  );
}
