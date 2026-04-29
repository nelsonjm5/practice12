Practice 11 Deployment

Platform Used:
Render

Deployment Process:
For this assignment, I deployed my Node.js/Express application using Render. I first combined my front-end files from the Project3Dark folder with the Express server files from my Practice10 project. The final project folder included index.html, styles.css, dashboard_project.js, server.js, package.json, and package-lock.json.

Before deploying, I made sure the server.js file used process.env.PORT so the app could run on Render's assigned port. I also made sure package.json included a start script:

"start": "node server.js"

After confirming the app worked locally with npm install and npm start, I uploaded the project files to a GitHub repository. Then I created a new Web Service on Render, connected the GitHub repository, and used the following settings:

Build Command: npm install
Start Command: npm start
Instance Type: Free

Once Render finished building and deploying the app, I opened the live Render URL in my browser to verify that the application was running online.

Issues Encountered:
I originally tried to deploy the application using AWS Elastic Beanstalk. I installed the AWS CLI and EB CLI, created an IAM user, and attempted to run eb init and eb create. However, AWS kept returning permission errors, including missing permission for elasticbeanstalk:CreateStorageLocation. Even after attaching Elastic Beanstalk and administrator permissions, the AWS account still appeared to have restrictions that prevented Elastic Beanstalk from creating the needed resources.

How I Addressed the Issues:
Since the assignment allowed alternative deployment platforms, I switched from AWS Elastic Beanstalk to Render. Render was simpler for this project because it connected directly to my GitHub repository and only required the build command npm install and the start command npm start. This allowed me to successfully deploy the application and verify it using the live Render URL.