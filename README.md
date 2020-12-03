# COE457-Map-Mongo-MQTT
 Express, MQTT, Cookies and MongoDB (HW3 for COE457)

Description of program:<br/>
When the user opens the application in the browser, a session is created and the
application connects to the MQTT broker.<br/>
o A new user creates an account using a registration form to be able to use the
web application.<br/>
o If users already have an account, they log in using a login form.
o Upon successful registration or login, the user is redirected to the web page that
has the interactive map.<br/>
o When the user is logged in, the navigation bar on the page shows the user’s
name and option to log out.<br/>
o If this is not the first time the user uses the application, the web page displays
“Welcome back <user’s name>!” and the last time the user visited the page.<br/>
o When the user sets the destination on the map, it publishes messages of the
current and destination locations’ coordinates to the MQTT broker.<br/>
o The moto device is subscribed to the same topic and uses the messages
published to update the arrow’s direction.<br/>
o The user’s details and locations’ coordinates should be saved in the MongoDB
database to keep a record of the user’s routes.<br/>
o If the user is not logged in, any attempt to access inner pages (such as the map)
displays an error message of unauthorized access and a link to the login page.<br/>
o If the user checked the “Remember me” option in the login form and only closed
the browser without logging out, the user will not need to login again to access
the application.<br/>
o When the user logs out, the session is deleted and the cookies should be cleared. <br/>
