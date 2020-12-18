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
    : `Sorry contact fith 'id: ${contactId}' is not found`;
}

async function removeContact(contactId) {
  const contacts = await listContacts();

  const removedContact = contacts.find(contact => contact.id === contactId);

  if (removedContact) {
    const newContacts = contacts.filter(contact => contact.id !== contactId);
    const newContactsJson = JSON.stringify(newContacts);

    fsPromises.writeFile(contactsPath, newContactsJson);
  }

  return removedContact
    ? `Contact: ${JSON.stringify(removedContact)}' was successfully removed!`
    : `Sorry contact fith 'id: ${contactId}' is not found`;
}

async function addContact(name, email, phone) {
  const contacts = await listContacts();

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

  newContacts.sort((a, b) => a.id - b.id);

  const newContactsJson = JSON.stringify(newContacts);

  fsPromises.writeFile(contactsPath, newContactsJson);

  return `Contact: ${JSON.stringify(contact)} was successfully added!`;
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
};
