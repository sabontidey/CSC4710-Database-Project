
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config();

const app = express();
const dbService = require('./dbService');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// =====================================
// USER REGISTRATION
// =====================================
app.post('/register', async (request, response) => {
    try {
        const {
            username,
            password,
            firstname,
            lastname,
            salary,
            age
        } = request.body;

        if (
            typeof username !== 'string' ||
            typeof password !== 'string' ||
            typeof firstname !== 'string' ||
            typeof lastname !== 'string' ||
            username.trim() === '' ||
            password === '' ||
            firstname.trim() === '' ||
            lastname.trim() === '' ||
            salary === undefined ||
            salary === null ||
            salary === '' ||
            age === undefined ||
            age === null ||
            age === ''
        ) {
            return response.status(400).json({
                success: false,
                message: 'Please fill out all fields.'
            });
        }

        const salaryNumber = Number(salary);
        const ageNumber = Number(age);

        if (
            username.length > 50 ||
            firstname.length > 50 ||
            lastname.length > 50 ||
            password.length > 72 ||
            !Number.isFinite(salaryNumber) ||
            salaryNumber < 0 ||
            !Number.isInteger(ageNumber) ||
            ageNumber < 1
        ) {
            return response.status(400).json({
                success: false,
                message: 'Please enter valid registration information.'
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const db = dbService.getDbServiceInstance();

        await db.registerUser(
            username.trim(),
            passwordHash,
            firstname.trim(),
            lastname.trim(),
            salaryNumber,
            ageNumber
        );

        return response.status(201).json({
            success: true,
            message: 'Registration successful!'
        });

    } catch (error) {
        console.error('Registration error:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return response.status(409).json({
                success: false,
                message: 'Username already exists.'
            });
        }

        return response.status(500).json({
            success: false,
            message: 'Registration failed.'
        });
    }
});

// =====================================
// USER LOGIN
// =====================================
app.post('/login', async (request, response) => {
    try {
        const { username, password } = request.body;

        if (
            typeof username !== 'string' ||
            typeof password !== 'string' ||
            username.trim() === '' ||
            password === ''
        ) {
            return response.status(400).json({
                success: false,
                message: 'Please enter your username and password.'
            });
        }

        const db = dbService.getDbServiceInstance();

        const user = await db.getUserByUsername(username.trim());

        if (!user) {
            return response.status(401).json({
                success: false,
                message: 'Invalid username or password.'
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

       if (!passwordMatches) {
    return response.status(401).json({
        success: false,
        message: 'Invalid username or password.'
    });
  }

     // Record the successful login time in MySQL
    await db.updateSignInTime(user.username);

  return response.json({
    success: true,
    message: 'Login successful!'
  });
    } catch (error) {
        console.error('Login error:', error);

        return response.status(500).json({
            success: false,
            message: 'Login failed.'
        });
    }
});

// =====================================
// ORIGINAL PROJECT ROUTES
// =====================================

// Insert a name
app.post('/insert', (request, response) => {
    const { name } = request.body;
    const db = dbService.getDbServiceInstance();

    db.insertNewName(name)
        .then(data => response.json({ data: data }))
        .catch(err => {
            console.error(err);
            response.status(500).json({ error: 'Insert failed' });
        });
});

// Get all names
app.get('/getAll', (request, response) => {
    const db = dbService.getDbServiceInstance();

    db.getAllData()
        .then(data => response.json({ data: data }))
        .catch(err => {
            console.error(err);
            response.status(500).json({ error: 'Fetch failed' });
        });
});

// Search for a name
app.get('/search/:name', (request, response) => {
    const { name } = request.params;
    const db = dbService.getDbServiceInstance();

    db.searchByName(name)
        .then(data => response.json({ data: data }))
        .catch(err => {
            console.error(err);
            response.status(500).json({ error: 'Search failed' });
        });
});

// Update a name
app.patch('/update', (request, response) => {
    const { id, name } = request.body;
    const db = dbService.getDbServiceInstance();

    db.updateNameById(id, name)
        .then(data => response.json({ success: data }))
        .catch(err => {
            console.error(err);
            response.status(500).json({ error: 'Update failed' });
        });
});

// Delete a name
app.delete('/delete/:id', (request, response) => {
    const { id } = request.params;
    const db = dbService.getDbServiceInstance();

    db.deleteRowById(id)
        .then(data => response.json({ success: data }))
        .catch(err => {
            console.error(err);
            response.status(500).json({ error: 'Delete failed' });
        });
});

// Debug route
app.get('/debug', (request, response) => {
    response.json({
        message: 'Backend is working!',
        database: process.env.DATABASE,
        port: process.env.PORT || 5050
    });
});

// Test database connection
app.get('/testdb', async (request, response) => {
    try {
        const db = dbService.getDbServiceInstance();
        const data = await db.getAllData();

        response.json({
            success: true,
            data: data
        });
    } catch (error) {
        response.status(500).json({
            success: false,
            message: 'Database test failed.'
        });
    }
});


 // Search 1: Find users by first name or last name
 app.get('/api/search/name', async (request, response) => {
    try {
        const { firstname, lastname } = request.query;

        if (!firstname && !lastname) {
            return response.status(400).json({
                error: 'Enter a first name or last name'
            });
        }

        const db = dbService.getDbServiceInstance();

        const rows = await db.runSearch(
            `SELECT username, firstname, lastname, salary, age,
                    registerday, signintime
             FROM Users
             WHERE firstname = ? OR lastname = ?`,
            [firstname || '', lastname || '']
        );

        response.json(rows);
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: 'Search failed' });
    }
});

 // Search 2: Find a user by username
 app.get('/api/search/user', async (request, response) => {
    try {
        const { username } = request.query;

        if (!username) {
            return response.status(400).json({
                error: 'Please enter a username'
            });
        }

        const db = dbService.getDbServiceInstance();

        const rows = await db.runSearch(
            `SELECT username, firstname, lastname, salary, age,
                    registerday, signintime
             FROM Users
             WHERE username = ?`,
            [username]
        );

        response.json(rows);
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: 'Search failed' });
    }
});

 // Search 3: Find users within a salary range
 app.get('/api/search/salary', async (request, response) => {
    try {
        const { min, max } = request.query;

        if (
            typeof min !== 'string' ||
            typeof max !== 'string' ||
            min.trim() === '' ||
            max.trim() === '' ||
            !Number.isFinite(Number(min)) ||
            !Number.isFinite(Number(max)) ||
            Number(min) < 0 ||
            Number(min) > Number(max)
        ) {
            return response.status(400).json({
                error: 'Enter a valid minimum and maximum salary'
            });
        }

        const db = dbService.getDbServiceInstance();

        const rows = await db.runSearch(
            `SELECT username, firstname, lastname, salary, age,
                    registerday, signintime
             FROM Users
             WHERE salary BETWEEN ? AND ?
             ORDER BY salary`,
            [Number(min), Number(max)]
        );

        response.json(rows);
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: 'Search failed' });
    }
});

 // Search 4: Find users within an age range
 app.get('/api/search/age', async (request, response) => {
    try {
        const { min, max } = request.query;

        if (
            typeof min !== 'string' ||
            typeof max !== 'string' ||
            min.trim() === '' ||
            max.trim() === '' ||
            !Number.isInteger(Number(min)) ||
            !Number.isInteger(Number(max)) ||
            Number(min) < 0 ||
            Number(min) > Number(max)
        ) {
            return response.status(400).json({
                error: 'Enter a valid minimum and maximum age'
            });
        }

        const db = dbService.getDbServiceInstance();

        const rows = await db.runSearch(
            `SELECT username, firstname, lastname, salary, age,
                    registerday, signintime
             FROM Users
             WHERE age BETWEEN ? AND ?
             ORDER BY age`,
            [Number(min), Number(max)]
        );

        response.json(rows);
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: 'Search failed' });
    }
});

 // Search 5: Users registered after John
 app.get('/api/search/after-john', async (request, response) => {
    try {
        const db = dbService.getDbServiceInstance();

        const rows = await db.runSearch(
            `SELECT username, firstname, lastname, salary, age, registerday, signintime
             FROM Users
             WHERE registerday > (
                 SELECT registerday
                 FROM Users
                 WHERE username = ?
             )
             ORDER BY registerday`,
            ['testuser3']
        );

        response.json(rows);
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: 'Search failed' });
    }
});

 // Search 6: Users who have never signed in
 app.get('/api/search/never-signed-in', async (request, response) => {
    try {
        const db = dbService.getDbServiceInstance();

        const rows = await db.runSearch(
            `SELECT username, firstname, lastname, salary, age, registerday, signintime
             FROM Users
             WHERE signintime IS NULL
             ORDER BY username`
        );

        response.json(rows);
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: 'Search failed' });
    }
});

 // Search 7: Users registered on the same day as John
 app.get('/api/search/same-day-john', async (request, response) => {
    try {
        const db = dbService.getDbServiceInstance();

        const rows = await db.runSearch(
            `SELECT username, firstname, lastname, salary, age, registerday, signintime
             FROM Users
             WHERE DATE(registerday) = (
                 SELECT DATE(registerday)
                 FROM Users
                 WHERE username = ?
             )
             AND username <> ?
             ORDER BY username`,
            ['testuser3', 'testuser3']
        );

        response.json(rows);
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: 'Search failed' });
    }
});

 // Search 8: Users registered today
 app.get('/api/search/today', async (request, response) => {
    try {
        const db = dbService.getDbServiceInstance();

        const rows = await db.runSearch(
            `SELECT username, firstname, lastname, salary, age, registerday, signintime
             FROM Users
             WHERE registerday >= CURDATE()
               AND registerday < CURDATE() + INTERVAL 1 DAY
             ORDER BY username`
        );

        response.json(rows);
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: 'Search failed' });
    }
});



// =====================================
// START SERVER
// =====================================
const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
