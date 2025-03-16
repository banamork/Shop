const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors')
const path = require('path');
const app = express();
const port = 3000;

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');    ;


app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'PCShop',
    password: '',
    port: 5432,
});


app.get('/reg.html', (req, res) => {
    res.sendFile(__dirname + '/views/reg.html');
});
app.get('/main.html', (req, res) => {
    res.sendFile(__dirname + '/views/main.html');
});

app.get('/korzina.html', (req, res) => {
    res.sendFile(__dirname + '/views/korzina.html');
});
app.get('/profile.html', (req, res) => {
    res.sendFile(__dirname + '/views/profile.html');
});
app.get('/sklad_i_zakupki.html', (req, res) => {
    res.sendFile(__dirname + '/views/sklad_i_zakupki.html');
});
app.get('/str_main.html', (req, res) => {
    res.sendFile(__dirname + '/views/str_main.html');
});
app.get('/tovar.html', (req, res) => {
    res.sendFile(__dirname + '/views/tovar.html');
});
app.get('/vxod.html', (req, res) => {
    res.sendFile(__dirname + '/views/vxod.html');
});
app.get('/vxod_str.html', (req, res) => {
    res.sendFile(__dirname + '/views/vxod_str.html');
});
app.get('/zakaz.html', (req, res) => {
    res.sendFile(__dirname + '/views/zakaz.html');
});
app.get('/zakaz_us.html', (req, res) => {
    res.sendFile(__dirname + '/views/zakaz_us.html');
});
app.get('/tovar.html', (req, res) => {
    res.sendFile(__dirname + '/views/tovar.html');
});
app.get('/zakupki.html', (req, res) => {
    res.sendFile(__dirname + '/views/zakupki.html');
});
app.get('/dobavlenie_tovara.html', (req, res) => {
    res.sendFile(__dirname + '/views/dobavlenie_tovara.html');
});


app.get('/', function (req, res) {
    res.render('main.html', {});
});

function generateRandomNumber() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}


app.post('/add', async (req, res) => {
    const { name, password } = req.body;
    const id = String(generateRandomNumber());
    const result = await pool.query('INSERT INTO users(id, name, password) VALUES($1, $2, $3)', [id, name, password]);
    res.json({ message: 'Data added successfully!' });
});


app.get('/data', async (req, res) => {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
});


app.post('/check-username-workers', async (req, res) => {
    const name = req.body.name;
    console.log('Полученное имя:', name); // Добавьте это сообщение
    try {
        const query = 'SELECT EXISTS(SELECT 1 FROM workers WHERE name = $1)';
        const values = [name];

        console.log('Запрос:', query, 'Параметры:', values);

        const result = await pool.query(query, values);
        res.json({ exists: result.rows[0].exists });
    } catch (error) {
        console.error('Ошибка при выполнении запроса', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/check-username-users', async (req, res) => {
    const name = req.body.name;
    console.log('Полученное имя:', name); // Добавьте это сообщение
    try {
        const query = 'SELECT EXISTS(SELECT 1 FROM users WHERE name = $1)';
        const values = [name];

        console.log('Запрос:', query, 'Параметры:', values);

        const result = await pool.query(query, values);
        res.json({ exists: result.rows[0].exists });
    } catch (error) {
        console.error('Ошибка при выполнении запроса', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.get('/api/goods_storage', async (req, res) => {
    try {
        const query = 'SELECT id, id_goods, amount, id_storage FROM public.goods_storage';
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера');
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const query = `
            SELECT id, id_order, id_goods, amount, purchase_price 
            FROM public.orders_in_strings_for_suppliers
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера');
    }
});

app.get('/api/usersorders', async (req, res) => { // Изменен путь на /api/usersorders
    try {
        const query = `
            SELECT id, id_user, date, address, status 
            FROM public.orders
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера');
    }
});

app.get('/api/orders-to-supplier', async (req, res) => {
    try {
        const query = `
            SELECT id, company_id, status, worker_id, id_storage 
            FROM public.orders_to_supplier
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера');
    }
});

app.get('/api/goods', async (req, res) => {
    try {
        const query = `
            SELECT id, name, sell_price, width, manufacturer, company, id_category 
            FROM public.goods
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера');
    }
});

app.post('/api/orders-in-strings', async (req, res) => {
    const { id, id_order, id_goods, amount, purchase_price } = req.body;

    try {
        const query = `
            INSERT INTO public.orders_in_strings_for_suppliers (id, id_order, id_goods, amount, purchase_price)
            VALUES ($1, $2, $3, $4, $5)
        `;
        const values = [id, id_order, id_goods, amount, purchase_price];

        await pool.query(query, values);
        res.status(201).json({ message: 'Данные успешно добавлены' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});