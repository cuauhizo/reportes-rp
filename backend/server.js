const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// 1. Conexión a Base de Datos
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',      // Tu usuario de MySQL
    password: '',      // Tu contraseña de MySQL
    database: 'tolko_rp_reports'
});

// 2. Endpoint para obtener un reporte completo con calculos automáticos
app.get('/api/report/:type', async (req, res) => {
    try {
        const { type } = req.params; // 'annual', 'monthly', etc.
        
        // A. Obtener datos generales del reporte (FODA, Hitos)
        const [reports] = await pool.query('SELECT * FROM reports WHERE period_type = ? LIMIT 1', [type]);
        if (reports.length === 0) return res.status(404).json({ message: 'Reporte no encontrado' });
        const report = reports[0];

        // B. Obtener todas las notas asociadas
        const [news] = await pool.query('SELECT * FROM news_items WHERE report_id = ? ORDER BY publication_date DESC', [report.id]);

        // C. CALCULAR MÉTRICAS AUTOMÁTICAMENTE (Backend Logic)
        const kpis = {
            total_impacts: news.length,
            total_reach: news.reduce((sum, item) => sum + item.reach, 0),
            total_ave: news.reduce((sum, item) => sum + Number(item.ave_value), 0),
            tier1_count: news.filter(n => n.tier === 'Tier 1').length
        };
        
        // Calcular porcentajes para gráficas
        const sentimentCounts = {
            positive: news.filter(n => n.sentiment === 'Positivo').length,
            neutral: news.filter(n => n.sentiment === 'Neutro').length,
            negative: news.filter(n => n.sentiment === 'Negativo').length
        };

        res.json({
            meta: report,
            kpis,
            sentimentCounts,
            news // Lista completa de notas para el Timeline
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error en servidor');
    }
});

app.listen(3000, () => console.log('Servidor corriendo en puerto 3000'));