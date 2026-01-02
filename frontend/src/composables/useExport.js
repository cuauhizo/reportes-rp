import * as XLSX from 'xlsx'
import html2pdf from 'html2pdf.js'

export function useExport() {
  // --- 1. EXPORTAR A EXCEL ---
  const exportToExcel = (data, fileName = 'reporte.xlsx') => {
    if (!data || data.length === 0) {
      alert('No hay datos para exportar')
      return
    }

    // Preparamos los datos para que se vean bonitos en Excel
    const formattedData = data.map((item) => ({
      Fecha: item.publication_date.split('T')[0],
      Tema: item.key_message,
      Medio: item.media_name,
      Tipo: item.media_type,
      Reportero: item.reporter,
      Alcance: item.reach,
      AVE: item.ave_value,
      Titulo: item.title,
      Sentimiento: item.sentiment,
      Tier: item.tier,
    }))

    // Crear hoja de trabajo
    const worksheet = XLSX.utils.json_to_sheet(formattedData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Noticias')

    // Descargar archivo
    XLSX.writeFile(workbook, fileName)
  }

  // --- 2. EXPORTAR A PDF ---
  const exportToPDF = (elementId, fileName = 'reporte.pdf') => {
    const element = document.getElementById(elementId)

    if (!element) {
      console.error(`Elemento con id ${elementId} no encontrado`)
      return
    }

    const opt = {
      margin: [10, 10], // Margenes (top, left) en mm
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false }, // Scale 2 mejora la calidad
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }

    // Generar PDF
    // Ocultamos botones temporalmente para que no salgan en el PDF
    const buttons = document.querySelectorAll('.no-print')
    buttons.forEach((b) => (b.style.display = 'none'))

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        // Restaurar botones
        buttons.forEach((b) => (b.style.display = ''))
      })
  }

  return { exportToExcel, exportToPDF }
}
