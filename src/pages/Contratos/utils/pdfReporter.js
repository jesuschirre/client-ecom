// src/pages/Contratos/utils/pdfReporter.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';

// Columnas y formateo de datos (reutilizable)
const tableColumns = [
  "Campaña", "Cliente", "Documento", "Plan",
  "Inicio", "Fin", "Estado Locutor"
];

const formatContractsToRows = (contracts) => {
  return contracts.map(item => [
    item.nombre_campana,
    item.nombre_cliente,
    item.numero_documento || 'N/A',
    item.nombre_plan,
    item.fecha_inicio ? new Date(item.fecha_inicio).toLocaleDateString('es-PE') : 'N/A',
    item.fecha_fin ? new Date(item.fecha_fin).toLocaleDateString('es-PE') : 'N/A',
    item.estado_locutor || 'N/A'
  ]);
};

// --- NUEVA FUNCIÓN: Genera PDF para un solo estado ---
export function generateSingleStatusPDF(status, contracts) {
  const statusTitle = status.replace('_', ' ');
  Swal.fire({
    title: `Generando PDF: ${statusTitle}`,
    text: 'Preparando el documento...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    const doc = new jsPDF();
    const reportDate = new Date().toLocaleDateString('es-PE');
    const title = `Reporte de Contratos: ${statusTitle}`;

    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Fecha de Reporte: ${reportDate}`, 14, 28);
    doc.text(`Total de Contratos: ${contracts.length}`, 14, 34);

    const tableRows = formatContractsToRows(contracts);

    autoTable(doc, {
      startY: 40,
      head: [tableColumns],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [22, 160, 133] }, // Verde
    });

    doc.save(`reporte_contratos_${status.toLowerCase()}.pdf`);
    Swal.close();
  } catch (err) {
    console.error("Error generando PDF:", err);
    Swal.fire('Error', 'No se pudo generar el PDF. ' + err.message, 'error');
  }
}

// --- FUNCIÓN ANTERIOR (AHORA PARA REPORTE MAESTRO) ---
export function generateMasterPDFReport(stats, processedContratos) {
  Swal.fire({
    title: 'Generando Reporte Maestro',
    text: 'Esto puede tomar un momento...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    const doc = new jsPDF();
    const reportDate = new Date().toLocaleDateString('es-PE');
    doc.setFontSize(18);
    doc.text("Reporte Maestro de Contratos", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Fecha de Reporte: ${reportDate}`, 14, 28);

    autoTable(doc, {
      startY: 34,
      theme: 'striped',
      head: [['Estado', 'Cantidad']],
      body: [
        ['Total Contratos', stats.total],
        ['Activos', stats.activos],
        ['Programados', stats.programados],
        ['Por Vencer', stats.porVencer],
        ['Vencidos', stats.vencidos],
      ],
    });

    const statusGroups = [
      'Activo', 'Programado', 'Por_Vencer',
      'Vencido', 'Pendiente_Activacion', 'Cancelado'
    ];
    
    let startY = doc.lastAutoTable.finalY + 15;

    statusGroups.forEach(status => {
      const groupContracts = processedContratos.filter(c => c.estado === status);
      if (groupContracts.length > 0) {
        if (startY > 270) { doc.addPage(); startY = 20; }
        
        doc.setFontSize(14);
        doc.text(`Contratos: ${status.replace('_', ' ')} (${groupContracts.length})`, 14, startY);
        
        const tableRows = formatContractsToRows(groupContracts);
        
        autoTable(doc, {
          startY: startY + 4,
          head: [tableColumns],
          body: tableRows,
          theme: 'grid',
          headStyles: { fillColor: [41, 128, 185] }, // Azul
        });
        
        startY = doc.lastAutoTable.finalY + 15;
      }
    });

    doc.save('reporte_maestro_contratos.pdf');
    Swal.close();
  } catch (err) {
    console.error("Error generando PDF:", err);
    Swal.fire('Error', 'No se pudo generar el PDF. ' + err.message, 'error');
  }
}