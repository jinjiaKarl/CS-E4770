#[macro_use] extern crate rocket;
use uuid::Uuid;
use rocket::form::Form;
use rocket::serde::{Serialize, Deserialize};
use rocket::serde::json::{Json, Value, json};
use rocket::http::Status;

// refer to https://github.com/SergioBenitez/Rocket/blob/v0.5-rc/examples/hello/src/main.rs
// https://zhuanlan.zhihu.com/p/369417170

#[get("/")]
fn index() -> &'static str {
    "Hello, world!"
}

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
 

// curl -X POST "http://localhost:8000/user" -H "Content-Type: application/x-www-form-urlencoded" -d 'name=tom&age=15'
// curl -X POST "http://localhost:8000/json/user" -H "Content-Type: application/json" -d '{"name":"tom","age":21}'
#[launch]
fn rocket() -> _ {
    rocket::build()
        .mount("/", routes![index,random,user,get_user])
        .mount("/json", routes![create])
}