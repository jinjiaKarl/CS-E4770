use diesel::prelude::*;
use crate::schema::short_url_map;


#[derive(Queryable)]
pub struct ShortUrlMap {
    pub id: i32,
    pub lurl: Option<String>,
    pub surl: Option<String>,
}

#[derive(Insertable)]
#[diesel(table_name = short_url_map)]
pub struct NewMap<'a> {
    pub lurl: &'a str,
    pub surl: &'a str,
}