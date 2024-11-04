// --- Imports ---
import bodyparser from "body-parser";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import morgan from "morgan";
import { dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import bcrypt from "bcrypt"

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
const saltRounds = 10;


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
    try {
        const userExists = await db.query('SELECT * FROM users WHERE user_id = $1', [user_id]);
        if (userExists.rows.length > 0) {
            res.send('Email already taken. Please choose another.');
        } else {
            // added Hashing
            bcrypt.hash(password, saltRounds, async (err, hash) => {
                if (err) {
                    return res.send('Error hashing password.');
                } else {
                await db.query('INSERT INTO users (user_id, password, name) VALUES ($1, $2, $3)', [user_id, hash, name]);
                res.redirect('/signin');
                }
            });
        }
    } catch (err) {
    console.log(err);
    }
});

app.get('/signin', (req, res) => {
    res.render('signin');
});

app.post('/signin', async (req, res) => {
    const { user_id, password } = req.body;
    
    try {
        const result = await db.query('SELECT * FROM users WHERE user_id = $1', [user_id]);
        if (result.rows.length === 0) {
            return res.send('Invalid user ID or password.');
        }

        const user = result.rows[0];
        const storedHashedPassword = user.password;

        bcrypt.compare(password, storedHashedPassword, (err, isMatch) => {
            if (err) {
                return res.send('Error comparing passwords.');
            }
            if (isMatch) {
                req.session.user = user;
                res.redirect('/');
            } else {
                res.send('Invalid user ID or password.');
            }
        });
    } catch (error) {
        res.send('Error querying the database.');
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


// --- Server Start ---
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});