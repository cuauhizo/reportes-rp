const pool = require('../config/db')

// Obtener TODAS las noticias (Para la tabla de Admin)
exports.getAllNews = async (req, res) => {
  try {
    const [news] = await pool.query('SELECT * FROM news_items ORDER BY publication_date DESC')
    res.json(news)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener noticias', error })
  }
}

// Crear una nueva noticia
exports.createNews = async (req, res) => {
  try {
    const { clientId, publication_date, media_name, reporter, title, reach, ave_value, tier, sentiment, media_type, key_message } = req.body

    // --- 1. VALIDACIONES ---
    const errors = []

    // 1. Buscamos el reporte ID asociado a ese cliente
    const [reports] = await pool.query('SELECT id FROM reports WHERE client_id = ? ORDER BY id DESC LIMIT 1', [clientId])

    if (reports.length === 0) {
      return res.status(404).json({ message: 'No se encontró un reporte para este cliente.' })
    }

    const reportId = reports[0].id

    // Validar campos obligatorios
    if (!media_name || media_name.trim() === '') errors.push('El nombre del medio es obligatorio.')
    if (!title || title.trim() === '') errors.push('El titular es obligatorio.')
    if (!key_message || key_message.trim() === '') errors.push('El mensaje clave es obligatorio.')
    if (!publication_date) errors.push('La fecha de publicación es obligatoria.')

    // Validar tipos de datos (Números)
    if (reach && isNaN(reach)) errors.push('El Alcance debe ser un número válido.')
    if (ave_value && isNaN(ave_value)) errors.push('El Valor (AVE) debe ser un número válido.')

    // Si hay errores, devolvemos 400 (Bad Request) y NO guardamos nada
    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Error de validación',
        details: errors,
      })
    }

    // --- 2. LOGICA DE GUARDADO ---
    const query = `
            INSERT INTO news_items 
            (report_id, publication_date, media_name, reporter, title, reach, ave_value, tier, sentiment, media_type, key_message) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

    // Aseguramos que los números sean números (parse)
    const safeReach = Number(reach) || 0
    const safeAve = Number(ave_value) || 0

    const [result] = await pool.query(query, [reportId, publication_date, media_name, reporter, title, safeReach, safeAve, tier, sentiment, media_type, key_message])

    res.status(201).json({ message: 'Noticia guardada con éxito', id: result.insertId })
  } catch (error) {
    console.error('Error SQL:', error) // Log interno para ti
    res.status(500).json({ message: 'Error interno del servidor al guardar la noticia.' })
  }
}

// Editar una noticia
exports.updateNews = async (req, res) => {
  try {
    const { id } = req.params
    const { publication_date, media_name, reporter, title, reach, ave_value, tier, sentiment, media_type, key_message } = req.body

    const query = `
            UPDATE news_items 
            SET publication_date=?, media_name=?, reporter=?, title=?, reach=?, ave_value=?, tier=?, sentiment=?, media_type=?, key_message=?
            WHERE id = ?`

    const [result] = await pool.query(query, [publication_date, media_name, reporter, title, reach, ave_value, tier, sentiment, media_type, key_message, id])

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Noticia no encontrada' })
    res.json({ message: 'Noticia actualizada' })
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar', error })
  }
}

// ELIMINAR NOTICIA
exports.deleteNews = async (req, res) => {
  try {
    const { id } = req.params
    const [result] = await pool.query('DELETE FROM news_items WHERE id = ?', [id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Noticia no encontrada' })
    }

    res.json({ message: 'Noticia eliminada correctamente' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al eliminar noticia' })
  }
}
