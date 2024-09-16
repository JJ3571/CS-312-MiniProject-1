// --- Express Setup ---
import express from "express";

const app = express();
const port = 3000;


// --- Directory/Path Setup ---
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));


// --- Body Parser Setup ---
import bodyparser from "body-parser";
app.use(bodyparser.urlencoded({ extended: true }));

app.post('/submit', (req, res) => {
    console.log(req.body);
    res.send('Data received');
});

// --- Morgan Setup ---
import morgan from "morgan";
app.use(morgan("tiny"));


// --- Page Routes ---
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/about', (req, res) => {  
    res.send('<h1 style="color: blue; font-size: 80px;">Hi, my name is Jarred</h1>');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

