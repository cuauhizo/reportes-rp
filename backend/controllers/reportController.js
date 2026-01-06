const pool = require('../config/db')

// Obtener Reporte con Filtros y KPIs calculados
exports.getReportData = async (req, res) => {
  try {
    // Recibimos clientId. Si no viene, asumimos 1 por defecto (para no romper nada)
    const { start, end, label, clientId = 1 } = req.query

    // 1. Buscar el ÚLTIMO reporte de este cliente
    // const [reports] = await pool.query('SELECT * FROM reports WHERE client_id = ? ORDER BY id DESC LIMIT 1', [clientId])
    // CAMBIO EN LA CONSULTA: Hacemos JOIN con la tabla clients para sacar el nombre
    const query = `
            SELECT r.*, c.name as client_name, c.logo_url 
            FROM reports r 
            JOIN clients c ON r.client_id = c.id 
            WHERE r.client_id = ? 
            ORDER BY r.id DESC LIMIT 1
        `

    const [reports] = await pool.query(query, [clientId])

    // Si el cliente no tiene reportes, devolvemos un objeto vacío seguro
    if (reports.length === 0) {
      return res.status(404).json({ message: 'Este cliente aún no tiene reportes configurados' })
    }

    const report = reports[0]

    // 2. Buscar noticias usando el ID del reporte encontrado
    let newsQuery = 'SELECT * FROM news_items WHERE report_id = ?'
    let newsParams = [report.id]

    if (start && end) {
      newsQuery += ' AND publication_date BETWEEN ? AND ?'
      newsParams.push(start, end)
    }
    newsQuery += ' ORDER BY publication_date DESC'

    const [news] = await pool.query(newsQuery, newsParams)

    // 3. Calcular KPIs
    const kpis = {
      total_impacts: news.length,
      total_reach: news.reduce((sum, item) => sum + item.reach, 0),
      total_ave: news.reduce((sum, item) => sum + Number(item.ave_value), 0),
      tier1_count: news.filter(n => n.tier === 'Tier 1').length,
    }

    const sentimentCounts = {
      positive: news.filter(n => n.sentiment === 'Positivo').length,
      neutral: news.filter(n => n.sentiment === 'Neutro').length,
      negative: news.filter(n => n.sentiment === 'Negativo').length,
    }

    // 1. DETERMINAR GRANULARIDAD (Día vs Mes)
const startDateObj = new Date(start || report.start_date);
const endDateObj = new Date(end || report.end_date);
const diffTime = Math.abs(endDateObj - startDateObj);
const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

// Si el periodo es mayor a 40 días (ej. Trimestral o Anual), agrupamos por MES.
// Si es menor (ej. Mensual o Rango corto), agrupamos por DÍA.
let dateFormatSQL;
let labelFormatJS; // Para formatear bonito la fecha

if (diffDays > 40) {
    // Modo ANUAL/TRIMESTRAL -> Agrupar por Mes (YYYY-MM)
    dateFormatSQL = '%Y-%m'; 
} else {
    // Modo MENSUAL -> Agrupar por Día (YYYY-MM-DD)
    dateFormatSQL = '%Y-%m-%d';
}

// 2. CONSULTA SQL PARA LA GRÁFICA
// Usamos el mismo filtro de noticias (newsQuery) pero agrupamos
const trendQuery = `
    SELECT 
        DATE_FORMAT(publication_date, ?) as date_label, 
        COUNT(*) as count 
    FROM news_items 
    WHERE report_id = ? 
    ${start && end ? 'AND publication_date BETWEEN ? AND ?' : ''}
    GROUP BY date_label 
    ORDER BY date_label ASC
`;

const trendParams = [dateFormatSQL, report.id];
if (start && end) trendParams.push(start, end);

const [trendResults] = await pool.query(trendQuery, trendParams);

// 3. FORMATEAR PARA EL FRONTEND (Chart.js)
const trendData = {
    labels: trendResults.map(item => item.date_label),
    values: trendResults.map(item => item.count)
};

    res.json({
      // meta: { ...report, period_label: label || report.period_label },
      meta: { ...report, client_name: report.client_name, logo_url: report.logo_url, period_label: label || report.period_label },
      kpis,
      sentimentCounts,
      trendData,
      news
    })
  } catch (error) {
    res.status(500).json({ message: 'Error en servidor', error })
  }
}

// Actualizar Datos Cualitativos (FODA, Hitos)
exports.updateReportMeta = async (req, res) => {
  try {
    const { swot_strengths, swot_opportunities, swot_weaknesses, swot_threats, milestones, roadmap } = req.body
    const query = `
            UPDATE reports SET 
            swot_strengths=?, swot_opportunities=?, swot_weaknesses=?, swot_threats=?, milestones=?, roadmap=?
            WHERE id = 1`

    await pool.query(query, [swot_strengths, swot_opportunities, swot_weaknesses, swot_threats, milestones, roadmap])
    res.json({ message: 'Estrategia actualizada' })
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar estrategia', error })
  }
}
