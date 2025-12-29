const pool = require('../config/db')

// Obtener Reporte con Filtros y KPIs calculados
exports.getReportData = async (req, res) => {
  try {
    const { start, end, label } = req.query

    // 1. Datos Generales (FODA, Hitos) del reporte base
    const [reports] = await pool.query('SELECT * FROM reports WHERE id = 1')
    const report = reports[0]

    // 2. Query de Noticias con Filtro de Fechas
    let newsQuery = 'SELECT * FROM news_items WHERE report_id = 1'
    let newsParams = []

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

    res.json({
      meta: { ...report, period_label: label || report.period_label },
      kpis,
      sentimentCounts,
      news,
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
