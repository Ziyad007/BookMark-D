import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from 'axios';
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = process.env.PORT;

// DB Connection
const db = new pg.Client({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.DBPORT,
});   

db.connect()
  .then(() => console.log("Connected to the database successfully"))
  .catch(err => {
    console.error("Failed to connect to the database:", err.message);
    process.exit(1); // Exit the app if DB connection fails
  });


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

 
//Get Data from the Database
async function getData(){
  const result=await db.query("SELECT * FROM books");
  const books=[];
  result.rows.forEach((book)=>{
    books.push(book);
  });
  return books;
}

//Get Book cover using API
async function fetchBookCover(isbn) {
  try {
    const response=await axios.get(`https://bookcover.longitood.com/bookcover/${isbn}`);
    if(response.data.url){
      const bookCover=response.data.url;

      return bookCover;
    }
    else{
      console.log("Book Not Found");
    }
  } catch (error) {
    
  }
}

// Store Book covers
async function getBookCovers(results) {
  const isbn = [];
  const bookCovers = [];

  results.forEach(result => {
    isbn.push(result.isbn);
  });

  for (const isb of isbn) {
    const cover = await fetchBookCover(isb);
    bookCovers.push(cover);
  }

  return bookCovers;
}


//GET main page
app.get("/",async(req,res)=>{
  try {
    const results=await getData();
    const bookCovers = await getBookCovers(results);
    res.render("index.ejs",{books:results,bookCovers});
  } catch (error) {
    console.log("Error loading the main page");
  }
}); 

//Get sorted books
app.get("/sort",async(req,res)=>{
  try {
    const type=req.query.type;
    const category=req.query.category;
    console.log(type,category);
    let result;
    if(type=="rating"){
      result=await db.query("SELECT * FROM books ORDER BY rating DESC");
    }
    else if(type=="alphabetical"){
      result=await db.query("SELECT * FROM books ORDER BY title ASC");
    }
    else if(type=="categories" && category){
      result=await db.query("SELECT * FROM books WHERE category=$1",[category]);
    } 
    else{
      result=await db.query("SELECT * FROM books");
    }
    console.log(result.rows);
    const bookCovers = await getBookCovers(result.rows); // Use the utility function
    res.render("index.ejs", { books: result.rows, bookCovers });
  } catch (error) {
    console.log("Error 404");
  }
});

//Get searched book
app.get("/search",async(req,res)=>{
  try {
    const search=req.query.query;
    const result=await db.query("SELECT * FROM books WHERE title LIKE '%'|| $1 || '%' ",[search]);
    console.log(result.rows);
    const bookCovers = await getBookCovers(result.rows); // Use the utility function
    res.render("index.ejs", { books: result.rows, bookCovers });
  } catch (error) {
    console.log("Error 404");
  }
});

//Add a new book POST request
app.post("/add",async(req,res)=>{
  try {
    const result=req.body;
    if (!result.newIsbn || !result.newTitle || !result.newAuthor || !result.newReview || !result.newCategory || !result.dateRead || !result.newRating) {
      return res.status(400).send("All fields are required.");
    }
    await db.query("INSERT INTO books(isbn,title,author,review,category,date_read,rating) VALUES ($1,$2,$3,$4,$5,$6,$7)",
      [result.newIsbn,result.newTitle,result.newAuthor,result.newReview,result.newCategory,result.dateRead,result.newRating]);
    res.redirect("/");
  } catch (error) {
    console.log("Error 404");
  }
});
 
//GET edit page 
app.get("/edit/:id",async(req,res)=>{
  try {
    const bookId=req.params.id;
    const result=await db.query("SELECT * FROM books WHERE id=$1",[bookId]);
    if (result.rows.length === 0) {
      return res.status(404).send("Book not found");
    }
    res.render("edit.ejs",{book:result.rows[0]});
  } catch (error) {
    console.log("Error 404");
  } 
});
 
//POST updated changes
app.post("/update/:id",async(req,res)=>{
  try {
    console.log(req.params.id);
    const bookId=req.params.id;
    const result=req.body;
    await db.query("UPDATE books SET isbn=$1,title=$2,author=$3,review=$4,category=$5,date_read=$6,rating=$7 WHERE id=($8)",[
      result.newIsbn,result.newTitle,result.newAuthor,result.newReview,result.newCategory,result.dateRead,result.newRating,bookId
    ]);
    res.redirect("/");    
  } catch (error) {
    console.log("Error 404");
  } 
}); 
  
// Delete book review
app.post("/delete/:id",async(req,res)=>{
  try {
    const bookId=req.params.id;
    await db.query("DELETE FROM books WHERE id=$1",[bookId]);
    console.log("Deleted Successfully");
    res.redirect("/");
  } catch (error) {
    console.log("Error 404");
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});   