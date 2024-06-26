require('dotenv').config();
var jsforce = require('jsforce');
var knock = require ('../api/knock.js');

// TODO: CREATE DOCUMENTATION FOR EACH ENV VAR & WHAT HAPPENS IF THEY ARE NOT SET
const client_id = process.env.SALESFORCE_CLIENT_ID;
const client_secret = process.env.SALESFORCE_CLIENT_SECRET;
const instance_url = process.env.SALESFORCE_INSTANCE_URL;
const access_token = process.env.SALESFORCE_ACCESS_TOKEN;
const refresh_token = process.env.SALESFORCE_REFRESH_TOKEN;

var clc = require("cli-color");

function validateEnvVariables() {
  const requiredEnvVars = ['SALESFORCE_CLIENT_ID', 'SALESFORCE_CLIENT_SECRET', 'SALESFORCE_INSTANCE_URL', 'SALESFORCE_ACCESS_TOKEN', 'SALESFORCE_REFRESH_TOKEN'];
  let isValid = true;

  requiredEnvVars.forEach(varName => {
      if (!process.env[varName]) {
          console.error(`Missing environment variable: ` + clc.redBright(varName));
          isValid = false;
      }
  });

  return isValid;
}

async function validateConnection() {
  try {
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

      await conn.query("SELECT Id FROM User LIMIT 1");
      return conn;
  } catch (err) {
    let errorMessage = (err.message || "Unknown error");
    console.error("Failed to connect to Salesforce: ", clc.redBright(errorMessage));

    knock.sendSystemAlertEmail(
      "Salesforce", 
      "Please email support & have them check the Salesforce credentials for integration@thefirstteepittsburgh.org", 
      errorMessage, 
      "N/A"
    );

    return null;
  }
}

async function testSalesforce() {
  if (!validateEnvVariables()) {
    return;
  }

  var conn = await validateConnection();
  if (!conn) {
      console.error('Invalid connection. Please check the environment variables and credentials before proceeding.');
      return;
  }

  var salesforceColor = clc.xterm(75).bgXterm(236);
  var arrow = salesforceColor(">") + "   ";

  await testContactTable(conn, salesforceColor, arrow);
  await testSessionRegistrationTable(conn, salesforceColor, arrow);
  await testCoachAssignmentTable(conn, salesforceColor, arrow);
  await testListingSessionTable(conn, salesforceColor, arrow);
}

async function testContactTable(conn, salesforceColor, arrow) {
  console.log(salesforceColor("\n>> Testing Access to Contact Table\n"));
  try {
    const result = await conn.sobject("Contact")
      .select(`Id, Name, Email, Secondary_Email__c`)
      .limit(1)
      .execute();

    console.log(arrow + "Sample Contact Name: ", clc.bold(result[0].Name));
    console.log(arrow + "Sample Contact Email: ", clc.bold(result[0].Email));
  } catch (err) {
    console.error(arrow + "Failed to query Contact Table:", clc.redBright(err.errorCode));
    
    const detailedError = {
      message: err.message,
      errorCode: err.errorCode,
      name: err.name,
      stack: err.stack,
    };

    knock.sendSystemAlertEmail(
      "Salesforce",
      "Forward this email to support & have them check Salesforce to see if integration@thefirstteepittsburgh.org can access the Contact table.",
      err.errorCode,
      JSON.stringify(detailedError, null, 2)
    );
  }
}

async function testSessionRegistrationTable(conn, salesforceColor, arrow) {
  console.log(salesforceColor("\n>> Testing Access to Session Registration Table\n"));
  try {
    const result = await conn.sobject("Session_Registration__c")
      .select(`Id, Name, Status__c, Contact__c, Contact__r.Name, Contact__r.Primary_Contact_s_Email__c, Contact__r.Emergency_Contact_Number__c, Contact__r.Contact_Type__c, Contact__r.Participation_Status__c`)
      .limit(1)
      .execute();

    console.log(arrow + "Sample Session Registration Name: ", clc.bold(result[0].Name));
    console.log(arrow + "Sample Session Registration Contact: ", clc.bold(result[0].Contact__c));
  } catch (err) {
    console.error(arrow + "Failed to query Session Registration Table:", clc.redBright(err.errorCode));
    
    const detailedError = {
      message: err.message,
      errorCode: err.errorCode,
      name: err.name,
      stack: err.stack,
    };

    knock.sendSystemAlertEmail(
      "Salesforce",
      "Forward this email to support & have them check Salesforce to see if integration@thefirstteepittsburgh.org can access the Session_Registration__c table.",
      err.errorCode,
      JSON.stringify(detailedError, null, 2)
    );
  }
}

async function testCoachAssignmentTable(conn, salesforceColor, arrow) {
  console.log(salesforceColor("\n>> Testing Access to Coach Assignment Table\n"));
  try {
    const result = await conn.sobject("Coach_Assignment__c")
      .select(`Id, Coach__c, Coach__r.Name, Name, Listing_Session__c,Session_End_Date__c, Session_Start_Date__c, Listing_Session__r.Id, Listing_Session__r.Name, Coach__r.Email, Coach__r.MobilePhone, Coach__r.Contact_Type__c`)
      .limit(1)
      .execute();

    console.log(arrow + "Sample Coach Assignment Name: ", clc.bold(result[0].Name));
    console.log(arrow + "Sample Coach Assignment Coach: ", clc.bold(result[0].Coach__c));
  } catch (err) {
    console.error(arrow + "Failed to query Coach Assignment Table:", clc.redBright(err.errorCode));
    
    const detailedError = {
      message: err.message,
      errorCode: err.errorCode,
      name: err.name,
      stack: err.stack,
    };

    knock.sendSystemAlertEmail(
      "Salesforce",
      "Forward this email to support & have them check Salesforce to see if integration@thefirstteepittsburgh.org can access the Coach_Assignment__c table.",
      err.errorCode,
      JSON.stringify(detailedError, null, 2)
    );
  }
}

async function testListingSessionTable(conn, salesforceColor, arrow) {
  console.log(salesforceColor("\n>> Testing Access to Listing Session Table\n"));
  try {
    const result = await conn.sobject("Listing_Session__c")
      .select("Id, Total_Registrations__c")
      .limit(1)
      .execute();

    console.log(arrow + "Sample Listing Session ID: ", clc.bold(result[0].Id));
  } catch (err) {
    console.error(arrow + "Failed to query Listing Session Table:", clc.redBright(err.errorCode));
    
    const detailedError = {
      message: err.message,
      errorCode: err.errorCode,
      name: err.name,
      stack: err.stack,
    };

    knock.sendSystemAlertEmail(
      "Salesforce",
      "Forward this email to support & have them check Salesforce to see if integration@thefirstteepittsburgh.org can access the Listing_Session__c table.",
      err.errorCode,
      JSON.stringify(detailedError, null, 2)
    );
  }
}

module.exports = { testSalesforce };
