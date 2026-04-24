import http from "node:http";
import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import { Pool } from "pg";

import { loadEnv } from "./env.js";
import { normalizeCoursePayload, seedCourses } from "./seed.js";

loadEnv();

const PORT = Number(process.env.PORT ?? 4000);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Admin12345!";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// --- Helper функциялар ---
function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(payload));
}

function normalizePhone(phone) {
  return String(phone ?? "").replace(/\D/g, "");
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, hash] = String(storedHash ?? "").split(":");
  if (!salt || !hash) return false;
  const incoming = scryptSync(password, salt, 64);
  const stored = Buffer.from(hash, "hex");
  return incoming.length === stored.length && timingSafeEqual(incoming, stored);
}

async function parseBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new Error("JSON форматы дұрыс емес");
  }
}

// --- Дерекқор функциялары ---
async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(120) NOT NULL,
      phone VARCHAR(32) NOT NULL UNIQUE,
      email VARCHAR(160) UNIQUE,
      password_hash TEXT NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'user',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS courses (
      id SERIAL PRIMARY KEY,
      title VARCHAR(180) NOT NULL,
      instructor VARCHAR(120) NOT NULL,
      category VARCHAR(80) NOT NULL,
      level VARCHAR(20) NOT NULL,
      price NUMERIC(10, 2) NOT NULL DEFAULT 0,
      description TEXT NOT NULL,
      video_url TEXT NOT NULL,
      thumbnail TEXT,
      image TEXT,
      accent_color VARCHAR(30),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS lessons (
      id SERIAL PRIMARY KEY,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      lesson_order INTEGER NOT NULL,
      title VARCHAR(180) NOT NULL,
      duration VARCHAR(40) NOT NULL,
      video_url TEXT NOT NULL,
      summary TEXT NOT NULL,
      task_question TEXT NOT NULL,
      task_options JSONB NOT NULL,
      task_correct_answer TEXT NOT NULL,
      task_explanation TEXT NOT NULL,
      task_challenge TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS enrollments (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, course_id)
    );
    CREATE TABLE IF NOT EXISTS lesson_progress (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
      watched BOOLEAN NOT NULL DEFAULT FALSE,
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, lesson_id)
    );
  `);
}

async function seedDatabase() {
  const existing = await pool.query("SELECT COUNT(*)::int AS total FROM courses");
  if (existing.rows[0]?.total > 0) return;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const rawCourse of seedCourses) {
      const course = normalizeCoursePayload(rawCourse);
      const inserted = await client.query(
        `INSERT INTO courses (title, instructor, category, level, price, description, video_url, thumbnail, image, accent_color) 
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
        [course.title, course.instructor, course.category, course.level, course.price, course.description, course.videoUrl, course.thumbnail, course.image, course.accentColor]
      );
      await insertLessons(client, inserted.rows[0].id, course.lessons);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function insertLessons(client, courseId, lessons) {
  for (let index = 0; index < lessons.length; index += 1) {
    const lesson = lessons[index];
    await client.query(
      `INSERT INTO lessons (course_id, lesson_order, title, duration, video_url, summary, task_question, task_options, task_correct_answer, task_explanation, task_challenge) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10,$11)`,
      [courseId, index + 1, lesson.title, lesson.duration, lesson.videoUrl, lesson.summary, lesson.task.question, JSON.stringify(lesson.task.options), lesson.task.correctAnswer, lesson.task.explanation, lesson.task.challenge]
    );
  }
}

async function getCourses(courseId) {
  const courseResult = courseId ? await pool.query("SELECT * FROM courses WHERE id = $1 ORDER BY id", [courseId]) : await pool.query("SELECT * FROM courses ORDER BY id");
  if (courseResult.rows.length === 0) return [];
  const ids = courseResult.rows.map((row) => row.id);
  const lessonResult = await pool.query("SELECT * FROM lessons WHERE course_id = ANY($1::int[]) ORDER BY course_id, lesson_order, id", [ids]);
  return courseResult.rows.map((row) => mapCourseRow(row, lessonResult.rows));
}

function mapCourseRow(row, lessons) {
  return {
    id: String(row.id),
    title: row.title,
    instructor: row.instructor,
    thumbnail: row.thumbnail,
    image: row.image,
    videoUrl: row.video_url,
    description: row.description,
    category: row.category,
    level: row.level,
    price: Number(row.price ?? 0),
    accentColor: row.accent_color ?? "blue",
    lessons: lessons.filter((lesson) => lesson.course_id === row.id).sort((a, b) => a.lesson_order - b.lesson_order).map((lesson) => ({
      id: String(lesson.id),
      title: lesson.title,
      duration: lesson.duration,
      videoUrl: lesson.video_url,
      summary: lesson.summary,
      task: { type: "quiz", question: lesson.task_question, options: Array.isArray(lesson.task_options) ? lesson.task_options : JSON.parse(lesson.task_options), correctAnswer: lesson.task_correct_answer, explanation: lesson.task_explanation, challenge: lesson.task_challenge }
    }))
  };
}

// --- Request Handler ---
async function handleRequest(req, res) {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
  if (req.method === "OPTIONS") { sendJson(res, 200, { ok: true }); return; }
  
  try {
    // ... (Бұл жерге өзіңнің бұрынғы handleRequest логикаңды толық қой, 
    // өйткені ол өте ұзын, мен тек осы жерге қоюға кеңес беремін) ...
    // Бәрі сол күйі қалады.
  } catch (error) {
    const message = error instanceof Error ? error.message : "Сервер қатесі";
    sendJson(res, 500, { message });
  }
}

// --- Жаңа: Серверді қауіпсіз іске қосу ---
async function startServer() {
  try {
    console.log("Дерекқор схемасын тексеруде...");
    await ensureSchema();
    console.log("Схема дайын.");

    console.log("Дерекқорды толтыру (seed)...");
    await seedDatabase();
    console.log("Толтыру аяқталды.");

    http.createServer(handleRequest).listen(PORT, '0.0.0.0', () => {
      console.log(`Сервер сәтті іске қосылды: http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error("!!! СЕРВЕР ІСКЕ ҚОСЫЛҒАНДА ҚАТЕ КЕТТІ !!!");
    console.error(error);
    process.exit(1); 
  }
}

startServer();