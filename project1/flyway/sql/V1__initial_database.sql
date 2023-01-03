CREATE TABLE short_url_map (
  id SERIAL PRIMARY KEY,
  lurl varchar(200) DEFAULT NULL,
  surl varchar(30) DEFAULT NULL
);