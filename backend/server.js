const express = require('express')
const mysql = require('mysql2/promise')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json())

// 1. Conexión a Base de Datos
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // Tu usuario de MySQL
  password: '', // Tu contraseña de MySQL
  database: 'tolko_rp_reports',
})

app.get('/api/report', async (req, res) => {
  try {
    const { type, start, end } = req.query

    let reportQuery = 'SELECT * FROM reports WHERE id = 1' // Por defecto usamos el reporte base (ID 1)
    let newsQuery = 'SELECT * FROM news_items WHERE report_id = 1'
    let newsParams = []

    if (start && end) {
      newsQuery += ' AND publication_date BETWEEN ? AND ?'
      newsParams = [start, end]
    }

    newsQuery += ' ORDER BY publication_date DESC'

    const [reports] = await pool.query(reportQuery)
    const report = reports[0]
    const [news] = await pool.query(newsQuery, newsParams)
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
      meta: { ...report, period_label: type || 'Personalizado' }, // Devolvemos el tipo solicitado
      kpis,
      sentimentCounts,
      news,
    })
  } catch (error) {
    console.error(error)
    res.status(500).send('Error en servidor')
  }
})

// 3. Endpoint para CREAR una nueva noticia (POST)
app.post('/api/news', async (req, res) => {
  try {
    const { publication_date, media_name, reporter, title, reach, ave_value, tier, sentiment, media_type, key_message } = req.body

    // Validación básica
    if (!media_name || !title || !publication_date) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' })
    }

    const query = `
            INSERT INTO news_items 
            (report_id, publication_date, media_name, reporter, title, reach, ave_value, tier, sentiment, media_type, key_message) 
            VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `

    // Asumimos report_id = 1 por defecto
    const values = [publication_date, media_name, reporter, title, reach, ave_value, tier, sentiment, media_type, key_message]

    const [result] = await pool.query(query, values)

    res.json({ message: 'Noticia guardada con éxito', id: result.insertId })
  } catch (error) {
    console.error(error)
    res.status(500).send('Error al guardar la noticia')
  }
})

// 4. Endpoint para ACTUALIZAR el Reporte (FODA, Hitos, etc.)
app.put('/api/report/1', async (req, res) => {
  try {
    const { swot_strengths, swot_opportunities, swot_weaknesses, swot_threats, milestones, roadmap } = req.body

    const query = `
            UPDATE reports 
            SET 
                swot_strengths = ?, 
                swot_opportunities = ?, 
                swot_weaknesses = ?, 
                swot_threats = ?, 
                milestones = ?, 
                roadmap = ?
            WHERE id = 1
        `

    await pool.query(query, [swot_strengths, swot_opportunities, swot_weaknesses, swot_threats, milestones, roadmap])

    res.json({ message: 'Reporte actualizado correctamente' })
  } catch (error) {
    console.error(error)
    res.status(500).send('Error al actualizar reporte')
  }
})

app.listen(3000, () => console.log('Servidor corriendo en puerto 3000'))
