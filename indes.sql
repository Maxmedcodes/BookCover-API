-- create a book table that user can enter books they have read
-- it will be populated with Known books
create table books(
    id serial primary key,
    book_title varchar(100) unique,
    author varchar(100),
    isbn varchar(50) unique,
    rating varchar(10),
    cover_isbn varchar(50) unique,
    comments varchar(250)
)