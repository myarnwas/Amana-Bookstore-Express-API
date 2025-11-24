const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware لقراءة JSON
app.use(express.json());

// Middleware لتسجيل الطلبات في log.txt
const logStream = fs.createWriteStream(path.join(__dirname, "log.txt"), { flags: "a" });
app.use(morgan("combined", { stream: logStream }));

// قراءة بيانات الكتب والمراجعات
// قراءة بيانات الكتب والمراجعات
const books = require("./data/books.json");      
const reviewsData = require("./data/reviews.json");
const reviews = reviewsData.reviews; // مهم جدا أن يكون هذا السطر موجود

// مسار اختبار أساسي
app.get("/", (req, res) => {
  res.send("Amana Bookstore API is running");
});

/////////////////////////
//  GET Routes
/////////////////////////

// (1) جميع الكتب
app.get("/books", (req, res) => {
  res.json(books);
});

// (2) كتاب واحد حسب ID
app.get("/books/:id", (req, res) => {
  const book = books.find(b => b.id === Number(req.params.id));
  book ? res.json(book) : res.status(404).send("Book not found");
});

// (3) الكتب بين نطاق تاريخ
app.get("/books/date/:start/:end", (req, res) => {
  const { start, end } = req.params;
  const filtered = books.filter(b => b.datePublished >= start && b.datePublished <= end);
  res.json(filtered);
});

// (4) أفضل 10 كتب (rating * reviewCount)
app.get("/books/top-rated", (req, res) => {
  const top = [...books]
    .sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount))
    .slice(0, 10);
  res.json(top);
});

// (5) الكتب المميزة
app.get("/books/featured", (req, res) => {
  res.json(books.filter(b => b.featured === true));
});

// (6) جميع مراجعات كتاب معين
app.get("/reviews/:bookId", (req, res) => {
  const bookId = Number(req.params.bookId);
  const list = reviews.filter(r => r.bookId === bookId);
  res.json(list);
});

/////////////////////////
//  POST Routes
/////////////////////////

// Middleware للتحقق من المصادقة
function isAuthenticated(req, res, next) {
  const key = req.headers["auth"];
  if (key === "my-secret-key") return next();
  res.status(403).send("Forbidden");
}

// (1) إضافة كتاب جديد (محمية)
app.post("/books", isAuthenticated, (req, res) => {
  const newBook = {
    id: books.length + 1,
    ...req.body
  };
  books.push(newBook);
  res.status(201).json(newBook);
});

// (2) إضافة مراجعة جديدة
app.post("/reviews", (req, res) => {
  const newReview = {
    id: reviews.length + 1,
    ...req.body
  };
  reviews.push(newReview);
  res.status(201).json(newReview);
});

// تشغيل الخادم
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
