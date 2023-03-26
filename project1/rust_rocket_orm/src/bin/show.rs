use self::models::*;
use diesel::prelude::*;
use rust_rocket_orm::*;

fn main() {
    use self::schema::short_url_map::dsl::*;

    let connection = &mut establish_connection();
    let results = short_url_map
        .load::<ShortUrlMap>(connection)
        .expect("Error loading posts");

    println!("Displaying {} posts", results.len());
    for post in results {
        if let Some(k) = post.lurl {
            println!("lurl: {}", k);
        } 
        if let Some(k) = post.surl {
            println!("surl: {}", k);  
        }
    }
}