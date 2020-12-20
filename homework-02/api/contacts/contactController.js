const Joi = require('joi');
const fs = require('fs');
const { promises: fsPromises } = fs;
const path = require('path');

const contactsPath = path.join(__dirname, '../db/contacts.json');

const listContacts = async () => {
  try {
    const data = await fsPromises.readFile(contactsPath, 'utf-8');

    return JSON.parse(data);
  } catch (error) {
    throw error;
  }
};

const getContactById = async (req, res, next) => {
  try {
    const contacts = await listContacts();

    const targetContactIndex = await findContactIndexByiD(
      parseInt(req.params.contactId)
    );

    return res.send(contacts[targetContactIndex]);
  } catch (error) {
    next(error);
  }
};

const createContact = async (req, res, next) => {
  try {
    const contacts = await listContacts();

    const newContact = {
      id: contacts.reduce((acc, contact) => {
        if (acc === contact.id) {
          return (acc += 1);
        }
        return acc;
      }, 1),
      ...req.body,
    };

    const isEmailAlradyExist = contacts.find(
      contact => contact.email === newContact.email
    );

    if (isEmailAlradyExist) {
      const newError = new Error();
      newError.status = 402;
      throw newError;
    }

    const newContacts = [...contacts, newContact];

    newContacts.sort((a, b) => a.id - b.id);

    const newContactsJson = JSON.stringify(newContacts);

    fsPromises.writeFile(contactsPath, newContactsJson);

    return res
      .status(201)
      .send(`Contact: ${JSON.stringify(newContact)} was successfully added!`);
  } catch (error) {
    next(error);
  }
};

const getContacts = async (req, res, next) => res.json(await listContacts());

const updateContact = async (req, res, next) => {
  try {
    const contacts = await listContacts();

    const targetContactIndex = await findContactIndexByiD(
      parseInt(req.params.contactId)
    );

    const newContacts = contacts.map((contact, i, arr) => {
      if (contact == arr[targetContactIndex]) {
        contact = {
          ...contact,
          ...req.body,
        };
      }
      return contact;
    });

    const newContactsJson = JSON.stringify(newContacts);

    fsPromises.writeFile(contactsPath, newContactsJson);

    return res.send(newContacts[targetContactIndex]);
  } catch (error) {
    next(error);
  }
};

const deleteContact = async (req, res, next) => {
  try {
    const contacts = await listContacts();

    const contactId = parseInt(req.params.contactId);

    await findContactIndexByiD(contactId);

    const newContacts = contacts.filter(contact => contact.id !== contactId);

    const newContactsJson = JSON.stringify(newContacts);

    fsPromises.writeFile(contactsPath, newContactsJson);

    return res.send(`Contact was successfully removed!`);
  } catch (error) {
    next(error);
  }
};

const handlerErors = (err, req, res, next) => {
  delete err.stack;

  if (err.status === 400) {
    err.message =
      err.type === 'UpdateContact'
        ? 'missing fields'
        : 'missing required name field';

    delete err.type;
  }

  if (err.status === 402) {
    err.message = 'This Email alrady used! Please enter enother.';
  }

  if (err.status === 404) {
    err.message = 'Contact not found';
  }

  return res.status(err.status).send(err.message);
};
const findContactIndexByiD = async contactId => {
  const contacts = await listContacts();

  const targetContactIndex = contacts.findIndex(
    contact => contact.id === contactId
  );

  if (targetContactIndex === -1) {
    const newError = new Error();
    newError.status = 404;
    throw newError;
  }

  return targetContactIndex;
};

const validateCreateContact = (req, res, next) => {
  const createContactRules = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    phone: Joi.string().required(),
  });

  const validationResult = createContactRules.validate(req.body);

  if (validationResult.error) {
    const newError = new Error();
    newError.status = 400;
    throw newError;
  }

  next();
};

const validateUpdateContact = (req, res, next) => {
  const updateContactRules = Joi.object({
    name: Joi.string(),
    email: Joi.string(),
    phone: Joi.string(),
  });

  const validBodyReq = req.body.name || req.body.email || req.body.phone;

  const validationResult = updateContactRules.validate(req.body);

  if (!validBodyReq || validationResult.error) {
    const newError = new Error();
    newError.status = 400;
    newError.type = 'UpdateContact';
    throw newError;
  }

  next();
};

module.exports = {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact,
  handlerErors,
  validateCreateContact,
  validateUpdateContact,
};
