const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const contactRouter = require('./contacts/contactRouter');
require('dotenv').config();
const contactController = require('./contacts/contactController');

module.exports = class ContactsServer {
  constructor() {
    this.server = null;
  }

  async start() {
    this.initServer();
    this.initMiddlewares();
    this.initRoutes();
    await this.initDatabase();
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

  async initDatabase() {
    try {
      await mongoose.connect(process.env.MONGODB_URL);
      console.log('Database connection successful');
    } catch (err) {
      console.log(err);
      process.exit(1);
    }
  }

  startListening() {
    const { PORT } = process.env;
    this.server.listen(PORT, () => {
      console.log('Server started Listening on port:', PORT);
    });
  }
};
