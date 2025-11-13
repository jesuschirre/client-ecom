import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import { FaTicketAlt, FaHourglassHalf, FaCheckCircle, FaLaptopCode, FaTags, FaCalendarAlt, FaSortAmountUpAlt } from "react-icons/fa"; // Importar iconos

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);

  // NOTA: Se eliminó 'modal' y 'mensajeCierre' ya que SweetAlert2 lo maneja.

  useEffect(() => {
    traerTickets();
  }, []);

  // --- Funciones de Lógica (sin cambios funcionales) ---

  // Traer tickets
  const traerTickets = async () => {
    try {
      const res = await fetch("http://localhost:3000/tickets");
      const data = await res.json();
      setTickets(data);
    } catch (error) {
      console.error("Error al obtener tickets:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los tickets',
      });
    }
  };

  // Procesar ticket
  const procesarTicket = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/tickets/procesar/${id}`, {
        method: "PUT",
      });

      if (!res.ok) throw new Error("Error al procesar ticket");

      const data = await res.json();
      traerTickets();

      Swal.fire({
        icon: 'success',
        title: 'Ticket en proceso',
        text: data.message,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error al procesar ticket:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo procesar el ticket',
      });
    }
  };

  // Abrir modal para cerrar ticket
  const abrirModalCerrar = (ticket) => {
    setTicketSeleccionado(ticket);
    Swal.fire({
      title: 'Cerrar Ticket',
      html: `Estás a punto de cerrar el ticket de ${ticket.nombre_cliente} con asunto: ${ticket.asunto}.`,
      input: 'textarea',
      inputLabel: 'Describe cómo se resolvió el ticket',
      inputPlaceholder: 'Escribe aquí la solución detallada...',
      inputAttributes: {
        'aria-label': 'Mensaje de cierre'
      },
      showCancelButton: true,
      confirmButtonText: 'Cerrar Ticket',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10B981', 
      cancelButtonColor: '#6B7280', 
      preConfirm: (mensaje) => {
        if (!mensaje || !mensaje.trim()) {
          Swal.showValidationMessage('Debes ingresar un mensaje de cierre');
        }
        return mensaje;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        cerrarTicket(ticket.id, result.value); // Pasar el id del ticket y el mensaje
      } else {
        setTicketSeleccionado(null); // Limpiar si se cancela
      }
    });
  };

  // Cerrar ticket con mensaje
  const cerrarTicket = async (id, mensaje) => {
    try {
      const res = await fetch(
        `http://localhost:3000/tickets/cerrar/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mensaje_remitente: mensaje }),
        }
      );
      if (!res.ok) throw new Error("Error al cerrar ticket");

      const data = await res.json();

      Swal.fire({
        icon: 'success',
        title: 'Ticket cerrado',
        text: data.message,
      });

      traerTickets();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cerrar el ticket',
      });
      console.error("Error al cerrar ticket:", error);
    } finally {
      setTicketSeleccionado(null);
    }
  };

  // --- Estilos y Columnas ---

  // Estilos de celda de estado mejorados
  const EstadoCell = ({ estado }) => {
    let styleClasses = "font-semibold px-3 py-1 rounded-full text-xs flex items-center justify-center min-w-[100px]";
    let icon = null;

    switch (estado) {
      case "Abierto":
        styleClasses += " bg-red-100 text-red-700 border border-red-300";
        icon = <FaTicketAlt className="mr-1" />;
        break;
      case "En_Proceso":
        styleClasses += " bg-blue-100 text-blue-700 border border-blue-300";
        icon = <FaHourglassHalf className="mr-1" />;
        break;
      case "Resuelto":
        styleClasses += " bg-green-100 text-green-700 border border-green-300";
        icon = <FaCheckCircle className="mr-1" />;
        break;
      default:
        styleClasses += " bg-gray-100 text-gray-500 border border-gray-300";
        break;
    }

    // Reemplaza el guion bajo por un espacio para una mejor visualización
    const displayEstado = estado ? estado.replace('_', ' ') : 'N/A';

    return (
      <span className={styleClasses}>
        {icon}
        {displayEstado}
      </span>
    );
  };

  // Definición de Columnas
  const columnas = [
    {
      name: <div className="flex items-center"><FaLaptopCode className="mr-2" />Cliente</div>,
      selector: (row) => row.nombre_cliente || "N/A",
      sortable: true,
      minWidth: "150px",
    },
    {
      name: <div className="flex items-center"><FaTags className="mr-2" />Asunto</div>,
      selector: (row) => row.asunto || "N/A",
      sortable: true,
      wrap: true,
      minWidth: "200px",
    },
    {
      name: "Estado",
      selector: (row) => row.estado,
      sortable: true,
      center: true,
      cell: (row) => <EstadoCell estado={row.estado} />,
    },
    {
      name: <div className="flex items-center"><FaCalendarAlt className="mr-2" />Creación</div>,
      selector: (row) => row.fecha_creacion || "N/A",
      sortable: true,
      minWidth: "120px",
      // Formatear la fecha si es necesario
      cell: (row) => row.fecha_creacion ? new Date(row.fecha_creacion).toLocaleDateString() : 'N/A'
    },
    {
      name: "Categoría",
      selector: (row) => row.categoria || "N/A",
      sortable: true,
    },
    {
      name: <div className="flex items-center"><FaSortAmountUpAlt className="mr-2" />Prioridad</div>,
      selector: (row) => row.prioridad || "N/A",
      sortable: true,
      cell: (row) => (
        <span className={`font-medium ${row.prioridad === 'Alta' ? 'text-red-600' : row.prioridad === 'Media' ? 'text-orange-500' : 'text-green-600'}`}>
          {row.prioridad || 'N/A'}
        </span>
      ),
      minWidth: "100px",
    },
    {
      name: "Acción",
      cell: (row) => (
        <div className="flex space-x-2">
          {row.estado === "Abierto" ? (
            <button
              onClick={() => procesarTicket(row.id)}
              className="bg-blue-600 text-white text-sm px-3 py-1 rounded-md hover:bg-blue-700 transition duration-200 shadow-md"
              title="Poner en proceso"
            >
              Procesar
            </button>
          ) : row.estado === "En_Proceso" ? (
            <button
              onClick={() => abrirModalCerrar(row)}
              className="bg-green-600 text-white text-sm px-3 py-1 rounded-md hover:bg-green-700 transition duration-200 shadow-md"
              title="Marcar como resuelto"
            >
              Cerrar
            </button>
          ) : (
            <span className="text-gray-500 text-sm italic">Finalizado</span>
          )}
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      minWidth: "130px",
    },
  ];

  // Estilos personalizados para la tabla (DataTable)
  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#E5E7EB", // gray-200
        color: "#1F2937", // gray-800
        fontWeight: "bold",
        fontSize: "14px",
        padding: "12px",
      },
    },
    cells: {
      style: {
        fontSize: "14px",
        padding: "12px",
      },
    },
    rows: {
      highlightOnHoverStyle: {
        backgroundColor: 'rgb(243 244 246)', // gray-100
        borderBottomColor: '#FFFFFF',
        borderRadius: '5px',
        cursor: 'pointer',
      },
    },
  };

  // --- Renderizado ---

  return (
    <div >
      <div className="p-5 mx-auto">
        {/* Encabezado */}
        <div className="p-6  text-black">
          <h2 className="text-3xl font-extrabold flex items-center">
            <FaTicketAlt className="mr-3 text-black" />
            Gestión de Tickets de Soporte
          </h2>
          <p className="text-black mt-1">Revisa y administra el estado de todas las solicitudes de los clientes</p>
        </div>

        {/* Tabla */}
        <div className="p-6">
          <DataTable
            columns={columnas}
            data={tickets}
            pagination
            highlightOnHover
            striped
            responsive
            customStyles={customStyles}
            pointerOnHover // Agrega un puntero para indicar interactividad
            noDataComponent={
              <div className="p-10 text-center text-gray-500">
                <FaTicketAlt className="w-8 h-8 mx-auto mb-2" />
                No hay tickets registrados en este momento.
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}