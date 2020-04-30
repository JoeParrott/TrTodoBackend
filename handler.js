// want to export a single export called app that handles CRUD elements of http request

const serverlessHttp = require('serverless-http');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql');
require('dotenv').config();

const host = process.env.DB_HOST;
const user = process.env.DB_USER;
const pw = process.env.DB_PASSWORD;
const database = process.env.DB_DATABASE;

const dbConnection = mysql.createConnection({
  host,
  user,
  password: pw,
  database,
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

// task view

app.get('/tasks', (request, response) => {
  dbConnection.query('SELECT * FROM TaskList', (err, data) => {
    if (err) {
      console.log('Error from DB', err);
      response.status(500).send(err);
    } else {
      response.status(200).send(data);
    }
  });
});

// task update
app.put('/tasks/:id', (request, response) => {
  const id = request.params.id;
  const data = request.body; // need to think through how a change request will come in!
  dbConnection.query('UPDATE TaskList SET ? WHERE TaskID = ?', [data, id], (err) => {
    if (err) {
      console.log('Error from DB', err);
      response.status(500).send(err);
    } else {
      response.status(201).send(`Successfully updated task${id}`);
    }
  });
});

// new task
app.post('/tasks', (request, response) => {
  const data = request.body;
  dbConnection.query('INSERT INTO TaskList (Title, Description, Completed, DueDate) VALUES (?, ?, ?, ?)',
    [data.Title, data.Description, false, data.DueDate], (err, results) => {
      if (err) {
        console.log('Error from DB', err);
        response.status(500).send(err);
      } else {
        dbConnection.query(`SELECT * FROM TaskList WHERE TaskID = ${results.insertId}`, (error, results) => {
          if (error) {
            console.log('Error from DB', error);
            response.status(500).send(error);
          } else {
            response.status(201).send(results[0], `Successfully created task ${results.insertId}`);
          }
        });
      }
    });
});

// task delete
app.delete('/tasks/:id', (request, response) => {
  const id = request.params.id;
  // need security on the /:id user-input
  dbConnection.query(`DELETE FROM TaskList WHERE TaskID=${id}`, (err, data) => {
    if (err) {
      console.log('Error from DB', err);
      response.status(500).send(err);
    } else {
      response.status(200).send(`Task ${id} successfully deleted.`);
    }
  });
});

module.exports.app = serverlessHttp(app);