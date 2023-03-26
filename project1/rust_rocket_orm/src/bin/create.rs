use rust_rocket_orm::*;
use std::io::{stdin, Read};

fn main() {
    let connection = &mut establish_connection();

    let mut lurl = String::new();
    let mut surl   = String::new();

    println!("What would you like your lurl to be?");
    stdin().read_line(&mut lurl).unwrap();
    let lurl = lurl.trim_end(); // Remove the trailing newline

    println!(
        "\nOk! Let's write {} (Press {} when finished)\n",
        surl, EOF
    );
    stdin().read_to_string(&mut surl).unwrap();

    let map = create_map(connection, lurl, &surl);
    println!("\nSaved draft {} with id {}", lurl, map.id);
}

#[cfg(not(windows))]
const EOF: &str = "CTRL+D";

#[cfg(windows)]
const EOF: &str = "CTRL+Z";