// want to export a single export called app that handles CRUD elements of http request

const serverlessHttp = require('serverless-http');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql');
require('dotenv').config();

const dbConnection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});
const app = express();
app.use(cors());
app.use(bodyParser.json());

//task view
app.get('/tasks', function (request, response) {
    dbConnection.query(`SELECT * FROM TaskList`, (err, data) => {
        if (err) {
            console.log('Error from DB', err);
            response.status(500).send(err)
        } else {
            response.status(200).send(data);
        }
    });
});

//task update
app.put('/tasks/:id', (request, response) => {
    const id = request.params.id;
    const data = request.body ; //need to think through how a change request will come in!
    /*dbConnection.query(`UPDATE TaskList SET ${data.key}=${data.value} WHERE TaskID=${id}`, function(err, data) {
        if (err) {
            console.log('Error from DB', err);
            response.status(500).send(err)
        } else {
            response.status(201).send(data);
        } 
    })*/
});

//newtask
app.post('/tasks', (request, response) => {
    const data = request.body;
    dbConnection.query(`INSERT INTO TaskList (Title, Description, Completed, DueDate) VALUES (?, ?, ?, ?)`, [data.Title, data.Description, FALSE, data.DueDate], (err, results) => {
        if (err) {
            console.log('Error from DB', err);
            response.status(500).send(err)
        } else {
            dbConnection.query(`SELECT * FROM TaskList WHERE TaskID = ${results.insertId}`, (err, results) => {
                  if (err) {
                    console.log('Error from DB', err);
                    response.status(500).send(err);
                  } else {
                    response.status(201).send(results[0]);
                  }
                }
              ); 
            };
        });
});

//task delete
app.delete('/tasks/:id', (err, data) => {
    const id = request.params.id;
    dbConnection.query(`DELETE FROM TaskList WHERE TaskID=${id}`, (err, data) => {
    if (err) {
        console.log('Error from DB', err);
        response.status(500).send(err)
    } else {
        response.status(200).send(`Task ${id} successfully deleted.`);
    }
});

module.exports.app = serverlessHttp(app);