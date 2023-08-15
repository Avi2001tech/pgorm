import { createConnection } from 'typeorm';
import { Contact } from './src/entities/Contact';
import * as faker from 'faker'; // Make sure you import faker

async function populateDatabase(numContacts: number) {
  const connection = await createConnection();

  for (let i = 0; i < numContacts; i++) {
    const contact = new Contact();
    contact.name = faker.name.findName();
    contact.email = faker.internet.email();
    contact.phoneNumber = faker.phone.phoneNumberFormat();

    try {
      await connection.manager.save(contact);
    } catch (error) {
      console.error('Error inserting contact:', error);
    }
  }

  console.log(`${numContacts} contacts inserted into the database.`);
  await connection.close();
}

const numContactsToGenerate = 50;
populateDatabase(numContactsToGenerate);
