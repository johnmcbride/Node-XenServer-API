# Access XenServer API with NodeJS and RPC

## Overview

This is a node sample that shows how to access the XenServer API over RPC.

We show how to make the initial calls via a RPC npm package and then parse the XML.

### Getting Started

- Clone this repo (git clone https://github.com/johnmcbride/Node-XenServer-API.git)
- Change into the directory where the project was cloned to.
- Execute "yarn" to install the dependencies
  - if you are using npm you should run the following command
    npm install
- Update the package.json file with you XenServer address, username and password.
- run node index.js

### NPM packages

[xmlrpc-lite](https://www.npmjs.com/package/xmlrpc-lite)

[fast-xml-parser](https://www.npmjs.com/package/fast-xml-parser)

[xpath](https://www.npmjs.com/package/xpath) 

[xmldom](https://www.npmjs.com/package/xmldom)
