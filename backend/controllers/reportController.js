const pool = require('../config/db')

// Obtener Reporte con Filtros y KPIs calculados
exports.getReportData = async (req, res) => {
  try {
    const { start, end, label, clientId = 1 } = req.query

    console.log(`--- SOLICITUD REPORTE CLIENTE ${clientId} ---`)
    console.log('Filtros recibidos:', { start, end, label })

    // 1. Buscar el reporte del cliente
    const query = `
            SELECT r.*, c.name as client_name, c.logo_url 
            FROM reports r 
            JOIN clients c ON r.client_id = c.id 
            WHERE r.client_id = ? 
            ORDER BY r.id DESC LIMIT 1
        `

    const [reports] = await pool.query(query, [clientId])

    if (reports.length === 0) {
      return res.status(404).json({ message: 'Este cliente aún no tiene reportes configurados' })
    }

    const report = reports[0]

    // 2. Buscar noticias
    let newsQuery = 'SELECT * FROM news_items WHERE report_id = ?'
    let newsParams = [report.id]

    if (start && end) {
      newsQuery += ' AND publication_date BETWEEN ? AND ?'
      newsParams.push(start, end)
    }
    newsQuery += ' ORDER BY publication_date DESC'

    const [news] = await pool.query(newsQuery, newsParams)

    // 3. KPIs
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

    // --- LÓGICA DE GRÁFICA ---
    // 1. DETERMINAR GRANULARIDAD
    const startDateObj = new Date(start || report.start_date)
    const endDateObj = new Date(end || report.end_date)
    const diffTime = Math.abs(endDateObj - startDateObj)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    let dateFormatSQL

    // LÓGICA MEJORADA:
    // Si la diferencia es mayor a 45 días, agrupamos por MES.
    // EXCEPCIÓN: Si estamos viendo un rango personalizado corto, forzamos DÍA.
    if (diffDays > 45) {
      console.log(`Modo: MENSUAL (%Y-%m) - Rango: ${diffDays} días`)
      dateFormatSQL = '%Y-%m'
    } else {
      console.log(`Modo: DIARIO (%Y-%m-%d) - Rango: ${diffDays} días`)
      dateFormatSQL = '%Y-%m-%d'
    }

    const trendQuery = `
        SELECT 
            DATE_FORMAT(publication_date, ?) as date_label, 
            COUNT(*) as count 
        FROM news_items 
        WHERE report_id = ? 
        ${start && end ? 'AND publication_date BETWEEN ? AND ?' : ''}
        GROUP BY date_label 
        ORDER BY date_label ASC
    `

    const trendParams = [dateFormatSQL, report.id]
    if (start && end) trendParams.push(start, end)

    const [trendResults] = await pool.query(trendQuery, trendParams)

    console.log('Datos Gráfica encontrados:', trendResults.length)

    const trendData = {
      labels: trendResults.map(item => item.date_label),
      values: trendResults.map(item => item.count),
    }

    res.json({
      meta: { ...report, client_name: report.client_name, logo_url: report.logo_url, period_label: label || report.period_label },
      kpis,
      sentimentCounts,
      trendData,
      news,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error en servidor', error })
  }
}

// Actualizar Datos Cualitativos (CORREGIDO)
exports.updateReportMeta = async (req, res) => {
  try {
    const { id } = req.params // Usamos el ID de la URL
    const { swot_strengths, swot_opportunities, swot_weaknesses, swot_threats, milestones, roadmap } = req.body

    const query = `
            UPDATE reports SET 
            swot_strengths=?, swot_opportunities=?, swot_weaknesses=?, swot_threats=?, milestones=?, roadmap=?
            WHERE id = ?`

    const [result] = await pool.query(query, [swot_strengths, swot_opportunities, swot_weaknesses, swot_threats, milestones, roadmap, id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Reporte no encontrado para actualizar' })
    }

    res.json({ message: 'Estrategia actualizada' })
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar estrategia', error })
  }
}
