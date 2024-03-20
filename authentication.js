const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://testUser:68VKpKYnRxxCLPmW@cluster0.mm6udhc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const express = require('express');
const bodyParser=require('body-parser');
const app = express();
const port = 3000;
var fs = require("fs");
var cookieParser = require('cookie-parser') //needed for cookies

app.listen(port);
console.log('Server started at http://localhost:' + port);

// Middleware to handle jsons and URL encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); //needed for cookies

// Routes go here

//Default route handler
app.get('/', function(req, res, next){
  // mycookies=req.cookies;
  const {isAuthenticated} = req.signedCookies;
  
  console.log(isAuthenticated);
  if (isAuthenticated){
    res.send("isauthenticated == true")
  }
  else{
   res.send("isauthenticated == false")
  }

});


//register function
app.post('/post/users', function(req, res) {
  const formBody= req.body;
  var outstring='';
  for(var key in formBody) { 
    outstring += "--" + key + ">" + formBody.key; 
  }

  res.send('The formBody is: ' + JSON.stringify(formBody) + '<br>The outstring is: ' + outstring);
});

//login function (working)
app.get('/get/users', function(req,res){
    const myquery= req.query;
  
    const client = new MongoClient(uri);
    const searchKey = "{ username: '" + myquery['username'] + "' }";
    console.log("Looking for: " + searchKey);
    
    async function run() {
      try {
        const database = client.db('CMPS415_4');
        const users = database.collection('User');
    
       
        const query = { Username: myquery['username'] };
    
        const user = await users.findOne(query);
        console.log(user);
        if(user === null){
          res.send("User not found<br> <form action=\"/\" method=GET> <input type=submit name=submit value=Return> </form>");
        }

        else if(user.Password === myquery['password']){
          res.cookie('authentication', true, {maxAge:60000})
          res.send('You are logged in!<br> <form action=\"/showcookie\" method=GET> <input type=submit name=submit value=ShowCookies> </form> <br> <form action=\"/clearcookie/authentication\"method=GET> <input type=submit name=submit value=ClearCookie> </form>');
        }
    
      } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
      }
    }
    run().catch(console.dir);
});

// Using a local file to generate a web form (like post.html)
app.get("/getfile",function(req,res) {
  fs.readFile('post.html','utf8',(err,data)=>{
    console.log(data)
    if(err){
      res.send('some err occured ',err);
    }
    res.send(data);
  })
});



// Write data obtained from a GET request into a file

app.get('/wfile', function(req, res) {
  const myquery = req.query;
  
  var outstring = '';
  for(var key in myquery) { 
    outstring += "--" + key + ">" + myquery[key]; 
  }
  fs.appendFile("mydata.txt", outstring+'\n', (err) => {
    if (err)
      console.log(err);
    else {
      console.log("File written successfully\n");
      console.log("Contents of file now:\n");
      console.log(fs.readFileSync("mydata.txt", "utf8"));
    }
  });
 
  res.send(outstring);
});


// Setting cookies
app.get('/setcookie', function (req, res) {
    console.log('setcookie');
    res.cookie('authentication', true) //Sets name = Abcd, no expiration

  
    res.send('cookies set ');  // complete sending
  });
  
  // Access and show cookies
  app.get('/showcookie', function (req, res) {
    mycookies=req.cookies;
    res.send(mycookies); //Send the cookies
  });
  
  // Clear a specific cookie (sent as parameter)
  app.get('/clearcookie/:cookiename', function (req, res) {
    res.clearCookie(req.params.cookiename); //Shortcut for setting expiration in the past
    res.send('Cookie deleted ' + req.params.cookiename +"<br> <form action=\"/\" method=GET> <input type=submit name=submit value=Return> </form>");
  });
  
  // Report cookies on console and browser
  app.get('/report', function (req, res) {
    // Cookies that have not been signed
    console.log('Cookies: ', req.cookies);
  
    // Cookies that have been signed
    console.log('Signed Cookies: ', req.signedCookies);
  
    //Send the cookies report to the browser
    mycookies=req.cookies;
    res.send(JSON.stringify(mycookies) + " --Done reporting");
  });