Practice 12 Deployment Documentation

Platform Used:
Render

How I Modified the Code:
I modified my Node.js/Express application to use an environment variable named GREETING. In server.js, I added a greeting variable that reads from process.env.GREETING. If the GREETING variable is not set, the app uses a default message instead.

The main code change was:

const greeting = process.env.GREETING || "Hello from your deployed app!";

Then I updated the /api/message route so it returns that greeting value as JSON:

app.get("/api/message", (req, res) => {
  res.json({ message: greeting });
});

Which Platform I Used:
I used Render for deployment. I chose Render because my AWS Elastic Beanstalk setup had permission issues, and the assignment allowed Render as an alternative platform.

How I Set the Environment Variable:
In Render, I opened my practice12 Web Service and went to the Environment section. I added a new environment variable with the following values:

Key: GREETING
Value: Hello from Render!

After saving the environment variable, I redeployed the application. Then I opened the /api/message route in my browser to make sure the JSON response reflected the environment variable.

Issues Encountered:
The first issue was with AWS Elastic Beanstalk. My AWS IAM user was denied permission to create some Elastic Beanstalk resources, so I switched to Render. I also briefly saw a Cannot GET / message because the main route was not the required test route. I fixed this by going directly to /api/message, which showed the correct JSON response.
