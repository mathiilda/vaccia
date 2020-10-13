# Vaccia
Vaccia is a webapplication that helps you keep track of you and your family's (including pets) vaccinations. You can also add you booked vaccination appointments and the application will automaticly send you reminders 3 days before the appointment. 

### Before setup
You need MySQL with a root user installed.

<hr>

### Instructions
1. Add the .env file (sent to you by email) to the root of the <code>vaccia</code>-folder.

2. Go to <code>vaccia/sql</code> and run <code>bash mysql.bash</code>. 
This bash-script will setup the database for you. The only thing you need to do is to input your MySQL root-password.

3. Go to the root of the vaccia-folder and run <code>node index.js</code> to start the server.

4. Open you webbrowser and go to <code>http://localhost:1337/</code>.

Then you're done! :-)

<hr>

### Possible issues
#### Antivirus software
There's one known issue with the npm-module nodemailer and some antivirus softwares. If you, like me, have AVG installed please open up the AVG application and follow the instructions down below. The process is probably similar for other antivirus softwares.

1. Press the <code>Menu</code>-botton in the right upper corner, then <code>Settings</code>.

2. Go to <code>Basic Protection</code> and then <code>Email Shield</code>.

3. At the <code>Email Shield</code>-page, please uncheck <code>Email Shield</code> for as long as you're going to use the application.

The error-message looks like this: <code>UnhandledPromiseRejectionWarning: Error: self signed certificate in certificate chain</code>.

#### Sending emails
The emails won't send unless the server is running. 
