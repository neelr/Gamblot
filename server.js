require('dotenv').config()
const express = require("express");
const bodyparse = require("body-parser")
const next = require("next");
const dev = process.env.NODE_ENV !== 'production';
const server = next({ dev });
const handle = server.getRequestHandler()
const app = express();
app.use(bodyparse.urlencoded({
  extended: true
}));
app.use(bodyparse.json());

// Routes
const refund = require("./routes/refund");
const lotteryCheck = require("./routes/lotteryCheck");
const events = require("./routes/events");
const lottery = require("./routes/lottery");

server.prepare()
  .then(() => {
    
    // Next Handler
    app.get("/_next/*", (req, res) => {
      return handle(req, res)
    });
    
    // refund
    app.post("/refund",refund);

    // Slash command for the lottery
    app.post("/lotterycheck", lotteryCheck)
   
    // Home page
    app.get("/", (req, res) => {
      return handle(req, res);
    });

    // Events from slack api
    app.post("/events", events);

    // Lottery Starter
    app.post("/lottery", lottery)

    // Listen on port 3000
    app.listen(3000, (err) => console.log("Listening on port 3000"));
  })
  .catch((e) => {
    console.log(e)
    process.exit(1)
  });