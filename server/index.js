import http from "node:http";
import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import { Pool } from "pg";

import { loadEnv } from "./env.js";
import { normalizeCoursePayload, seedCourses } from "./seed.js";

loadEnv();

const PORT = Number(process.env.PORT ?? 4000);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Admin12345!";

// Негізгі пул осылай тұра берсін, ол дұрыс
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// checkDatabase() функциясын және оның шақырылуын толығымен өшіріп таста!