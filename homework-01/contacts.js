const fs = require('fs');
const { promises: fsPromises } = fs;
const path = require('path');

const contactsPath = path.join(__dirname, './db/contacts.json');

async function listContacts() {
  const data = await fsPromises.readFile(contactsPath, 'utf-8');
  return JSON.parse(data);
}

async function getContactById(contactId) {
  const contacts = await listContacts();

  const findedContactById = contacts.find(contact => contact.id === contactId);

  return findedContactById
    ? findedContactById
    : `Sorry contact fith 'id: ${contactId}' not found`;
}

async function removeContact(contactId) {
  const contacts = await listContacts();

  const newContacts = contacts.filter(contact => contact.id !== contactId);
  const newContactsJson = JSON.stringify(newContacts);

  fsPromises.writeFile(contactsPath, newContactsJson);
}

async function addContact(name, email, phone) {
  const contacts = await listContacts();

  contacts.sort((a, b) => a.id - b.id);

  const contact = {
    name,
    email,
    phone,
    id: contacts.reduce((acc, contact) => {
      if (acc === contact.id) {
        return (acc += 1);
      }
      return acc;
    }, 1),
  };

  const newContacts = [...contacts, contact];
  const newContactsJson = JSON.stringify(newContacts);

  fsPromises.writeFile(contactsPath, newContactsJson);
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
};
