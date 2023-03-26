
mongo: https://dev.to/hackmamba/build-a-rest-api-with-rust-and-mongodb-rocket-version-ah5

postgres: https://github.com/TmLev/crud-rest-api-rust-rocket-diesel-postgres


postgres: https://github.com/lankydan/rust-web-with-rocket


## Creating a table
First set the DATABASE_URL to connect to Postgres with the below command or by adding it to the .env file manually:

```
ROCKET_DATABASES='{db={url="postgres://username:password@localhost:5432/database"}}' > .env
```

Then run `diesel setup` to create a database for the project and an empty migrations folder for later use.

Let's create our first migration `diesel migration generate short_url_map`. To apply this migration we need to run `diesel migration run` and if we want to revert it we can run `diesel migration redo`.


Let's create and Show a record
```
cargo run --bin create
cargo run --bin show
```
