const pool = require('../config/db')

exports.getClients = async (req, res) => {
  try {
    const [clients] = await pool.query('SELECT id, name, logo_url FROM clients')
    res.json(clients)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener clientes', error })
  }
}

// CREAR CLIENTE NUEVO (Y SU REPORTE BASE AUTOMÁTICO)
exports.createClient = async (req, res) => {
  try {
    const { name } = req.body

    if (!name) return res.status(400).json({ message: 'El nombre es obligatorio' })

    // 1. Insertar Cliente
    const [clientResult] = await pool.query('INSERT INTO clients (name) VALUES (?)', [name])
    const newClientId = clientResult.insertId

    // 2. AUTOMÁTICO: Crear su primer reporte base (Año actual)
    const currentYear = new Date().getFullYear()
    await pool.query(
      `INSERT INTO reports (client_id, period_label, period_type, start_date, end_date) 
             VALUES (?, ?, 'anual', ?, ?)`,
      [newClientId, `Reporte Anual ${currentYear}`, `${currentYear}-01-01`, `${currentYear}-12-31`],
    )

    res.status(201).json({ message: 'Cliente y reporte inicial creados correctamente', id: newClientId })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al crear cliente' })
  }
}

// ELIMINAR CLIENTE
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params
    const [result] = await pool.query('DELETE FROM clients WHERE id = ?', [id])

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Cliente no encontrado' })

    res.json({ message: 'Cliente y sus datos eliminados correctamente' })
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar cliente' })
  }
}
