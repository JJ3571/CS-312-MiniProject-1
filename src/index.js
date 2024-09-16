import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

const PORT = 3000;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/about', (req, res) => {  
    res.send('<h1 style="color: blue; font-size: 80px;">Hello Adri</h1>');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

