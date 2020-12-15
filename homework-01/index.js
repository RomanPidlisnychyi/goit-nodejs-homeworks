const argv = require('yargs').argv;
const contactServices = require('./contacts');

function invokeAction({ action, id, name, email, phone }) {
  switch (action) {
    case 'list':
      contactServices.listContacts().then(console.table);
      break;

    case 'get':
      contactServices.getContactById(id).then(console.log);
      break;

    case 'add':
      contactServices.addContact(name, email, phone);
      break;

    case 'remove':
      contactServices.removeContact(id);
      break;

    default:
      console.warn('\x1B[31m Unknown action type!');
  }
}

invokeAction(argv);
