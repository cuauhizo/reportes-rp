const pool = require('../config/db')

exports.getClients = async (req, res) => {
  try {
    const [clients] = await pool.query('SELECT id, name, logo_url, monthly_goal FROM clients')
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

// EDITAR CLIENTE
exports.updateClient_old = async (req, res) => {
  try {
    const { id } = req.params
    const { name, monthly_goal } = req.body

    // Validación básica: Debe haber al menos un dato para actualizar
    if (!name && monthly_goal === undefined) {
      return res.status(400).json({ message: 'No se enviaron datos para actualizar' })
    }

    // --- CONSTRUCCIÓN DINÁMICA DE LA CONSULTA ---
    // Esto asegura que solo actualicemos lo que nos llegó
    let fields = []
    let values = []

    if (name) {
      fields.push('name = ?')
      values.push(name)
    }

    // Verificamos si monthly_goal NO es undefined (puede ser 0, y eso es válido)
    if (monthly_goal !== undefined) {
      fields.push('monthly_goal = ?')
      values.push(monthly_goal)
    }

    values.push(id) // Agregamos el ID al final para el WHERE

    const query = `UPDATE clients SET ${fields.join(', ')} WHERE id = ?`

    await pool.query(query, values)

    res.json({ message: 'Cliente actualizado' })
  } catch (error) {
    console.error(error) // Importante para ver errores en consola
    res.status(500).json({ message: 'Error al actualizar', error })
  }
}

exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params
    const { name, monthly_goal } = req.body

    // 1. Actualizar Nombre (si viene)
    if (name) {
      await pool.query('UPDATE clients SET name = ? WHERE id = ?', [name, id])
    }

    // 2. Actualizar Meta (Lógica Histórica)
    if (monthly_goal !== undefined) {
      // A. Actualizamos el "actual" en la tabla clients por compatibilidad rápida
      await pool.query('UPDATE clients SET monthly_goal = ? WHERE id = ?', [monthly_goal, id])

      // B. INSERTAMOS en el historial
      // Usamos el primer día del mes actual para que aplique a todo el reporte de este mes
      const today = new Date()
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

      // Verificamos si ya existe una meta para este mes exacto para no duplicar, sino actualizar
      const [existing] = await pool.query('SELECT id FROM client_goals WHERE client_id = ? AND valid_from = ?', [id, firstDayOfMonth])

      if (existing.length > 0) {
        // Si ya cambiaron la meta este mismo mes, actualizamos ese registro
        await pool.query('UPDATE client_goals SET goal = ? WHERE id = ?', [monthly_goal, existing[0].id])
      } else {
        // Si es un mes nuevo, creamos registro nuevo
        await pool.query('INSERT INTO client_goals (client_id, goal, valid_from) VALUES (?, ?, ?)', [id, monthly_goal, firstDayOfMonth])
      }
    }

    res.json({ message: 'Cliente actualizado correctamente' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al actualizar' })
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
