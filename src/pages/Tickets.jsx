import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";

export default function Tickets() {
  const [tickets, setTickets] = useState([]);

  // 🔹 Cargar tickets al montar el componente
  useEffect(() => {
    traerTickets();
  }, []);

  // 🟢 Traer todos los tickets
  const traerTickets = async () => {
    try {
      const res = await fetch("http://localhost:3000/tickets");
      const data = await res.json();
      setTickets(data);
    } catch (error) {
      console.error("Error al obtener tickets:", error);
    }
  };

  //  Procesar ticket
  const procesarTicket = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/tickets/procesar/${id}`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Error al procesar ticket");
      const data = await res.json();
      console.log(data.message);
      traerTickets();
    } catch (error) {
      console.error("Error al procesar ticket:", error);
    }
  };

  // 🔴 Cerrar ticket
  const cerrarTicket = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/tickets/cerrar/${id}`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Error al cerrar ticket");

      const data = await res.json();
      console.log(data.message);
      traerTickets();
    } catch (error) {
      console.error("Error al cerrar ticket:", error);
    }
  };

  // 🧩 Columnas de la tabla
  const columnas = [
    {
      name: "Cliente",
      selector: (row) => row.nombre_cliente || "N/A",
      sortable: true,
    },
    {
      name: "Asunto",
      selector: (row) => row.asunto || "N/A",
      sortable: true,
      wrap: true,
    },
    {
      name: "Estado",
      selector: (row) => row.estado,
      sortable: true,
      cell: (row) => (
        <span
          className={`font-semibold ${
            row.estado === "Abierto"
              ? "text-yellow-600"
              : row.estado === "En_Proceso"
              ? "text-blue-600"
              : row.estado === "Cerrado"
              ? "text-green-600"
              : "text-gray-700"
          }`}
        >
          {row.estado || "N/A"}
        </span>
      ),
    },
    {
      name: "Fecha de Creación",
      selector: (row) => row.fecha_creacion || "N/A",
      sortable: true,
    },
    {
      name: "Categoría",
      selector: (row) => row.categoria || "N/A",
      sortable: true,
    },
    {
      name: "Prioridad",
      selector: (row) => row.prioridad || "N/A",
      sortable: true,
    },
    {
      name: "Acción",
      cell: (row) => (
        <>
          {row.estado === "Abierto" ? (
            <button
              onClick={() => procesarTicket(row.id_ticket)}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition duration-200 cursor-pointer"
            >
              Procesar
            </button>
          ) : row.estado === "En_Proceso" ? (
            <button
              onClick={() => cerrarTicket(row.id_ticket)}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition duration-200 cursor-pointer"
            >
              Cerrar Ticket
            </button>
          ) : (
            <span className="text-gray-500">Finalizado</span>
          )}
        </>
      ),
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#f9f9f9",
        fontWeight: "bold",
        fontSize: "14px",
      },
    },
    cells: {
      style: {
        fontSize: "14px",
      },
    },
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Lista de Tickets</h2>
      <DataTable
        columns={columnas}
        data={tickets}
        pagination
        highlightOnHover
        striped
        responsive
        customStyles={customStyles}
        noDataComponent="No hay tickets registrados."
      />
    </div>
  );
}