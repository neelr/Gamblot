const express = require("express");
const bodyparse = require("body-parser")
const request = require("request");
const next = require("next");
var Airtable = require('airtable');
var base = new Airtable({apiKey: process.env.AIRTABLE}).base('appuWtPdNy4VAOb0a');
const dev = process.env.NODE_ENV !== 'production';
const server = next({ dev });
const handle = server.getRequestHandler()
const app = express();
app.use(bodyparse.urlencoded({
    extended: true
}));
app.use(bodyparse.json());
var idar = []
function startGame(uuid,ts,channel,amount) {
  var build = {};
  build[uuid]= {"ts":ts,"channel":channel,"gp":amount};
  request({
      method: 'POST',
      url: process.env.GAME,
      json: true,
      body:build
  },(e,r)=> console.log(r.body));
  console.log(build);
}
function getGames(callback) {
  request({
      method: 'GET',
      url: process.env.GAME
  },callback)
}
function log(uuid,gp,trans,after,id) {
  base('Transactions').create([
  {
    "fields": {
      "Name":uuid,
      "GP":gp,
      "Transaction":trans,
      "After":after,
      "_id":id
    }
  }
], function(err, records) {
  if (err) {
    console.error(err);
    return;
  }
});
}
function ID () {
  return '_' + Math.random().toString(36).substr(2, 9);
};
function sendMoney(uuid, muns,r="refund!!!") {
    request({
        method: 'POST',
        url: 'https://slack.com/api/chat.postMessage',
        form: {
            token: process.env.KEY,
            channel: "UH50T81A6",
            text: `<@UH50T81A6> give <@${uuid}> ${muns}gp for ${r}`,
            as_user: true
        },
    })
}
function sendText (channel,ts,text) {
  if (ts == "undefined") {
    console.log("HOLAAAAAAAAAAAAAAAA")
    request({
        method: 'POST',
        url: 'https://slack.com/api/chat.postMessage',
        form: {
            token: process.env.KEY,
            channel: channel,
            text: text,
            as_user: true
        },
    })
  } else {
    console.log("nup")
    request({
          method: 'POST',
          url: 'https://slack.com/api/chat.postMessage',
          form: {
              token: process.env.KEY,
              channel: channel,
              text: text,
              thread_ts:ts,
              as_user: true
          },
      })
  }
}
function rnd(min, max) {
    var min = Math.ceil(min);
    var max = Math.floor(max);
    var seed = Math.random();
    return Math.floor(seed * (max - min + 1)) + min;
}
server.prepare()
  .then(()=> {
  app.post("/refund",(req,res)=> {
    if (req.body.key==process.env.REFUND) {
      sendMoney(req.body.uuid,req.body.gp);
      res.send("Sent money") 
    }
  })
app.get("/", (req, res) => {
    return handle(req,res);
});
app.post("/events", (req, res) => {
    if (typeof(req.body.event.text) == "string") {
        var words = req.body.event.text.split(" | ");
        console.log(words);
        try {
          words[3] = words[3].split("for ")[1].split('"')[1];
        } catch {
          words[3] = "nope";
        }
        if ( words[0] == "$$$" && req.body.event.bot_id == "BH6353LKZ" && words[3]!="!refilling the bot!") {
          request({
                method: "GET",
                url: process.env.STORE
            }, (e, resp) => {
                var id = ID();
                idar = JSON.parse(resp.body).result;
                if (!(idar.includes(req.body.event.client_msg_id))) {
                    if (words[3] == "blackjack" && words[5] != "undefined") {
                      getGames((e,r,b)=> {
                        var body = JSON.parse(r.body);
                        console.log(body);
                        body = body.result;
                        console.log(body);
                        if (body) { // can be taken away after development
                          if (Object.keys(body).includes(words[1].split("<@")[1].split(">")[0])) {
                            sendText(words[4],words[5],"Please dont start 2 games at once!");
                          } else {
                            sendText(words[4],words[5],"(In development) :blackjack:A GAME HAS STARTED:blackjack: \n *RULES:* \n 1) Type `hit` for a card \n 2) Type `stop` to bail \n *MULTIPLIERS:* \n 1) If you bail you get _50%_ of your money \n 2) If you bust you get _0%_ \n 3) If you win and get 21, you get a _3x_ multiplier!");
                            startGame(words[1].split("<@")[1].split(">")[0],words[5],words[4],parseInt(words[2]))
                          }
                        } else {
                          sendText(words[4],words[5],"(In development) :blackjack:A GAME HAS STARTED:blackjack: \n *RULES:* \n 1) Type `hit` for a card \n 2) Type `stop` to bail \n *MULTIPLIERS:* \n 1) If you bail you get _50%_ of your money \n 2) If you bust you get _0%_ \n 3) If you win and get 21, you get a _3x_ multiplier!");
                          startGame(words[1].split("<@")[1].split(">")[0],words[5],words[4],parseInt(words[2]))
                        }
                      });
                    } else {
                      var gp = parseInt(words[2]);
                      var num = rnd(0,100);
                      name = words[1].split("<@")[1].split(">")[0]
                      if (num <= 33) {
                        log(name,gp,"lost all money",0,id);
                        sendText(words[4],words[5],":flying_money_with_wings: You HAVE LOST ALL YOU MANEY.. L:flying_money_with_wings:");
                        sendMoney(name,0,"Your gamble id is "+id)
                      } else if (num > 33 && num <= 80) {
                        log(name,gp,"lost 70% money",Math.floor(gp*0.7),id);
                        sendText(words[4],words[5],":creeper:You ... didnt get any money...:creeper:");
                        sendMoney(name, Math.floor(gp*0.7),"Your gamble id is "+id)
                      } else if (num > 80 && num <= 99) {
                        log(name,gp,"doubled the money",gp*2,id);
                        sendText(words[4],words[5],":moneybag: You DOUBLED YER MANEY:moneybag:");
                        sendMoney(name, gp * 2,"Your gamble id is "+id)
                      } else {
                        log(name,gp,"JACKPOT",gp*4,id);
                        sendText(words[4],words[5],":moneybag: :moneybag: :moneybag: You GOT LE JACKPOT!!!:moneybag: :moneybag: :moneybag: ");
                        sendMoney(name, gp * 4,"Your gamble id is "+id)
                      }
                    }
                    idar.push(req.body.event.client_msg_id);
                    request({
                        method: 'POST',
                        url: process.env.STORE,
                        json: true,
                        body: idar
                    });
                }
            });
        }
    }
  res.send("yola");
});

app.listen(3000, (err) => console.log("Listening on port 3000"));
  })
.catch((e)=> {
  console.log(e)
  process.exit(1)
});