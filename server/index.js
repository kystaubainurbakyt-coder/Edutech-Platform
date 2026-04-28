import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import { Pool } from "pg";
import express from 'express';
import cors from 'cors';
import { loadEnv } from "./env.js";
import { normalizeCoursePayload, seedCourses } from "./seed.js";

loadEnv();

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

// CORS-ты ең бірінші қосу керек
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));

app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// --- СІЗДІҢ МАРШРУТТАРЫҢЫЗ (HandleRequest орнына осыны қолдан) ---

// Мысалы: Курстарды алу
app.get('/courses', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM courses ORDER BY id");
        // Бұрынғы mapCourseRow логикаңды осы жерге немесе жеке функцияға шығарып қолдан
        res.json(result.rows); 
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Басқа маршруттарыңды (POST, PUT, DELETE) осы жерге app.post, app.put деп қоса бер.

// --- Қалған базалық функциялар (өзгеріссіз қалдыр) ---
async function ensureSchema() { /* ... сенің кодындағыensureSchema ... */ }
async function seedDatabase() { /* ... сенің кодындағы seedDatabase ... */ }

// --- СЕРВЕРДІ ІСКЕ ҚОСУ ---
async function startServer() {
    try {
        await ensureSchema();
        await seedDatabase();
        
        // http.createServer(handleRequest) орнына мынау:
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Сервер сәтті іске қосылды: http://0.0.0.0:${PORT}`);
        });
    } catch (error) {
        console.error("Сервер қатесі:", error);
        process.exit(1);
    }
}

startServer();