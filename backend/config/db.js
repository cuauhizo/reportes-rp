const mysql = require('mysql2/promise')
require('dotenv').config() // Cargar variables de entorno

// Crear el pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tolko_rp_reports',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Probar conexión (Opcional pero recomendado)
pool
  .getConnection()
  .then(conn => {
    console.log('✅ Conectado a la Base de Datos MySQL')
    conn.release()
  })
  .catch(err => {
    console.error('❌ Error de conexión a la Base de Datos:', err.message)
  })

module.exports = pool
