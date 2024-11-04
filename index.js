// --- Imports ---
import bodyparser from "body-parser";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import morgan from "morgan";
import { dirname } from "path";
import pg from "pg";
import { fileURLToPath } from "url";



// --- Express Setup ---
const app = express();
const port = 3000;



// --- Middlewares (dirname, Body Parser, Morgan, .env) ---
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(__dirname + '/public'));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(morgan("tiny"));
dotenv.config();
const DB_PASSWORD = process.env.DB_PASSWORD;



// --- Sessions for user auth ---
app.use(session({
    secret: 'apAPS*RcU^o2MjonW%9i', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));



// --- Database Setup ---
const db = new pg.Client({
    user: 'postgres',
    host: 'localhost',
    database: 'world',
    password: DB_PASSWORD,
    port: 5432,
});
db.connect();



// --- EJS Rendering & Templates ---
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');



// --- Page Routes ---
app.get('/', async (req, res) => {
    const result = await db.query('SELECT * FROM blogs');
    res.render('index', { blogPosts: result.rows, user: req.session.user });
});



// --- User Auth routes ---
app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    const { user_id, password, name } = req.body;
    const userExists = await db.query('SELECT * FROM users WHERE user_id = $1', [user_id]);
    if (userExists.rows.length > 0) {
        res.send('User ID already taken. Please choose another.');
    } else {
        await db.query('INSERT INTO users (user_id, password, name) VALUES ($1, $2, $3)', [user_id, password, name]);
        res.redirect('/signin');
    }
});

app.get('/signin', (req, res) => {
    res.render('signin');
});

app.post('/signin', async (req, res) => {
    const { user_id, password } = req.body;
    const user = await db.query('SELECT * FROM users WHERE user_id = $1 AND password = $2', [user_id, password]);
    if (user.rows.length > 0) {
        req.session.user = user.rows[0];
        res.redirect('/');
    } else {
        res.send('Invalid user ID or password.');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send('Error logging out.');
        }
        res.redirect('/');
    });
});

app.post('/submit', async (req, res) => {
    const { title, body } = req.body;
    const creator_name = req.session.user.name;
    const creator_user_id = req.session.user.user_id;
    await db.query('INSERT INTO blogs (creator_name, creator_user_id, title, body) VALUES ($1, $2, $3, $4)', [creator_name, creator_user_id, title, body]);
    res.redirect('/');
});

app.get('/edit/:id', async (req, res) => {
    const postId = req.params.id;
    const result = await db.query('SELECT * FROM blogs WHERE blog_id = $1', [postId]);
    const post = result.rows[0];
    const user = req.session.user;
    if (req.session.user.user_id === post.creator_user_id) {
        res.render('edit', { post });
    } else {
        res.send('Unauthorized');
    }
});

app.post('/edit/:id', async (req, res) => {
    const postId = req.params.id;
    const { title, body } = req.body;
    await db.query('UPDATE blogs SET title = $1, body = $2 WHERE blog_id = $3', [title, body, postId]);
    res.redirect('/');
});

app.get('/delete/:id', async (req, res) => {
    const postId = req.params.id;
    const result = await db.query('SELECT * FROM blogs WHERE blog_id = $1', [postId]);
    const post = result.rows[0];
    if (req.session.user.user_id === post.creator_user_id) {
        await db.query('DELETE FROM blogs WHERE blog_id = $1', [postId]);
        res.redirect('/');
    } else {
        res.send('Unauthorized');
    }
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