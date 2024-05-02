# first_tee_pittsburgh_notification_system

For Developers:

## Running the server locally
- In the root directory, run `npm start` to start the server

## Running the client locally
- In a new terminal window, enter the client directory with `cd client` 
- Start the client with `npm start` 

MAKE SURE YOU HAVE THE CORRECT PACKAGES INSTALLED USING `npm install`.

### If you are having issues with `npm start`, then try the following:
- Create a new branch with `git checkout -b branchname`
- delete the node modules with `rm -rf node_modules`
- delete the package-lock json file `rm -f package-lock.json`
- clean the npm cache with `npm cache clean --force`
- install the dependencies again with `npm install`
- now try `npm start`

### To run API tests 
- Run `node server/test/runTests.js` in the root directory

