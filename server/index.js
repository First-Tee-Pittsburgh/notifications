var salesforce = require('./api/salesforce');

const express = require("express");
const path = require('path');
const { sendSMS, sendEmail } = require('./api/knock');

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());

app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.post("/checklogin", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.post("/coachId", (req, res) => {
  let coachEmail = req.body.email;
  const testingEmails = [
    'wsquibb@andrew.cmu.edu',
    'bzchen@andrew.cmu.edu',
    'ypagarwa@andrew.cmu.edu'
  ];

  if (testingEmails.includes(coachEmail)) {
    coachEmail = 'pcoultas@thefirstteepittsburgh.org';
  }
  console.log("Email:", coachEmail);

  if (!coachEmail.endsWith('@thefirstteepittsburgh.org')) {
    console.log('Unauthorized user');
    res.status(401).send('Unauthorized user');
  }
  else {
    salesforce.getCoachId(coachEmail, res);
  }
});

app.get("/sessions", (req, res) => {
  const coachEmail = req.query.session;
  salesforce.coachSessions(coachEmail, res);
});

app.get("/participants", (req, res) => {
  const sessionId = req.query.participant;
  salesforce.sessionParticipants(sessionId, res);
});

app.get("/coaches", (req, res) => {
  const sessionId = req.query.session;
  salesforce.sessionCoaches(sessionId, res);
});

app.post("/sendmessage", (req, res) => {
  const body = req.body;
  const subject = body.subject;
  const msg = body.message;
  const coachId = body.coachId;

  salesforce.sessionNumbers(coachId, sendSMS, msg);
  salesforce.sessionEmails(coachId, sendEmail, msg, subject)

  salesforce.coachNumbers(coachId, sendSMS, msg);
  salesforce.coachEmails(coachId, sendEmail, msg, subject)

  res.status(200).send('Status: OK')
})

app.use(express.static(path.resolve(__dirname, '../client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
