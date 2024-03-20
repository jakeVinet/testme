const { MongoClient } = require("mongodb");
const {v4 : uuidv4} = require('uuid');

const uri = "mongodb+srv://testUser:68VKpKYnRxxCLPmW@cluster0.mm6udhc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const express = require('express');
const bodyParser=require('body-parser');
const app = express();
const port = 3000;
var fs = require("fs");
var cookieParser = require('cookie-parser') 

app.listen(port);
console.log('Server started at http://localhost:' + port);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); 


//Default route handler (working)
app.get('/', (req, res)=>{
  const  cookies  = req.cookies;
  
  // res.send(auth);
  console.log(cookies);
  if (cookies && typeof cookies["authentication"] === "undefined"){
    fs.readFile('post.html','utf8',(err,data)=>{
      console.log(data)
      if(err){
        res.send('some err occured ',err);
      }
      res.send(data + output(""));
    })
  }
  else{
    res.send(output(`Authentication cookie exists!<br>` + cookies['authentication']));
  }

});


//register function (working)
app.post('/post/users', function(req, res) {
  const formBody= req.body;
  const client = new MongoClient(uri);

  async function run() {
    try {
      const database = client.db('CMPS415_4');
      const users = database.collection('User');
  
     
      const query = { Username: formBody['username'], Password: formBody['password'] };
  
      const user = await users.insertOne(query, function(err, res) {
        if (err) throw err;
        console.log("1 document inserted");
        db.close();
      });

      console.log(user);
      const session = uuidv4();
      res.cookie('authentication', session, {maxAge:60000});
      res.send(output("User created!"));
  
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
  }
  run().catch(console.dir);
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
          res.send(output("User not found"));
        }

        else if(user.Password === myquery['password']){
          const session = uuidv4();
          res.cookie('authentication', session, {maxAge:60000});
          res.send(output("You are logged in!"));
        }
    
      } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
      }
    }
    run().catch(console.dir);
});

//sets the navigation buttons for each page (working)
function output(message){
  return message +`<br> 
            <form action=\"/report\" method=GET> 
              <input type=submit name=submit value=ShowCookies> 
            </form> 
            <form action=\"/clearcookie/authentication\"method=GET> 
              <input type=submit name=submit value=ClearCookie> 
            </form>
            <form action=\"/\" method=GET> 
              <input type=submit name=submit value=Return> 
            </form>`;
}

// Clear a specific cookie (working)
app.get('/clearcookie/:cookiename', function (req, res) {
  res.clearCookie(req.params.cookiename); //Shortcut for setting expiration in the past
  res.send(output(`Cookie deleted: \"` + req.params.cookiename+'\"' ));
});

// Report cookies on console and browser (working)
app.get('/report', function (req, res) {
  // Cookies that have not been signed
  console.log('Cookies: ', req.cookies);

  // Cookies that have been signed
  console.log('Signed Cookies: ', req.signedCookies);

  //Send the cookies report to the browser
  mycookies=req.cookies;
  res.send(output(JSON.stringify(mycookies) + " --Done reporting <br>"));
});