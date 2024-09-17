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

app.post('/submit', (req, res, next) => {
    console.log("Post recorded.\nTitle: " + req.body.title + "\nCategory: " + req.body.category + "\nPost ID: " + blogPostCounter);
    addToBlogArray(req, res);
});

app.get('/edit/:id', (req, res) => {
    const postId = req.params.id;
    const post = blogPosts[postId];
    res.render('edit', { postId, post });

    console.log("Post edited. Post ID: " + postId);
});

app.post('/update/:id', (req, res) => {
    const postId = req.params.id;
    const post = blogPosts[postId];
    post.title = req.body.title;
    post.category = req.body.category;
    post.content = req.body.content;
    res.redirect('/');

    console.log("Post updated. Post ID: " + postId);
});

app.get('/delete/:id', (req, res) => {
    const postId = req.params.id;
    blogPosts = blogPosts.filter(post => post.id != postId); // Stack Overflow solution (ECMA-262 Edition 5 code AKA old style JavaScript)
    res.redirect('/');

    console.log("Post deleted. Post ID: " + postId);
});



// --- Blog Post Handling ---
let blogPosts = []
let blogPostCounter = 0;

function addToBlogArray(req, res) {
    const newPost = {
        title: req.body.title,
        date: new Date().toLocaleString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }).replace(/,/g, ''),
        category: req.body.category,
        content: req.body.content,
        id: blogPostCounter++
    };
    blogPosts.push(newPost);
    res.redirect('/')
};



// --- Server Start ---
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

