import http from "node:http";
import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import { Pool } from "pg";

import { loadEnv } from "./env.js";
import { normalizeCoursePayload, seedCourses } from "./seed.js";

loadEnv();

const PORT = Number(process.env.PORT ?? 4000);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Admin12345!";


const pool = new Pool({
  host: process.env.PGHOST ?? "localhost",
  port: Number(process.env.PGPORT ?? 5432),
  user: process.env.PGUSER ?? "postgres",
  password: process.env.PGPASSWORD ?? "postgres",
  // Төмендегі жолды мынаған өзгертіңіз:
  database: (process.env.PGDATABASE ?? "france_db").trim(),
});

async function checkDatabase() {
  const checkPool = new Pool({
    host: process.env.PGHOST ?? "localhost",
    port: Number(process.env.PGPORT ?? 5432),
    user: process.env.PGUSER ?? "postgres",
    password: process.env.PGPASSWORD ?? "postgres",
    database: "postgres", // Арнайы стандартты базаға қосыламыз
  });

  try {
    const res = await checkPool.query("SELECT datname FROM pg_database");
    console.log("--- СЕРВЕРДЕГІ БАЗАЛАР ТІЗІМІ ---");
    console.log(res.rows.map(r => r.datname));
    console.log("--------------------------------");
  } catch (err) {
    console.error("БАЗАЛАРДЫ ТЕКСЕРУ ҚАТЕСІ:", err.message);
  } finally {
    checkPool.end();
  }
}

checkDatabase();




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

function toSession(row) {
  return {
    id: String(row.id),
    username: row.username,
    email: row.email ?? "",
    phone: row.phone ?? "",
    createdAt: row.created_at?.toISOString?.().slice(0, 10) ?? "",
    role: "user",
  };
}

function toUser(row) {
  return {
    id: String(row.id),
    username: row.username,
    name: row.username,
    email: row.email ?? "",
    phone: row.phone ?? "",
    createdAt: row.created_at?.toISOString?.().slice(0, 10) ?? "",
  };
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
    lessons: lessons
      .filter((lesson) => lesson.course_id === row.id)
      .sort((a, b) => a.lesson_order - b.lesson_order)
      .map((lesson) => ({
        id: String(lesson.id),
        title: lesson.title,
        duration: lesson.duration,
        videoUrl: lesson.video_url,
        summary: lesson.summary,
        task: {
          type: "quiz",
          question: lesson.task_question,
          options: Array.isArray(lesson.task_options) ? lesson.task_options : JSON.parse(lesson.task_options),
          correctAnswer: lesson.task_correct_answer,
          explanation: lesson.task_explanation,
          challenge: lesson.task_challenge,
        },
      })),
  };
}

async function getCourses(courseId) {
  const courseResult = courseId
    ? await pool.query("SELECT * FROM courses WHERE id = $1 ORDER BY id", [courseId])
    : await pool.query("SELECT * FROM courses ORDER BY id");
  if (courseResult.rows.length === 0) return [];

  const ids = courseResult.rows.map((row) => row.id);
  const lessonResult = await pool.query(
    "SELECT * FROM lessons WHERE course_id = ANY($1::int[]) ORDER BY course_id, lesson_order, id",
    [ids],
  );

  return courseResult.rows.map((row) => mapCourseRow(row, lessonResult.rows));
}

async function insertLessons(client, courseId, lessons) {
  for (let index = 0; index < lessons.length; index += 1) {
    const lesson = lessons[index];
    await client.query(
      `INSERT INTO lessons (
        course_id, lesson_order, title, duration, video_url, summary,
        task_question, task_options, task_correct_answer, task_explanation, task_challenge
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10,$11)`,
      [
        courseId,
        index + 1,
        lesson.title,
        lesson.duration,
        lesson.videoUrl,
        lesson.summary,
        lesson.task.question,
        JSON.stringify(lesson.task.options),
        lesson.task.correctAnswer,
        lesson.task.explanation,
        lesson.task.challenge,
      ],
    );
  }
}

