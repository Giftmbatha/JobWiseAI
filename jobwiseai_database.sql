
CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  employer_id INT REFERENCES users(id),
  title VARCHAR(100),
  description TEXT,
  location VARCHAR(100),
  salary_range VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
