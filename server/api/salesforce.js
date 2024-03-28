require('dotenv').config();

const client_id = process.env.SALESFORCE_CLIENT_ID;
const client_secret = process.env.SALESFORCE_CLIENT_SECRET;
const instance_url = process.env.SALESFORCE_INSTANCE_URL;
const access_token = process.env.SALESFORCE_ACCESS_TOKEN;
const refresh_token = process.env.SALESFORCE_REFRESH_TOKEN;

var jsforce = require('jsforce');

var oauth2 = new jsforce.OAuth2({
  clientId: client_id,
  clientSecret: client_secret,
  redirectUri: "/oauth2/auth"
});

var conn = new jsforce.Connection({
  oauth2: oauth2,
  instanceUrl: instance_url,
  accessToken: access_token,
  refreshToken: refresh_token,
  version: '52.0'
});

conn.on('refresh', function (accessToken, res) {
  console.log('Access Token Refreshed');
});

async function getCoachId(email, res) {
  conn.sobject("Contact")
    .select(`Id, Name, Email`)
    .where({
      Email: email,
      Contact_Type__c: 'Coach'
    })
    .execute(function (err, records) {
      if (err) { return console.error(err); }
      var participants = [];
      for (var record of records) {
        participants.push({
          id: record.Id,
        });
      }
      if (participants.length !== 0) {
        res.send(JSON.stringify(participants[0].id));
      } else {
        res.send(JSON.stringify("None"));
      }
    });
}

function sessionParticipants(id, res) {
  conn.sobject("Session_Registration__c")
    .select(`Id, Name, Status__c, Contact__c, Contact__r.Name, Contact__r.Primary_Contact_s_Email__c, Contact__r.Emergency_Contact_Number__c, Contact__r.Contact_Type__c, Contact__r.Participation_Status__c`)
    .where({
      Listing_Session__c: id,
      Status__c: 'Registered'
    })
    .execute(function (err, records) {
      if (err) { return console.error(err); }
      var participants = [];
      for (var record of records) {
        participants.push({
          id: record.Id,
          name: record.Name,
          contact_name: record.Contact__r.Name,
          type: record.Contact__r.Contact_Type__c,
          primary_contact_phone: record.Contact__r.Emergency_Contact_Number__c,
          primary_contact_email: record.Contact__r.Primary_Contact_s_Email__c,
          status: record.Status__c
        });
      }
      res.send(participants);
    });
}

function sessionCoaches(id, res) {
  conn.sobject("Coach_Assignment__c")
    .select(`Id, Coach__c, Coach__r.Name, Name, Listing_Session__c,Session_End_Date__c, Session_Start_Date__c, Listing_Session__r.Id, Listing_Session__r.Name, Coach__r.Email, Coach__r.MobilePhone, Coach__r.Contact_Type__c`)
    .execute(function (err, records) {
      if (err) { return console.error(err); }
      var coaches = [];
      for (var record of records) {
        if (record.Listing_Session__r.Id === id) {
          coaches.push({
            id: record.Id,
            name: record.Coach__r.Name,
            email: record.Coach__r.Name,
            phone: record.Coach__r.MobilePhone
          });
        }
      }
      res.send(coaches);
    });
}

function coachSessions(id, res) {
  conn.sobject("Coach_Assignment__c")
    .select(`Id, Coach__c, Coach__r.Name, Name, Listing_Session__c,Session_End_Date__c, Session_Start_Date__c,Listing_Session__r.Name`)
    .where({
      Coach__c: id,
      Session_Start_Date__c: { $lt: jsforce.Date.TODAY },
      Session_End_Date__c: { $gte: jsforce.Date.TODAY }
    })
    .execute(function (err, records) {
      if (err) { return console.error(err); }
      var sessions = [];
      for (var record of records) {
        sessions.push({
          id: record.Listing_Session__c,
          coach_assignment_name: record.Name,
          start_date: record.Session_Start_Date__c,
          end_date: record.Session_End_Date__c,
          session_name: record.Listing_Session__r.Name
        });
      }
      res.send(sessions);
    });
}

