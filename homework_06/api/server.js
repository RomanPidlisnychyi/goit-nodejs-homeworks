require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const authRouter = require('./auth/authRouter');
const contactRouter = require('./contacts/contactRouter');
const userRouter = require('./users/userRouter');
const { handlerErrors } = require('./helpers/handlerErrors');

module.exports = class ContactsServer {
  constructor() {
    this.server = null;
  }

  async start() {
    this.initServer();
    this.initMiddlewares();
    this.initRoutes();
    await this.initDatabase();
    return this.startListening();
  }

  initServer() {
    this.server = express();
  }

  initMiddlewares() {
    this.server.use(express.json());
    this.server.use(cors({ origin: 'http://localhost:3000' }));
    this.server.use(morgan('combined'));
    this.server.use(express.static('public'));
  }

  initRoutes() {
    this.server.use('/auth', authRouter);
    this.server.use('/api/contacts', contactRouter);
    this.server.use('/users', userRouter);
    this.server.use(handlerErrors);
  }

  async initDatabase() {
    try {
      await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
      });
      console.log('Database connection successful');
    } catch (err) {
      console.log(err);
      process.exit(1);
    }
  }

  startListening() {
    const PORT = process.env.PORT || 3000;

    return this.server.listen(PORT, () => {
      console.log('Server started Listening on port:', PORT);
    });
  }
};
