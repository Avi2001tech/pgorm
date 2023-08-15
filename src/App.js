const express = require('express');
const bodyParser = require('body-parser');
const { createConnection } = require('typeorm');
const { Contact } = require('./src/entities/Contact');
const { SpamNumber } = require('./src/entities/SpamNumber');

const app = express();
const port = 3000;

app.use(bodyParser.json());

createConnection().then(async (connection) => {
  // Get all contacts with their associated spam numbers
  app.get('/contacts', async (req, res) => {
    try {
      const contacts = await connection.manager.find(Contact, {
        relations: ['spamNumbers'],
      });
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch contacts.' });
    }
  });

  // Search for contacts by name
  app.get('/search/name/:query', async (req, res) => {
    const { query } = req.params;
    try {
      const contacts = await connection.manager.query(`
        SELECT c.id, c.name, c.email, c.phoneNumber, s.id AS spamId
        FROM contacts AS c
        LEFT JOIN spam_numbers AS s ON c.phoneNumber = s.phoneNumber
        WHERE c.name LIKE $1 OR c.name LIKE $2
          AND c.name NOT LIKE $3;
      `, [`%${query}%`, `%${query}`, `${query}%`]);
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to perform the search.' });
    }
  });

  // Search for contacts by phone number
  app.get('/search/phone/:query', async (req, res) => {
    const { query } = req.params;
    try {
      const contacts = await connection.manager.query(`
        SELECT c.id, c.name, c.email, c.phoneNumber, s.id AS spamId
        FROM contacts AS c
        LEFT JOIN spam_numbers AS s ON c.phoneNumber = s.phoneNumber
        WHERE c.phoneNumber = $1;
      `, [query]);
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to perform the search.' });
    }
  });

  // Get contact details by ID
  app.get('/contact/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const contact = await connection.manager.findOne(Contact, id, {
        relations: ['spamNumbers'],
      });
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found.' });
      }
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch contact details.' });
    }
  });

  // Mark a phone number as spam
  app.post('/spam', async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }
    try {
      const spamNumber = new SpamNumber();
      spamNumber.phoneNumber = phoneNumber;
      await connection.manager.save(spamNumber);
      res.json({ message: 'Number marked as spam successfully.' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to mark the number as spam.' });
    }
  });

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});

