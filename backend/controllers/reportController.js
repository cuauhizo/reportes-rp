const pool = require('../config/db')

// Obtener Reporte con Filtros y KPIs calculados
// Obtener Reporte con Filtros y KPIs calculados
exports.getReportData = async (req, res) => {
  try {
    const { start, end, label, clientId = 1 } = req.query

    console.log(`--- SOLICITUD REPORTE CLIENTE ${clientId} ---`)

    // 1. Buscar el reporte del cliente
    // (Nota: Quitamos c.monthly_goal de aquí porque ahora usamos la tabla histórica)
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

    // --- 3. LÓGICA DE META HISTÓRICA (ESTO DEBE IR ANTES DE "const kpis") ---
    const startDateObj = new Date(start || report.start_date)
    const endDateObj = new Date(end || report.end_date)

    // Declaramos la variable UNA sola vez aquí arriba
    let calculatedGoal = 0

    // A. Traer todo el historial de metas del cliente
    const [goalHistory] = await pool.query('SELECT goal, valid_from FROM client_goals WHERE client_id = ? ORDER BY valid_from ASC', [clientId])

    if (goalHistory.length > 0) {
      const startD = new Date(startDateObj)
      const endD = new Date(endDateObj)

      // Iteramos día por día para sumar la "cuota diaria" correspondiente
      for (let d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1)) {
        let activeGoal = 0
        const currentCheckDate = d.getTime()

        // Buscamos la última meta válida para esta fecha
        for (let i = goalHistory.length - 1; i >= 0; i--) {
          const goalDate = new Date(goalHistory[i].valid_from).getTime()
          if (goalDate <= currentCheckDate) {
            activeGoal = goalHistory[i].goal
            break
          }
        }

        if (activeGoal > 0) {
          // Sumar proporción diaria
          const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
          calculatedGoal += activeGoal / daysInMonth
        }
      }
    } else {
      // Fallback: Si no hay historial en la tabla nueva, intentamos leer de la tabla vieja 'clients'
      const [clientData] = await pool.query('SELECT monthly_goal FROM clients WHERE id = ?', [clientId])
      const baseGoal = clientData[0]?.monthly_goal || 0

      if (baseGoal > 0) {
        const diffTime = Math.abs(endDateObj - startDateObj)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1
        const durationInMonths = diffDays / 30.44
        calculatedGoal = Math.round(baseGoal * durationInMonths)
      }
    }

    // Redondear el resultado final
    calculatedGoal = Math.round(calculatedGoal)

    // --- 4. AHORA SÍ DEFINIMOS LOS KPIS (LA VARIABLE YA EXISTE) ---
    const kpis = {
      total_impacts: news.length,
      monthly_goal: calculatedGoal, // ✅ Ahora sí funciona
      total_reach: news.reduce((sum, item) => sum + item.reach, 0),
      total_ave: news.reduce((sum, item) => sum + Number(item.ave_value), 0),
      tier1_count: news.filter(n => n.tier === 'Tier 1').length,
    }

    const sentimentCounts = {
      positive: news.filter(n => n.sentiment === 'Positivo').length,
      neutral: news.filter(n => n.sentiment === 'Informativo').length,
      negative: news.filter(n => n.sentiment === 'Negativo').length,
    }

    // --- 5. LÓGICA DE GRÁFICA ---
    const diffTime = Math.abs(endDateObj - startDateObj)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1

    let dateFormatSQL
    if (diffDays > 45) {
      dateFormatSQL = '%Y-%m'
    } else {
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
