const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const contactRouter = require('./contacts/contactRouter');
require('dotenv').config();
const contactController = require('./contacts/contactController');

module.exports = class ContactsServer {
  constructor() {
    this.server = null;
    this.PORT = process.env.PORT;
  }

  start() {
    this.initServer();
    this.initMiddlewares();
    this.initRoutes();
    this.catchError();
    this.startListening();
  }

  initServer() {
    this.server = express();
  }

  initMiddlewares() {
    this.server.use(express.json());
    this.server.use(cors({ origin: 'http://localhost:3000' }));
    this.server.use(morgan('combined'));
  }

  initRoutes() {
    this.server.use('/api/contacts', contactRouter);
  }

  catchError() {
    this.server.use(contactController.handlerErors);
  }

  startListening() {
    this.server.listen(this.PORT, () => {
      console.log('Server started Listening on port:', this.PORT);
    });
  }
};
