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



// --- Page Routes ---
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/about', (req, res) => {  
    res.send('<h1 style="color: blue; font-size: 80px;">Hi, my name is Jarred</h1>');
});



// --- Request Handling ---
var form_test = "";

function formgenerator(req, res, next) {
    console.log(req.body);
    form_test = req.body['street'] + req.body['pet'];
    next();
};

app.use(formgenerator);

app.post('/submit', (req, res, next) => {
    res.send(`<h1>Your form was received!$ {form_test}</h1>`);
});



// --- Express/Nodemon Status ---
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

