import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6">Ecommers Panel</h2>
      <nav className="flex flex-col gap-4">
        <Link to="/" className="hover:bg-gray-700 p-2 rounded">Dashboard</Link>
        <Link to="/profile" className="hover:bg-gray-700 p-2 rounded">User Profile</Link>
        <Link to="/usuarios" className="hover:bg-gray-700 p-2 rounded">User Profile</Link>
        <Link to="/peticiones" className="hover:bg-gray-700 p-2 rounded">Peticiones</Link>
      </nav>
    </div>
  );
}
