
const fs = require('fs')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const webpush = require('web-push')

const app = express()
app.use(cors())
app.use(bodyParser.json())

const port = 4000

app.get('/', (req, res) => res.send('Hello World!'))

const dummyDb = { subscription: null } //dummy in memory store

const saveToDatabase = async subscription => {
  // Since this is a demo app, I am going to save this in a dummy in memory store. Do not do this in your apps.
  // Here you should be writing your db logic to save it.
  dummyDb.subscription = subscription

  //  var data = JSON.stringify(subscription)
  //  fs.appendFile('myjsonfile.json', data, 'utf8',
  // callback function
  //   function (err) {
  //    if (err) throw err;
  //    // if no error
  //   console.log("Data is appended to file successfully.")
  //});

  jsonReader("myjsonfile.json", (err, subscriptions) => {
    if (err) {
      console.log("Error reading file:", err);
      return;
    }


    console.log("====================================== subscriptions ")
    console.log(subscriptions)
    console.log("====================================== subscriptions added")
        // Append the subscriptin
        subscriptions.push(subscription)
        console.log(subscriptions)
    console.log("======================================")


    fs.writeFile("myjsonfile.json", JSON.stringify(subscriptions), err => {
      if (err) console.log("Error writing file:", err);
      console.log("Added subscription", subscription);
    });
  });

  
}

// The new /save-subscription endpoint
app.post('/save-subscription', async (req, res) => {
  const subscription = req.body
  saveToDatabase(subscription) //Method to save the subscription to Database 
  res.json({ message: 'success' })

})

const vapidKeys = {
  publicKey:
    'BIU1JFT29y0ELYvziCMbiTV_-Mn4NXimYZxcsFZpY4VZRD6HpvRSt9VnkuPmV8K3kBIkCo1Rvr132q0gpQFTBfA',
  privateKey: 'SQy3TiKZ5gInMZhuwrsXed67GXVr26FYX5L_zGGbaY4',
}

//setting our previously generated VAPID keys
webpush.setVapidDetails(
  'mailto:pradeep.kr.maharana@email.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
)

//function to send the notification to the subscribed device
const sendNotification = (subscription, dataToSend) => {
  console.log(subscription); // Print subscription 
  webpush.sendNotification(subscription, dataToSend)
}

//route to test send notification
app.get('/send-notification', (req, res) => {
  // var subscription = dummyDb.subscription //get subscription from your databse here.

  fs.readFile('myjsonfile.json', (err, jsondata) => {
    if (err) throw err;

    var subscriptions = JSON.parse(jsondata);
    for (var i = 0; i < subscriptions.length; i++) {
      const message = 'Hello World from Backend server'
      sendNotification(subscriptions[i], message)
    }
    res.json({ message: 'message sent if any ' })
  });

})

function jsonReader(filePath, cb) {
  fs.readFile(filePath, (err, fileData) => {
    if (err) {
      return cb && cb(err);
    }
    try {
      const object = JSON.parse(fileData);
      return cb && cb(null, object);
    } catch (err) {
      return cb && cb(err);
    }
  });
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`))