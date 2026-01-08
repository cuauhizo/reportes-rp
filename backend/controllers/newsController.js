const pool = require('../config/db')
// Obtener todas las noticias con paginación, búsqueda y ordenamiento
exports.getAllNews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const search = req.query.search || ''
    const sortBy = req.query.sortBy || 'publication_date'
    const order = req.query.order === 'asc' ? 'ASC' : 'DESC'
    const clientId = req.query.clientId

    if (!clientId) {
      return res.json({ data: [], pagination: { page, limit, totalItems: 0, totalPages: 0 } })
    }

    const offset = (page - 1) * limit

    const allowedSortColumns = ['publication_date', 'reach', 'ave_value', 'title', 'media_name', 'reporter']
    const validSortBy = allowedSortColumns.includes(sortBy) ? `n.${sortBy}` : 'n.publication_date'

    let whereClause = 'WHERE r.client_id = ?'
    const queryParams = [clientId]

    if (search) {
      whereClause += ' AND (n.title LIKE ? OR n.media_name LIKE ? OR n.key_message LIKE ? OR n.reporter LIKE ?)'
      const term = `%${search}%`
      queryParams.push(term, term, term, term)
    }

    const dataQuery = `
        SELECT n.* FROM news_items n
        JOIN reports r ON n.report_id = r.id
        ${whereClause}
        ORDER BY ${validSortBy} ${order} 
        LIMIT ? OFFSET ?
    `

    const countQuery = `
        SELECT COUNT(*) as total 
        FROM news_items n
        JOIN reports r ON n.report_id = r.id
        ${whereClause}
    `

    const finalParams = [...queryParams, limit, offset]

    const [news] = await pool.query(dataQuery, finalParams)
    const [countResult] = await pool.query(countQuery, queryParams)

    const totalItems = countResult[0].total
    const totalPages = Math.ceil(totalItems / limit)

    res.json({
      data: news,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al obtener noticias' })
  }
}

// Crear una nueva noticia
exports.createNews = async (req, res) => {
  try {
    const { clientId, publication_date, media_name, reporter, title, reach, ave_value, tier, sentiment, media_type, key_message } = req.body

    const errors = []

    const [reports] = await pool.query('SELECT id FROM reports WHERE client_id = ? ORDER BY id DESC LIMIT 1', [clientId])

    if (reports.length === 0) {
      return res.status(404).json({ message: 'No se encontró un reporte para este cliente.' })
    }

    const reportId = reports[0].id

    if (!media_name || media_name.trim() === '') errors.push('El nombre del medio es obligatorio.')
    if (!title || title.trim() === '') errors.push('El titular es obligatorio.')
    if (!key_message || key_message.trim() === '') errors.push('El mensaje clave es obligatorio.')
    if (!publication_date) errors.push('La fecha de publicación es obligatoria.')

    if (reach && isNaN(reach)) errors.push('El Alcance debe ser un número válido.')
    if (ave_value && isNaN(ave_value)) errors.push('El Valor (AVE) debe ser un número válido.')

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Error de validación',
        details: errors,
      })
    }

    const query = `
            INSERT INTO news_items 
            (report_id, publication_date, media_name, reporter, title, reach, ave_value, tier, sentiment, media_type, key_message) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

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

// Eliminar una noticia
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