function sessionNumbers(id, res, msg) {
  conn.sobject("Session_Registration__c")
    .select(`Id, Contact__r.Emergency_Contact_Number__c, Contact__r.Contact_Type__c`)
    .where({
      Listing_Session__c: id,
      Status__c: 'Registered'
    })
    .execute(function (err, records) {
      if (err) { return console.error(err); }
      var participants = [];
      for (var record of records) {
        if (record.Contact__r.Contact_Type__c == 'Participant') {
          participants.push(
            record.Contact__r.Emergency_Contact_Number__c
          );
        }
      }

      let unique = [];
      participants.forEach(element => {
        if (!unique.includes(element)) {
          unique.push(element);
        }
      });

      unique = unique.filter(e => (e !== null));

      let final = [];
      unique.forEach(element => {
        const digits = element.replace(/\D/g, '');

        if (digits.length === 10) {
          const formattedNumber = `+1${digits}`;

          final.push(formattedNumber);
        }
      });

      if (final.length !== 0) {
        final.forEach(phone => {
          res(phone, msg);
        })
      }
    });
}

function coachNumbers(id, res, msg) {
  conn.sobject("Coach_Assignment__c")
    .select(`Id, Coach__r.MobilePhone, Listing_Session__r.Id`)
    .execute(function (err, records) {
      if (err) { return console.error(err); }
      var numbers = [];
      for (var record of records) {
        if (record.Listing_Session__r.Id === id) {
          numbers.push(
            record.Coach__r.MobilePhone
          );
        }
      }

      let unique = [];

      numbers.forEach(element => {
        if (!unique.includes(element)) {
          unique.push(element);
        }
      });

      unique = unique.filter(e => (e !== null));

      let final = [];
      unique.forEach(element => {
        const digits = element.replace(/\D/g, '');

        if (digits.length === 10) {
          const formattedNumber = `+1${digits}`;

          final.push(formattedNumber);
        }
      });

      if (final.length !== 0) {
        final.forEach(phone => {
          res(phone, msg);
        })
      }
    });
}

function sessionEmails(id, res, msg, subject) {
  conn.sobject("Session_Registration__c")
    .select(`Id, Contact__r.Primary_Contact_s_Email__c, Contact__r.Emergency_Contact_Number__c, Contact__r.Contact_Type__c`)
    .where({
      Listing_Session__c: id,
      Status__c: 'Registered'
    })
    .execute(function (err, records) {
      if (err) { return console.error(err); }
      var participants = [];
      for (var record of records) {
        var stripped = record.Contact__r.Emergency_Contact_Number__c.replace(/\D/g, '');
        if (record.Contact__r.Contact_Type__c == 'Participant' && !(/^\d{10}$/.test(stripped))) {
          participants.push(
            record.Contact__r.Primary_Contact_s_Email__c
          );
        }
      }

      let unique = [];

      participants.forEach(email => {
        if (!unique.includes(email)) {
          unique.push(email);
        }
      });
      
      if (unique.length !== 0) {
        console.log("HI");
        unique.forEach(email => {
          res(email, subject, msg);
        })
      }
    });
}

function coachEmails(id, res, msg, subject) {
  conn.sobject("Coach_Assignment__c")
    .select(`Id, Coach__r.Email, Listing_Session__r.Id`)
    .execute(function (err, records) {
      if (err) { return console.error(err); }
      var emails = [];
      for (var record of records) {
        if (record.Listing_Session__r.Id == id) {
          emails.push(
            record.Coach__r.Email
          );
        }
      }

      let unique = [];

      emails.forEach(email => {
        if (!unique.includes(email)) {
          unique.push(email);
        }
      });

      if (unique.length !== 0) {
        unique.forEach(email => {
          res(email, subject, msg);
        })
      }
    });
}

module.exports = { getCoachId, sessionParticipants, sessionCoaches, coachSessions, sessionNumbers, sessionEmails, coachNumbers, coachEmails };