function validateCoursePayload(payload) {
  if (!payload.title || !payload.instructor || !payload.description || !payload.videoUrl) {
    throw new Error("Курс үшін атау, оқытушы, сипаттама және видео URL міндетті");
  }

  if (!Array.isArray(payload.lessons) || payload.lessons.length === 0) {
    throw new Error("Курс ішінде кемінде 1 сабақ болуы керек");
  }
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
        `INSERT INTO courses (
          title, instructor, category, level, price, description, video_url, thumbnail, image, accent_color
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
        [
          course.title,
          course.instructor,
          course.category,
          course.level,
          course.price,
          course.description,
          course.videoUrl,
          course.thumbnail,
          course.image,
          course.accentColor,
        ],
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

async function handleRequest(req, res) {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

  if (req.method === "OPTIONS") {
    sendJson(res, 200, { ok: true });
    return;
  }

  try {
    if (req.method === "GET" && url.pathname === "/api/health") {
      const db = await pool.query("SELECT NOW()");
      sendJson(res, 200, { ok: true, databaseTime: db.rows[0].now });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/auth/register") {
      const body = await parseBody(req);
      const username = String(body.username ?? "").trim();
      const email = String(body.email ?? "").trim().toLowerCase();
      const phone = normalizePhone(body.phone);
      const password = String(body.password ?? "");

      if (!username || !email || !phone || !password) {
        sendJson(res, 400, { message: "Барлық міндетті өрістерді толтырыңыз" });
        return;
      }

      const duplicate = await pool.query(
        "SELECT id FROM users WHERE LOWER(email) = LOWER($1) OR phone = $2 LIMIT 1",
        [email, phone],
      );
      if (duplicate.rows.length > 0) {
        sendJson(res, 409, { message: "Бұл email немесе телефон бойынша аккаунт бар" });
        return;
      }

      const created = await pool.query(
        `INSERT INTO users (username, phone, email, password_hash)
         VALUES ($1,$2,$3,$4)
         RETURNING id, username, email, phone, created_at`,
        [username, phone, email, hashPassword(password)],
      );
      sendJson(res, 201, { user: toSession(created.rows[0]) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/auth/login") {
      const body = await parseBody(req);
      const identifier = String(body.identifier ?? "").trim().toLowerCase();
      const digits = normalizePhone(body.identifier);
      const password = String(body.password ?? "");

      const result = await pool.query(
        `SELECT id, username, email, phone, created_at, password_hash
         FROM users
         WHERE LOWER(email) = $1 OR phone = $2
         LIMIT 1`,
        [identifier, digits],
      );

      const user = result.rows[0];
      if (!user || !verifyPassword(password, user.password_hash)) {
        sendJson(res, 401, { message: "Телефон нөмірі, email немесе құпия сөз қате" });
        return;
      }

      sendJson(res, 200, { user: toSession(user) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/admin/login") {
      const body = await parseBody(req);
      const password = String(body.password ?? "");
      if (password !== ADMIN_PASSWORD) {
        sendJson(res, 401, { message: "Әкімші құпиясөзі қате" });
        return;
      }

      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/users") {
      const result = await pool.query(
        "SELECT id, username, email, phone, created_at FROM users WHERE role = 'user' ORDER BY id DESC",
      );
      sendJson(res, 200, { users: result.rows.map(toUser) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/users") {
      const body = await parseBody(req);
      const username = String(body.name ?? body.username ?? "").trim();
      const email = String(body.email ?? "").trim().toLowerCase();
      const phone = normalizePhone(body.phone);
      const password = String(body.password ?? "");

      if (!username || !phone || !password) {
        sendJson(res, 400, { message: "Аты, телефон және пароль міндетті" });
        return;
      }

      const duplicate = await pool.query(
        "SELECT id FROM users WHERE (LOWER(email) = LOWER($1) AND $1 <> '') OR phone = $2 LIMIT 1",
        [email, phone],
      );
      if (duplicate.rows.length > 0) {
        sendJson(res, 409, { message: "Бұл email немесе телефон бос емес" });
        return;
      }

      const created = await pool.query(
        `INSERT INTO users (username, phone, email, password_hash)
         VALUES ($1,$2,$3,$4)
         RETURNING id, username, email, phone, created_at`,
        [username, phone, email || null, hashPassword(password)],
      );
      sendJson(res, 201, { user: toUser(created.rows[0]) });
      return;
    }

    if (req.method === "PUT" && /^\/api\/users\/\d+$/.test(url.pathname)) {
      const userId = Number(url.pathname.split("/").pop());
      const body = await parseBody(req);
      const existing = await pool.query("SELECT * FROM users WHERE id = $1 LIMIT 1", [userId]);
      if (existing.rows.length === 0) {
        sendJson(res, 404, { message: "Пайдаланушы табылмады" });
        return;
      }

      const username = String(body.name ?? body.username ?? existing.rows[0].username).trim();
      const email = String(body.email ?? existing.rows[0].email ?? "").trim().toLowerCase();
      const phone = normalizePhone(body.phone ?? existing.rows[0].phone);
      const password = String(body.password ?? "");

      const duplicate = await pool.query(
        `SELECT id FROM users
         WHERE id <> $1 AND (((LOWER(email) = LOWER($2)) AND $2 <> '') OR phone = $3)
         LIMIT 1`,
        [userId, email, phone],
      );
      if (duplicate.rows.length > 0) {
        sendJson(res, 409, { message: "Бұл email немесе телефон бос емес" });
        return;
      }

      const nextPasswordHash = password ? hashPassword(password) : existing.rows[0].password_hash;
      const updated = await pool.query(
        `UPDATE users
         SET username = $1, email = $2, phone = $3, password_hash = $4
         WHERE id = $5
         RETURNING id, username, email, phone, created_at`,
        [username, email || null, phone, nextPasswordHash, userId],
      );
      sendJson(res, 200, { user: toUser(updated.rows[0]) });
      return;
    }

    if (req.method === "DELETE" && /^\/api\/users\/\d+$/.test(url.pathname)) {
      const userId = Number(url.pathname.split("/").pop());
      await pool.query("DELETE FROM users WHERE id = $1", [userId]);
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/courses") {
      sendJson(res, 200, { courses: await getCourses() });
      return;
    }

    if (req.method === "GET" && /^\/api\/courses\/\d+$/.test(url.pathname)) {
      const courseId = Number(url.pathname.split("/").pop());
      const course = (await getCourses(courseId))[0];
      if (!course) {
        sendJson(res, 404, { message: "Курс табылмады" });
        return;
      }
      sendJson(res, 200, { course });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/courses") {
      const rawBody = await parseBody(req);
      const course = normalizeCoursePayload(rawBody);
      validateCoursePayload(course);

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const inserted = await client.query(
          `INSERT INTO courses (
            title, instructor, category, level, price, description, video_url, thumbnail, image, accent_color
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
          RETURNING id`,
          [
            course.title,
            course.instructor,
            course.category,
            course.level,
            course.price,
            course.description,
            course.videoUrl,
            course.thumbnail,
            course.image,
            course.accentColor,
          ],
        );
        await insertLessons(client, inserted.rows[0].id, course.lessons);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }

      const createdCourse = (await getCourses()).at(-1);
      sendJson(res, 201, { course: createdCourse });
      return;
    }

    if (req.method === "PUT" && /^\/api\/courses\/\d+$/.test(url.pathname)) {
      const courseId = Number(url.pathname.split("/").pop());
      const rawBody = await parseBody(req);
      const course = normalizeCoursePayload(rawBody);
      validateCoursePayload(course);

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(
          `UPDATE courses
           SET title = $1, instructor = $2, category = $3, level = $4, price = $5,
               description = $6, video_url = $7, thumbnail = $8, image = $9, accent_color = $10
           WHERE id = $11`,
          [
            course.title,
            course.instructor,
            course.category,
            course.level,
            course.price,
            course.description,
            course.videoUrl,
            course.thumbnail,
            course.image,
            course.accentColor,
            courseId,
          ],
        );
        await client.query("DELETE FROM lessons WHERE course_id = $1", [courseId]);
        await insertLessons(client, courseId, course.lessons);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }

      const updatedCourse = (await getCourses(courseId))[0];
      sendJson(res, 200, { course: updatedCourse });
      return;
    }

    if (req.method === "DELETE" && /^\/api\/courses\/\d+$/.test(url.pathname)) {
      const courseId = Number(url.pathname.split("/").pop());
      await pool.query("DELETE FROM courses WHERE id = $1", [courseId]);
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/enrollments") {
      const userId = Number(url.searchParams.get("userId"));
      const rows = await pool.query(
        `SELECT e.course_id
         FROM enrollments e
         WHERE e.user_id = $1
         ORDER BY e.created_at DESC`,
        [userId],
      );
      const courseIds = rows.rows.map((row) => String(row.course_id));
      const courses = (await getCourses()).filter((course) => courseIds.includes(course.id));
      sendJson(res, 200, { courseIds, courses });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/enrollments") {
      const body = await parseBody(req);
      const userId = Number(body.userId);
      const courseId = Number(body.courseId);

      const inserted = await pool.query(
        `INSERT INTO enrollments (user_id, course_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, course_id) DO NOTHING
         RETURNING user_id`,
        [userId, courseId],
      );

      const course = (await getCourses(courseId))[0] ?? null;
      sendJson(res, 200, { added: inserted.rows.length > 0, course });
      return;
    }

    if (req.method === "DELETE" && url.pathname === "/api/enrollments") {
      const userId = Number(url.searchParams.get("userId"));
      const courseId = Number(url.searchParams.get("courseId"));
      await pool.query("DELETE FROM enrollments WHERE user_id = $1 AND course_id = $2", [userId, courseId]);
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/progress") {
      const userId = Number(url.searchParams.get("userId"));
      const courseId = Number(url.searchParams.get("courseId"));
      const rows = await pool.query(
        `SELECT lesson_id, watched, completed
         FROM lesson_progress
         WHERE user_id = $1 AND course_id = $2`,
        [userId, courseId],
      );

      sendJson(res, 200, {
        progress: {
          watchedLessonIds: rows.rows.filter((row) => row.watched).map((row) => String(row.lesson_id)),
          completedLessonIds: rows.rows.filter((row) => row.completed).map((row) => String(row.lesson_id)),
        },
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/progress/watched") {
      const body = await parseBody(req);
      await pool.query(
        `INSERT INTO lesson_progress (user_id, course_id, lesson_id, watched, completed)
         VALUES ($1,$2,$3,TRUE,FALSE)
         ON CONFLICT (user_id, lesson_id)
         DO UPDATE SET watched = TRUE, updated_at = NOW()`,
        [Number(body.userId), Number(body.courseId), Number(body.lessonId)],
      );
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/progress/completed") {
      const body = await parseBody(req);
      await pool.query(
        `INSERT INTO lesson_progress (user_id, course_id, lesson_id, watched, completed)
         VALUES ($1,$2,$3,TRUE,TRUE)
         ON CONFLICT (user_id, lesson_id)
         DO UPDATE SET watched = TRUE, completed = TRUE, updated_at = NOW()`,
        [Number(body.userId), Number(body.courseId), Number(body.lessonId)],
      );
      sendJson(res, 200, { ok: true });
      return;
    }

    sendJson(res, 404, { message: "Маршрут табылмады" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Сервер қатесі";
    sendJson(res, 500, { message });
  }
}

await ensureSchema();
await seedDatabase();

http
  .createServer(handleRequest)
  .listen(PORT, () => {
    console.log(`PostgreSQL API started on http://localhost:${PORT}`);
  });
