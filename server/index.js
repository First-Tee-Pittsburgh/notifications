// server/index.js
// import { getCoachId, sessionParticipants, coachSessions } from "./salesforce/salesforce.js";
var salesforce = require('./salesforce/salesforce');
var twilio = require('./twilio/twilio');
var sendgrid = require('./sendgrid/sendgrid');

const express = require("express");
const path = require('path');

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());

app.get("/api", (req, res) => {
    res.json({ message: "Hello from server!" });
});

// take the email of the coach and check if it's in the system 
app.post("/checklogin",(req,res) => {
    res.json({ message: "Hello from server!" });
});

// get all the sessions for a coach 
app.get("/coachId",(req,res) => {
    // retrieve coach's email from the request query parameters 
    const coachEmail = req.query.id;
    // get coach id from email 
    tempEmail = 'pcoultas@firstteepittsburgh.org';
    // const coachId = '0033600001KJ05SAAT'
    // get coach sessions from id 
    salesforce.getCoachId(tempEmail,res);
    // res.json(sessions);
});

// get all the sessions for a coach 
app.get("/sessions",(req,res) => {
    // retrieve coach's email from the request query parameters 
    const coachEmail = req.query.session;
    console.log(coachEmail);
    console.log("this should be the coach id");
    // get coach id from email 
    // const coachId = '0033600001KJ05SAAT'
    // get coach sessions from id 
    salesforce.coachSessions(coachEmail,res);
    // res.json(sessions);
});

// get all the participants for a session 
app.get("/participants",(req,res) => {
    const sessionId = req.query.participant;
    // const sessionId = 'a0H1R000013eaoxUAA';
    salesforce.sessionParticipants(sessionId,res);
    // res.json({ message: "Hello from server!" });
});

// send the message after receiving list of phone numbers and emails 
app.post("/sendmessage", (req,res) => {
    // getting the body of post request 
    const body = req.body;
    console.log(body);
    const sendCoach = body.sendCoach;
    const sendParticipant = body.sendParticipant;
    const sendAll = body.sendAll;
    const subject = body.subject;
    const msg = body.message;
    const coachId = body.coachId;

    // decide if we get contact info from front-end or do another query here in backend 
    
    // use the salesforce functions to send notification instead 
    // need to get the coachId sent from front-end
    // const coachId = '0033600001KJ05SAAT'

    salesforce.sessionNumbers(coachId, twilio.sendMessage, msg)
    salesforce.sessionEmails(coachId, sendgrid.sendEmail, msg, subject)

    res.json({ message: "Message Successfully Sent" });
})

app.use(express.static(path.resolve(__dirname, '../client/build')));

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});