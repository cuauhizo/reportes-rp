const express = require('express')
const router = express.Router()
const newsController = require('../controllers/newsController')

router.get('/', newsController.getAllNews)
router.post('/', newsController.createNews)
router.put('/:id', newsController.updateNews)

module.exports = router
