pub mod models;
pub mod schema;

use diesel::pg::PgConnection;
use diesel::prelude::*;
use dotenvy::dotenv;
use std::env;
use self::models::{ShortUrlMap, NewMap};


pub fn establish_connection() -> PgConnection {
    dotenv().ok();

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    PgConnection::establish(&database_url)
        .unwrap_or_else(|_| panic!("Error connecting to {}", database_url))
}

pub fn create_map(conn: &mut PgConnection, lurl: &str, surl: &str) -> ShortUrlMap {
    use crate::schema::short_url_map;

    let new_map = NewMap { lurl, surl };

    diesel::insert_into(short_url_map::table)
        .values(&new_map)
        .get_result(conn)
        .expect("Error saving new map")
}