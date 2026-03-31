const express = require('express')
const router = express.Router()
const newsController = require('../controllers/newsController')
const multer = require('multer')
const path = require('path')

// --- CONFIGURACIÓN MULTER ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/') // Carpeta donde se guardan
  },
  filename: (req, file, cb) => {
    // Nombre único: fecha + extensión original
    cb(null, Date.now() + path.extname(file.originalname))
  },
})

const upload = multer({ storage: storage })

// --- RUTAS ---
router.get('/', newsController.getAllNews)

// 👇 Usamos upload.single('file') para procesar el archivo que viene del frontend
router.post('/', upload.single('file'), newsController.createNews)
router.put('/:id', upload.single('file'), newsController.updateNews)
router.delete('/:id', newsController.deleteNews)

module.exports = router
