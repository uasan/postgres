import { Pool } from '../pool.js';

const db = new Pool({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'smartapps',
});

async function test() {
  try {
    console.time('trainings');
    await db.query(`
      SELECT *
      FROM smartlibrary.trainings
      JOIN smartlibrary.training_skills USING(course_id)
      LIMIT 1
    `);
    console.timeEnd('trainings');
  } catch (error) {
    console.error(error);
  }
}

test();
