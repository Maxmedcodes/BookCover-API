import express, { json, response } from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";

const app = express();
const port = 3000;
const db = new pg.Client({
  user:"postgres",
  host:"localhost",
  database:"books",
  password:"***",
  port:5432,
});
db.connect();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// // Code for getting Data from book Covers API
// function getbooks(){
//   document.getElementById("books").innerHTML="";
//   fetch("http://openlibrary.org/search.json?q="+document.getElementById("mybook").value).then(a=> a.json()).then(response =>{
//       for (var i= 0; i<5; i++){
//           document.getElementById("books").innerHTML+="<h2>"+response.docs[i].title+"</h2"+response.docs[i].author_name[0]+"<br><img src='http://covers.openlibrary.org/b/isbn/"+response.docs[i].isbn[0]+"-M.jpg'><br>";
//       }
//   });
// };
var books = [];
app.get("/", async (req, res) => {

  try{
    const result = await db.query(
      "select * from books"
    )
    books = result.rows;
    console.log(books)
    res.render("index.ejs",{bookitems:books})
  } catch(err){
    console.log("Could not get initial DB Entry")
  }  
});

app.post("/add", async (req, res) => {
  const title = req.body.title
  const author = req.body.author
  const rating = req.body.rating
  const isbn = req.body.isbn
  const comments = req.body.comments
  const img = "https://covers.openlibrary.org/b/isbn/"+isbn+"-M.jpg"

  try{
    const result = await db.query(
      `insert into books (book_title,author,isbn,rating,comments) values ($1,$2,$3,$4,$5)`,[title,author,isbn,rating,comments]
    )
    res.render("index.ejs")
  }catch(err){
    console.log("Cannot ADD to DB ERROR:",err)
  }
  
    
  })
app.post("/hidden", (req,res)=>{
res.redirect("/")
})

app.post("/edit", async (req, res) => {
  const buttonid = req.body.button
  const button = Number(buttonid)
  var mypage = [];
  console.log("This is the webpage Data: " + buttonid)
  try{
    const result = await db.query(
      "select id, book_title, author, isbn ,rating, comments FROM books WHERE id = ($1)",[button]
    )
    mypage = result.rows
    res.render("modify.ejs",{book:mypage})
  }catch(err){
    console.log("Error Displaying books with ID",err)
  }
  
});

app.post("/update", async (req,res) =>{
  const id = req.body.updateId ;
  const title = req.body.title ;
  const author = req.body.author ;
  const rating = req.body.rating ;
  const comments = req.body.comments ; 
  
  try{
    const result = await db.query(
      "UPDATE books SET book_title = $2, author = $3, rating = $4, comments = $5 WHERE id = $1",
      [id, title, author, rating, comments]
  );
    res.redirect("/")
  } catch(err){
    console.log("Error Updating Book Posts: ",err)
  }
  
})
app.post("/delete",async (req,res)=>{
  const id = req.body.delete ;

  console.log("Delete page working")
  try{
    const result = await db.query(
      "delete from books where id = ($1)",[id]
    )
    res.redirect("/")
  }catch(err){
    console.log("Error deleting record: ", err)
  }
})


// app.get("/:id", async (req,res)=>{
//   const book_id = req.body.button
//   const editbooks =[]
//   console.log(book_id)
//   try{
//     const result = await db.query(
//       "select book_title, author, isbn ,rating, comments from books where id =($1)",[book_id]
//     )
//     editbooks = result.rows
//     res.render("modify.ejs",{books:books})

//   } catch(err){
//     console.log("ERROR Updating DB: ",err)
//   }
// })

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
