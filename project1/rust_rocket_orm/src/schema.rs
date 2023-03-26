// @generated automatically by Diesel CLI.

diesel::table! {
    short_url_map (id) {
        id -> Int4,
        lurl -> Nullable<Varchar>,
        surl -> Nullable<Varchar>,
    }
}
