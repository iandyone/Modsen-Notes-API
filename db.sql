CREATE TABLE
  users (
    id SERIAL PRIMARY KEY NOT NULL,
    username varchar(60) NOT NULL,
    email varchar(60) NOT NULL UNIQUE,
    password varchar(255) NOT NULL
  );

CREATE TABLE
  tokens (
    id SERIAL PRIMARY KEY UNIQUE NOT NULL,
    token text NOT NULL UNIQUE,
    user_id INT REFERENCES users (id) NOT NULL
  );

  UPDATE notes
SET user_id = (SELECT id FROM users WHERE username = 'root')
WHERE user_id IS NULL;  

  UPDATE tags
SET user_id = (SELECT id FROM users WHERE username = 'root')
WHERE user_id IS NULL;  
