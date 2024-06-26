var salesforce = require('./api/salesforce');
var knock = require('./api/knock');


const express = require("express");
const path = require('path');

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
  
  console.log("Email:", coachEmail);

  if (!coachEmail.endsWith('@thefirstteepittsburgh.org')) {
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

app.post("/getStatuses", (req, res) => {
  const userIds = req.body.userIds;

  knock.getStatuses(userIds, res);
});

app.post("/sendmessage", (req, res) => {
  const body = req.body;
  const subject = body.subject;
  const msg = body.message;
  const coach = body.coach;
  const sessionId = body.sessionId;

  salesforce.sessionNumbers(sessionId, knock.sendSMS, subject, msg, coach);
  salesforce.sessionEmails(sessionId, knock.sendEmail, subject, msg, coach);
  
  salesforce.coachNumbers(sessionId, knock.sendSMS, subject, msg, coach);
  salesforce.coachEmails(sessionId, knock.sendEmail, subject, msg, coach);

  res.status(200).send('Status: OK')
})

app.use(express.static(path.resolve(__dirname, '../client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
