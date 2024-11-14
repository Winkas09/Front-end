const express = require('express');
const bodyParser = require('body-parser');
const os = require('os');
const si = require('systeminformation');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

let users = {}; // storiname login ir password info cia 

const generateHTML = (title, content) => {
    return `
    <html>
    <head>
        <title>${title}</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f0f0f0; margin: 0; padding: 0; }
            h1 { color: #333; }
            p { color: #666; }
            .container { max-width: 800px; margin: 50px auto; padding: 20px; background-color: #fff; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
            pre { background-color: #eee; padding: 10px; border-radius: 5px; }
            button { margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>${title}</h1>
            ${content}
        </div>
    </body>
    </html>
    `;
};

// pirmas routas 
app.get('/', (req, res) => {
    const form = `
    <form action="/" method="post">
        <label for="username">Username:</label>
        <input type="text" id="username" name="username" required>
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required>
        <button type="submit">Register</button>
    </form>
    `;
    res.send(generateHTML('Register', form));
});

app.post('/', (req, res) => {
    const { username, password } = req.body;
    if (users[username]) {
        res.send(generateHTML('Register', '<p>Username already exists. Please choose another one.</p>'));
    } else {
        users[username] = password; // saugom username ir passworda
        res.send(generateHTML('Register', '<p>Registered successfully! Now you can <a href="/login">log in</a>.</p>'));
    }
});

// antras routas
app.get('/login', (req, res) => {
    const form = `
    <form action="/login" method="post">
        <label for="username">Username:</label>
        <input type="text" id="username" name="username" required>
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required>
        <button type="submit">Login</button>
    </form>
    `;
    res.send(generateHTML('Login', form));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // patikriname ar username ir password yra tokie patys kaip saugomi users objekte
    if (users[username] && users[username] === password) {
        res.redirect('/os-info'); // jeigu praeina patikra redirectiname i os-info
    } else {
        const errorMessage = `
            <p>Invalid username or password. Please try again.</p>
            <button onclick="window.location.href='/login'">Back to Login</button>
        `;
        res.send(generateHTML('Login', errorMessage));
    }
});

// trecias routas kuriame yra 4 opcijos ir redirectina i kitus 4 routus
app.get('/os-info', (req, res) => {
    const form = `
    <form action="/info" method="post">
        <label for="infoType">Select Information Type:</label>
        <select name="infoType" id="infoType">
            <option value="cpu">CPU Info</option>
            <option value="gpu">GPU Info</option>
            <option value="memory">Memory Info</option>
            <option value="disk">Disk Info</option>
        </select>
        <button type="submit">Submit</button>
    </form>
    `;
    res.send(generateHTML('Select Information', form));
});

app.post('/info', (req, res) => {
    const infoType = req.body.infoType;
    res.redirect(`/${infoType}`);
});

app.get('/cpu', async (req, res) => {
    const cpuData = await si.cpu();
    const cpuInfo = `
        <p>Manufacturer: ${cpuData.manufacturer}</p>
        <p>Brand: ${cpuData.brand}</p>
        <p>Speed: ${cpuData.speed} GHz</p>
        <p>Cores: ${cpuData.cores}</p>
        <p>Physical Cores: ${cpuData.physicalCores}</p>
        <p>Processors: ${cpuData.processors}</p>
        <button onclick="window.location.href='/os-info'">Back to OS Info</button>
    `;
    res.send(generateHTML('CPU Information', cpuInfo));
});

app.get('/gpu', async (req, res) => {
    const gpuData = await si.graphics();
    const gpuInfo = JSON.stringify(gpuData, null, 2);
    const content = `<pre>${gpuInfo}</pre><button onclick="window.location.href='/os-info'">Back to OS Info</button>`;
    res.send(generateHTML('GPU Information', content));
});

app.get('/memory', (req, res) => {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const content = `
        <p>Total Memory: ${(totalMem / (1024 ** 3)).toFixed(2)} GB</p>
        <p>Free Memory: ${(freeMem / (1024 ** 3)).toFixed(2)} GB</p>
        <button onclick="window.location.href='/os-info'">Back to OS Info</button>
    `;
    res.send(generateHTML('Memory Information', content));
});

app.get('/disk', async (req, res) => {
    const diskData = await si.diskLayout();
    const diskInfo = JSON.stringify(diskData, null, 2);
    const content = `<pre>${diskInfo}</pre><button onclick="window.location.href='/os-info'">Back to OS Info</button>`;
    res.send(generateHTML('Disk Information', content));
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});