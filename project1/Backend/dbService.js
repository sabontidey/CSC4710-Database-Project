
const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

let instance = null;

// Database connection settings
console.log("HOST: " + process.env.HOST);
console.log("DB USER: " + process.env.DB_USER);
console.log("DATABASE: " + process.env.DATABASE);
console.log("DB PORT: " + process.env.DB_PORT);

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DB_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT
});

connection.connect((err) => {
    if (err) {
        console.log("Database connection error:", err.message);
        return;
    }

    console.log('db ' + connection.state);
});

class DbService {

    static getDbServiceInstance() {
        return instance ? instance : new DbService();
    }

    // Get all names
    async getAllData() {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM names;";

                connection.query(query, (err, results) => {
                    if (err) reject(new Error(err.message));
                    else resolve(results);
                });
            });

            return response;

        } catch (error) {
            console.log(error);
        }
    }

    // Insert a new name
    async insertNewName(name) {
        try {
            const dateAdded = new Date();

            const insertId = await new Promise((resolve, reject) => {
                const query = "INSERT INTO names (name, date_added) VALUES (?, ?);";

                connection.query(query, [name, dateAdded], (err, result) => {
                    if (err) reject(new Error(err.message));
                    else resolve(result.insertId);
                });
            });

            console.log(insertId);

            return {
                id: insertId,
                name: name,
                dateAdded: dateAdded
            };

        } catch (error) {
            console.log(error);
        }
    }

    // Search for a name
    async searchByName(name) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM names WHERE name = ?;";

                connection.query(query, [name], (err, results) => {
                    if (err) reject(new Error(err.message));
                    else resolve(results);
                });
            });

            return response;

        } catch (error) {
            console.log(error);
        }
    }

    // Delete a name
    async deleteRowById(id) {
        try {
            id = parseInt(id, 10);

            const response = await new Promise((resolve, reject) => {
                const query = "DELETE FROM names WHERE id = ?;";

                connection.query(query, [id], (err, result) => {
                    if (err) reject(new Error(err.message));
                    else resolve(result.affectedRows);
                });
            });

            console.log(response);

            return response === 1;

        } catch (error) {
            console.log(error);
        }
    }

    // Update a name
    async updateNameById(id, newName) {
        try {
            console.log("dbService:");
            console.log(id);
            console.log(newName);

            id = parseInt(id, 10);

            const response = await new Promise((resolve, reject) => {
                const query = "UPDATE names SET name = ? WHERE id = ?;";

                connection.query(query, [newName, id], (err, result) => {
                    if (err) reject(new Error(err.message));
                    else resolve(result.affectedRows);
                });
            });

            return response === 1;

        } catch (error) {
            console.log(error);
        }
    }

    // Register a new user
    async registerUser(username, passwordHash, firstname, lastname, salary, age) {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO Users
                (username, password_hash, firstname, lastname, salary, age)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            connection.query(
                query,
                [username, passwordHash, firstname, lastname, salary, age],
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                }
            );
        });

      } 
    // Find a user by username for login
    async getUserByUsername(username) {
        return new Promise((resolve, reject) => {
            const query = "SELECT username, password_hash FROM Users WHERE username = ?";

            connection.query(query, [username], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results[0] || null);
                }
            });
        });

      }
    // Update the user's last successful sign-in time
    async updateSignInTime(username) {
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE Users
                SET signintime = NOW()
                WHERE username = ?
            `;

            connection.query(query, [username], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    }

    


module.exports = DbService;
