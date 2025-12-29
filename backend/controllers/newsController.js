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
    const { publication_date, media_name, reporter, title, reach, ave_value, tier, sentiment, media_type, key_message } = req.body

    const query = `
            INSERT INTO news_items 
            (report_id, publication_date, media_name, reporter, title, reach, ave_value, tier, sentiment, media_type, key_message) 
            VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` // Asumimos report_id = 1

    const [result] = await pool.query(query, [publication_date, media_name, reporter, title, reach, ave_value, tier, sentiment, media_type, key_message])
    res.json({ message: 'Noticia guardada', id: result.insertId })
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar noticia', error })
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
