// --- Express Setup ---
import express from "express";
const app = express();
const port = 3000;



// --- Directory/Path Setup ---
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(__dirname + '/public'));



// --- Body Parser Setup ---
import bodyparser from "body-parser";
app.use(bodyparser.urlencoded({ extended: true }));



// --- Morgan Setup ---
import morgan from "morgan";
app.use(morgan("tiny"));



// --- EJS Rendering & Templates ---
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');



// --- Page Routes ---
app.get('/', (req, res) => {
    res.render('index', { blogPosts: blogPosts });
});



// --- Blog Post Handling ---
let blogPosts = []

function addToBlogArray(req, res) {
    const newPost = {
        title: req.body.title,
        date: new Date().toLocaleString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true }).replace(/,/g, ''),
        category: req.body.category,
        content: req.body.content
    };
    blogPosts.push(newPost);
    res.redirect('/')
};


app.post('/submit', (req, res, next) => {
    console.log("Post recorded. Form data: " + req.body.title + " " + req.body.category + " " + req.body.content);
    addToBlogArray(req, res);
});



// --- Express/Nodemon Status ---
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

