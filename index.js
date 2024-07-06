import express, { json, response } from "express";
import bodyParser from "body-parser";
import pkg from "pg";
import axios from "axios";
import env from "dotenv";

env.config();

const app = express();
const port = 3000;
const { Pool } = pkg;
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
    return;
  }
  console.log('Database connection successful');
  release();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM books");
    const books = result.rows;
    console.log(books);
    res.render("index.ejs", { bookitems: books });
  } catch (err) {
    console.error("Could not get initial DB Entry:", err);
    res.status(500).send("Error fetching data from the database");
  }
});

app.post("/add", async (req, res) => {
  const { title, author, rating, isbn, comments } = req.body;
  const img = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;

  try {
    await pool.query(
      "INSERT INTO books (book_title, author, isbn, rating, comments) VALUES ($1, $2, $3, $4, $5)",
      [title, author, isbn, rating, comments]
    );
    res.redirect("/");
  } catch (err) {
    console.error("Cannot ADD to DB ERROR:", err);
    res.status(500).send("Error adding data to the database");
  }
});

app.post("/hidden", (req, res) => {
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  const buttonid = req.body.button;
  const button = Number(buttonid);
  try {
    const result = await pool.query(
      "SELECT id, book_title, author, isbn, rating, comments FROM books WHERE id = $1",
      [button]
    );
    const mypage = result.rows;
    res.render("modify.ejs", { book: mypage });
  } catch (err) {
    console.error("Error Displaying books with ID", err);
    res.status(500).send("Error fetching data for editing");
  }
});

app.post("/update", async (req, res) => {
  const { updateId, title, author, rating, comments } = req.body;

  try {
    await pool.query(
      "UPDATE books SET book_title = $2, author = $3, rating = $4, comments = $5 WHERE id = $1",
      [updateId, title, author, rating, comments]
    );
    res.redirect("/");
  } catch (err) {
    console.error("Error Updating Book Posts:", err);
    res.status(500).send("Error updating data");
  }
});

app.post("/delete", async (req, res) => {
  const id = req.body.delete;

  try {
    await pool.query("DELETE FROM books WHERE id = $1", [id]);
    res.redirect("/");
  } catch (err) {
    console.error("Error deleting record:", err);
    res.status(500).send("Error deleting data");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
