#[macro_use] extern crate rocket;
use uuid::Uuid;
use rocket::form::Form;
use rocket::serde::{Serialize, Deserialize};
use rocket::serde::json::{Json, Value, json};
use rocket::http::Status;
use rocket::config::{Config};
use tokio_postgres::{Client, NoTls, Error};
use tokio;
use rocket::fairing::AdHoc;
use rocket::State;
use std::env;



// refer to https://github.com/SergioBenitez/Rocket/blob/v0.5-rc/examples/hello/src/main.rs
// https://zhuanlan.zhihu.com/p/369417170
#[get("/")]
fn index() -> &'static str {
    "Hello, world!"
}

#[allow(dead_code)]
#[derive(Debug)]
#[derive(FromForm)]
struct User {
    age: u8,
    name: String,
}

#[post["/user", data = "<user>"]]
fn user(user: Form<User>) -> String {
    format!("{:?}", user)
}

#[get["/user/<id>"]]
fn get_user(id: String) -> (Status, Value) {
    (Status::NotFound, json!({
        "id": id,
    }))
}



#[get("/random")]
fn random() -> String {
    let id = Uuid::new_v4();
    id.to_string()
}

#[derive(Debug)]
#[derive(Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
struct UserJson {
    age: i32,
    name: String,
}
#[post("/user", data = "<user>", format = "json")]
 fn create(user: Json<UserJson>) -> Option<Value> {
    match user.age {
        0..=18 => Some(json!({
            "status": "error",
            "reason": "too young",
            "name": user.name,
        })),
        ..=-1 => None,
        _ => Some(json!({
            "status": "ok",
            "reason": "too old",
            "name": user.name,
        })),
    }
}


#[get["/database"]]
async fn get_database(conn: &State<Client>) -> Result<Json<String>, Status>{
    let rows = conn.query("SELECT * FROM short_url_map", &[]).await.unwrap();
    for row in rows {
        let id: i32 = row.get(0);
        let lurl: String = row.get(1);
        println!("id: {}, name: {}", id, lurl);
    }
    Ok(Json(String::from("Hello from rust and postgres!")))
}
 

// curl -X POST "http://localhost:8000/user" -H "Content-Type: application/x-www-form-urlencoded" -d 'name=tom&age=15'
// curl -X POST "http://localhost:8000/json/user" -H "Content-Type: application/json" -d '{"name":"tom","age":21}'
#[rocket::main]
async fn main() -> Result<(), Error> {
    let database_uri = env::var("DATABASE_URL").unwrap_or_else(|_| "host=localhost user=username password=password dbname=database".to_string());
    let config = Config {
        // the default port is 8000
        port: 7777,
        ..Config::debug_default()
    };
    let (client, conn) = tokio_postgres::connect(database_uri.as_str(), NoTls)
    .await?;

    tokio::spawn(async move {
        if let Err(e) = conn.await {
            eprintln!("database connection error: {}", e);
        }
    });
     // add database to rocket
    if let Err(e) = rocket::custom(&config)
        .manage(client)
        .attach(AdHoc::on_request("Put Rewriter", |req, _| Box::pin(async move {
            print!("{} {} ", req.method(), req.uri());
        })))
        .mount("/", routes![index,random,user,get_user, get_database])
        .mount("/json", routes![create])
        .launch()
        .await {
            eprintln!("rocket launch error: {}", e);
        }
        
    Ok(())
}
