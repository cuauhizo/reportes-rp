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
