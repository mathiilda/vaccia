# Vaccia
Fin text hej hej


### Before setup
You need MySQL with a root user installed.

### Instructions
1. Go to <code>vaccia/sql</code> and run <code>bash mysql.bash</code>. 
This bash-script will setup the database for you. The only thing you need to do is to input your MySQL root-password.

2. Go to the root of the vaccia-folder and run <code>node index.js</code>.

3. Open you webbrowser and go to <code>http://localhost:1337/</code>.

Then you're done! :-)


### Possible issues
#### Antivirus
There's one known issue with nodemailer and antivirus programs. If you, like me, have AVG installed please open up the AVG applications and follow the instructions down below.

1. Press the <code>Menu</code>-botton in the right upper corner, then <code>Settings</code>.
2. Go to <code>Basic Protection</code> and then <code>Email Shield</code>.
3. At the <code>Email Shield</code>-page, please uncheck <code>Email Shield</code> for as long as you're going to use the application. 



#### Send emails
The emails won't send unless the server is running. 
