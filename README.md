# Entertainment-recommendation-system

<h1  align="center">
Project Group 25
</h1>

**Note**:  If for some reason if the server/app is not working kindly make sure your ip is whitelisted in mongo atlas. Follow this tutorial to whitelist your IP address => https://docs.atlas.mongodb.com/security/ip-access-list/

If you prefer video watch this => https://www.youtube.com/watch?v=leNNivaQbDY


## Softwares Required
1.  **Node version 14/14+**
2.  **Npm**
3.  **Nodemon**  
  
## VS Code Extension 
1.  **ESLint**
2.  **Prettier**


## 🚀 Quick start
1.  **Navigate to project directory**  
2. **Run ```npm install -g nodemon``` to install nodemon**
3.  **Run ```npm install``` command**
4.  **Run ```npm start``` command to run the project**

Your site is now running at `http://localhost:3000`!

**Note**: Node version should be 14 or 14+
## Linting

1. Run ```npm lint:js``` to check the linter error
2. Run ```npm lint:js:fix``` to check the linter error and fix them automatically.
 
## 🧐 What's inside?

A quick look at the top-level files and directories you'll see in a  project.

├── .husky

├── api

├── config

├── data

├── node_modules

├── public

├── routes

├── utils

├── views

├── .eslintignore

├── .eslintrc.json

├── .gitignore

├── .prettierrc

├── app.js

├── package-lock.json

├── package.json

└── README.md

  
1.  **`.husky`**: This directory contains all of the setup for pre commit script.

2.  **`/api`**: This directory contains all of the third party api configuration.

3.  **`/config`**: This directory contains all of the configuration file such as db configuration, api keys. 
**Note** If taking pull directly from github then need to add two files appSettings.json and mongoSettings.json which contains all the sensitive information in config directory.

4.  **`/data`**: This directory contains all of the data base layer code that directly interacts to mongo atlas.

5.  **`/node_modules`**: This directory contains all of the modules of code that your project depends on (npm packages) are automatically installed.

6.  **`/public`**: This directory contains css, js and images files.

7.  **`/routes`**: This directory contains routing of the entire project.

8.  **`/utils`**: This directory contains helper function which is used across the project.

9.  **`/views`**: This directory contains all the front end code.

10.  **`.eslintignore`**: This file tells eslint which files it should not track.
 
11. **`.eslintrc.json`**: This file contains all the eslint configuration. 
 
12.  **`.gitignore`**: This file tells git which files it should not track / not maintain a version history for. 

13.  **`.prettierrc`**: This is a configuration file for [Prettier](https://prettier.io/). Prettier is a tool to help keep the formatting of your code consistent.

14.  **`app.js`**: This is entry point file which contains all the server configuration. 

15.  **`package-lock.json`** (See `package.json` below, first). This is an automatically generated file based on the exact versions of your npm dependencies that were installed for your project. **(You won’t change this file directly).**

16.  **`package.json`**: A manifest file for Node.js projects, which includes things like metadata (the project’s name, author, etc). This manifest is how npm knows which packages to install for your project.

17.  **`README.md`**: A text file containing useful reference information about your project.
