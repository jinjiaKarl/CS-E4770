/* Create your schema here */
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) DEFAULT NULL,
    email VARCHAR(255) DEFAULT NULL,
    password VARCHAR(255) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS exercises (
	id SERIAL PRIMARY KEY,
	name varchar(30) DEFAULT NULL,
	content text DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS results (
    id SERIAL PRIMARY KEY,
    e_id int DEFAULT NULL,
    u_id int DEFAULT NULL,
    grade varchar(10) DEFAULT NULL,
    code_hash text DEFAULT NULL,
    created_at timestamp DEFAULT NULL,
    CONSTRAINT fk_users FOREIGN KEY (u_id) REFERENCES users(id),
    CONSTRAINT fk_exercises FOREIGN KEY (e_id) REFERENCES exercises(id)
);

CREATE INDEX results_e_id_u_id_idx ON results (e_id, u_id);

