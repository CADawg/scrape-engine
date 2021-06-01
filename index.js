require("dotenv").config();
const mysql = require("mysql2");
const express = require('express');
const path = require("path");


const dbPoolSync = mysql.createPool({
    connectionLimit: 100,
    host: "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: "utf8mb4"
});

const dbPool = dbPoolSync.promise();

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.get('/search', async (req, res) => {
    if (req.query.q === "" || req.query.q === undefined) {
        res.render("searchStart");
    } else {
        let q = "%" + req.query.q
            .replace(/!/g, "!!")
            .replace(/%/g, "!%")
            .replace(/_/g, "!_")
            .replace(/\[/g, "![")
            + "%";
        q = q.toLowerCase();
        [rows] = await dbPool.query("SELECT * FROM `indexed` WHERE LOWER(url) LIKE ? or LOWER(title) LIKE ? or LOWER(description) LIKE ? ESCAPE '!';", [q,q,q])

        res.render("search", {rows, query: req.query.q});
    }
});

app.listen(3000, () => {
    console.log('server started');
});