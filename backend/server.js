const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config() // Cargar variables de entorno

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())

// Importar Rutas
const reportRoutes = require('./routes/reportRoutes')
const newsRoutes = require('./routes/newsRoutes')
const clientRoutes = require('./routes/clientRoutes')

// Usar Rutas
app.use('/api/report', reportRoutes)
app.use('/api/news', newsRoutes)
app.use('/api/clients', clientRoutes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Servidor
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
})
