const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/documents.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = '/Users/rebeccalai/token-doc.json';
const CREDENTIALS_PATH = '/Users/rebeccalai/credentials-doc.json';

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Prints the title of a sample doc:
 * https://docs.google.com/document/d/195j9eDD3ccgjQRttHhJPymLJUCOUjs-jmwTrekvdjFE/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth 2.0 client.
 */
async function printDocTitle(auth) {
  const docs = google.docs({version: 'v1', auth});
  const res = await docs.documents.get({
    documentId: '1SyaV7QdTEeqzMjTpiuPlljwUtegbK610B4O2r7SO0sU',
  });

  let output = [];
  let list = [];
  let pushtolist = false;
  let innerlist = [];
  res.data.body.content.forEach(function(d){

    if (d.paragraph && d.paragraph.elements[0].textRun) {

        let arr = d.paragraph.elements.map(a => a.textRun.content);
        let t = arr.join("");
        t = t.replace("\n", "").trim();
        
        if (t != "") {
            let type, content;
            if (t.includes(":")) {
                type = t.split(":")[0].trim();
                content = t.split(":")[1].trim();
            } else {
                type = "text";
                content = t;
            }

            if (type == "start" && content == "list") {
                pushtolist = true;
            } else if (type == "end" && content == "list") {
                output.push(list);
                list = [];
                pushtolist = false;
            } else if (pushtolist) {

                innerlist.push({
                    type: type,
                    content: content
                });

                if (type == "text") {
                    list.push(innerlist);
                    innerlist = [];
                }
                
            } else {
                output.push({
                    type: type,
                    content: content
                });
            }

        }
    }
    
  })

  await fs.writeFile("doc.json", JSON.stringify(output, null, 2));

}

authorize().then(printDocTitle).catch(console.error);