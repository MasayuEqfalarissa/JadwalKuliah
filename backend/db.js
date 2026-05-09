const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('Error acquiring client', err.stack);
    } else {
        console.log('Connected to PostgreSQL database.');
        
        // Create tables using PostgreSQL syntax
        const createTables = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                profile_picture TEXT
            );

            CREATE TABLE IF NOT EXISTS schedules (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
                course_name VARCHAR(255) NOT NULL,
                lecturer VARCHAR(255),
                room VARCHAR(255),
                day VARCHAR(50) NOT NULL,
                start_time VARCHAR(50) NOT NULL,
                end_time VARCHAR(50) NOT NULL,
                color VARCHAR(50) DEFAULT '#3B82F6'
            );

            CREATE TABLE IF NOT EXISTS assignments (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                subject VARCHAR(255) NOT NULL,
                deadline TIMESTAMP NOT NULL,
                status VARCHAR(50) DEFAULT 'pending'
            );

            CREATE TABLE IF NOT EXISTS exams (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
                subject VARCHAR(255) NOT NULL,
                exam_date TIMESTAMP NOT NULL,
                room VARCHAR(255)
            );
        `;

        client.query(createTables, (err, result) => {
            release();
            if (err) {
                console.error('Error creating tables', err.stack);
            }
        });
    }
});

module.exports = pool;
