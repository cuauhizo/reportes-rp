const express = require('express')
const router = express.Router()
const reportController = require('../controllers/reportController')

router.get('/', reportController.getReportData) // Maneja /api/report?start=...
router.put('/:id', reportController.updateReportMeta) // Maneja actualización de FODA

module.exports = router
