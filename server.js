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
var id = 0;
app.use(bodyparse.urlencoded({
    extended: true
}));
app.use(bodyparse.json());
var idar = []
function startGame(uuid,ts,channel,amount,add,bot) {
  getGames((e,r)=> { 
  var build = JSON.parse(r.body).result;
  build[uuid]= {"ts":ts,"channel":channel,"gp":amount,"add":add,"bot":bot};
  request({
      method: 'POST',
      url: process.env.GAME,
      json: true,
      body:build
  },(e,r)=> console.log(r.body));
  console.log(build);
  })
}
function cleanupGame(uuid) {
  getGames((e,r)=> { 
  var build = JSON.parse(r.body).result;
  delete build[uuid];
  request({
      method: 'POST',
      url: process.env.GAME,
      json: true,
      body:build
  },(e,r)=> console.log(r.body));
  console.log(build);
  })
}
function getGames(callback) {
  request({
      method: 'GET',
      url: process.env.GAME
  },callback)
}
function addLottery (uuid,id) {
  base('Lottery').create([
    {
      "fields": {
        "ID":uuid,
        "Check ID":id
      }
    }
  ])
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
    } else {
      res.sendStatus(401);
    }
  })
  app.post("/lotterycheck",(req,res)=> {
    var allLot = [];
    base("Lottery").select({}).eachPage(function page(records, fetchNextPage) {
        records.forEach((val)=> {
          allLot.push({"ID":val.get("ID"),"Check":val.get("Check ID"),"del":val.getId()});
        })
        fetchNextPage();
      },(err)=> {
        res.send({"text":"The current amount of submissions right now is *"+allLot.length+"* which means you have a *"+100*(1/(allLot.length+1))+"%* chance of winning a jackpot of *"+allLot.length*20+"gp*!","response_type": "in_channel",})
      });
  })
app.get("/", (req, res) => {
    return handle(req,res);
});
app.post("/events", (req, res) => {
    if (typeof(req.body.event.text) == "string") {
        var words = req.body.event.text.split(" | ");
        console.log(words);
        try {
          words[3] = words[3].split("for ")[1].split('"')[1].toLowerCase();
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
                        if (body) {
                          if (Object.keys(body).includes(words[1].split("<@")[1].split(">")[0])) {
                            sendText(words[4],words[5],"Starting a new game and killing your old one......");
                            cleanupGame(words[1].split("<@")[1].split(">")[0]);
                            sendText(words[4],words[5],":blackjack:A GAME HAS STARTED:blackjack: \n *RULES:* \n 1) Type `hit` for a card \n 2) Type `bail` to bail \n *MULTIPLIERS:* \n 1) If you bail you get _70%_ of your money \n 2) If you bust you get _0%_ \n 3) If you win and get 21, you get a _3x_ multiplier!");
                            startGame(words[1].split("<@")[1].split(">")[0],words[5],words[4],parseInt(words[2]),0,0)
                          } else {
                            sendText(words[4],words[5],":blackjack:A GAME HAS STARTED:blackjack: \n *RULES:* \n 1) Type `hit` for a card \n 2) Type `bail` to bail \n *MULTIPLIERS:* \n 1) If you bail you get _70%_ of your money \n 2) If you bust you get _0%_ \n 3) If you win and get 21, you get a _3x_ multiplier!");
                            startGame(words[1].split("<@")[1].split(">")[0],words[5],words[4],parseInt(words[2]),0,0)
                          }
                        } else {
                          sendText(words[4],words[5],":blackjack:A GAME HAS STARTED:blackjack: \n *RULES:* \n 1) Type `hit` for a card \n 2) Type `bail` to bail \n *MULTIPLIERS:* \n 1) If you bail you get _70%_ of your money \n 2) If you bust you get _0%_ \n 3) If you win and get 21, you get a _3x_ multiplier!");
                          startGame(words[1].split("<@")[1].split(">")[0],words[5],words[4],parseInt(words[2]),0,0)
                        }
                      });
                    } else if (words[3] == "lottery") {
                      var gp = parseInt(words[2]);
                      if (gp == 20) {
                        var id = ID();
                        sendText(words[4],words[5],"You have been signed up for the lottery to win the jackpot! This will take place at this Saturday at 12:00 PST (HackNight)! You can buy more tickets for a higher chance at winning!");
                        addLottery(words[1].split("<@")[1].split(">")[0],id);
                        sendMoney(words[1].split("<@")[1].split(">")[0], 0,"Your ID for the lottery is "+id)
                      } else {
                        sendText(words[4],words[5],"You need to pay 20gp to sign up for the lottery! Refunding you....");
                        sendMoney(words[1].split("<@")[1].split(">")[0], gp,"Refund for lottery! Next time pay 20gp!")
                      }
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
        } else if (req.body.event.text == "hit") {
          getGames((e,r)=> {
            var body = JSON.parse(r.body).result;
            if (Object.keys(body).includes(req.body.event.user)) {
              if (body[req.body.event.user].ts == req.body.event.thread_ts) {
                var add = rnd(1,10);
                body[req.body.event.user].add = body[req.body.event.user].add ? body[req.body.event.user].add+add : add;
                if (!(body[req.body.event.user].bot == 21 || body[req.body.event.user].bot >=15)) {
                  body[req.body.event.user].bot+=rnd(1,10);
                }
                if (body[req.body.event.user].add == 21) {
                  if (body[req.body.event.user].bot == 21) {
                    id = ID();
                    sendText(body[req.body.event.user].channel,body[req.body.event.user].ts,"You got *"+body[req.body.event.user].add+"* ... and the bot did too.... you get 90% back The bot got "+body[req.body.event.user].bot);
                    sendMoney(req.body.event.user,Math.floor(body[req.body.event.user].gp*0.9),"You tied at blackjack... your id is "+id);
                    log(req.body.event.user,body[req.body.event.user].gp,"Tie blackjack game 21",Math.floor(body[req.body.event.user].gp*0.9),id);
                  } else {
                    id = ID();
                    sendText(body[req.body.event.user].channel,body[req.body.event.user].ts,"You HAVE WON :moneybag: :moneybag: YAY! Transfering your money now!");                 
                    sendMoney(req.body.event.user,body[req.body.event.user].gp*3,"You won BLACKJACK! :blackjack: Your id is "+id); 
                    log(req.body.event.user,body[req.body.event.user].gp,"Won w/ 21",Math.floor(body[req.body.event.user].gp*3),id);
                  }
                  cleanupGame(req.body.event.user);
                } else if (body[req.body.event.user].add > 21){
                  if (body[req.body.event.user].bot <= 21) {
                    id = ID();
                    log(req.body.event.user,body[req.body.event.user].gp,"Bust",0,id);
                    sendText(body[req.body.event.user].channel,body[req.body.event.user].ts,"You got *"+body[req.body.event.user].add+"* and went over 21... YOU WENT BUST! The bot got "+body[req.body.event.user].bot+" and the game id is "+id);
                  } else {
                    id = ID();
                    log(req.body.event.user,body[req.body.event.user].gp,"Bust Tie",Math.floor(body[req.body.event.user].gp*0.9),id);
                    sendText(body[req.body.event.user].channel,body[req.body.event.user].ts,"You got *"+body[req.body.event.user].add+"* and went over 21... and the bot did too.... you get 90% back");
                    sendMoney(req.body.event.user,Math.floor(body[req.body.event.user].gp*0.9),"You tied at blackjack... Your game id is "+id);
                  }
                  cleanupGame(req.body.event.user);
                } else {
                  startGame(req.body.event.user,body[req.body.event.user].ts,body[req.body.event.user].channel,body[req.body.event.user].gp,body[req.body.event.user].add,body[req.body.event.user].bot)
                  sendText(body[req.body.event.user].channel,body[req.body.event.user].ts,"You have chosen to `hit` and have drawn a(n) *"+add+"*... Now your total is *"+body[req.body.event.user].add+"*. And the bots has played. Make sure you don't go over 21!");
                }
              }
            }
          })
        } else if (req.body.event.text == "bail") {
          getGames((e,r)=> {
            var body = JSON.parse(r.body).result;
            var body = JSON.parse(r.body).result;
            if (Object.keys(body).includes(req.body.event.user)) {
              if (body[req.body.event.user].ts == req.body.event.thread_ts) {
                id = ID()
                while (!(body[req.body.event.user].bot == 21 || body[req.body.event.user].bot >=13)) {
                  body[req.body.event.user].bot+=rnd(1,10);
                }
                if (body[req.body.event.user].bot > 21) {
                  sendText(body[req.body.event.user].channel,body[req.body.event.user].ts,"You win! You get a 1.5x multiplier! The bot got "+body[req.body.event.user].bot);
                  sendMoney(req.body.event.user,Math.floor(body[req.body.event.user].gp*1.5),"YOU WIN!!!!!!! Your id is "+id);
                  log(req.body.event.user,body[req.body.event.user].gp,"Win Bot bust",Math.floor(body[req.body.event.user].gp*1.5),id);
                } else if (body[req.body.event.user].bot > body[req.body.event.user].add) {
                  sendText(body[req.body.event.user].channel,body[req.body.event.user].ts,"You lost... the bot got "+body[req.body.event.user].bot+" and you got "+body[req.body.event.user].add+".... The game id is "+id);
                  log(req.body.event.user,body[req.body.event.user].gp,"Lose Normal",0,id);
                } else if (body[req.body.event.user].bot < body[req.body.event.user].add) {
                  sendText(body[req.body.event.user].channel,body[req.body.event.user].ts,"You win! You get a 1.5x multiplier! The bot got "+body[req.body.event.user].bot);
                  sendMoney(req.body.event.user,Math.floor(body[req.body.event.user].gp*1.5),"YOU WIN!!!!!!! Your id is "+id);
                  log(req.body.event.user,body[req.body.event.user].gp,"Win Bot Lower",Math.floor(body[req.body.event.user].gp*1.5),id);
                } else if (body[req.body.event.user].bot == body[req.body.event.user].add) {
                  log(req.body.event.user,body[req.body.event.user].gp,"Tie",Math.floor(body[req.body.event.user].gp*0.9),id);
                  sendText(body[req.body.event.user].channel,body[req.body.event.user].ts,"You got *"+body[req.body.event.user].add+"* ... and the bot did too.... you get 90% back The bot got "+body[req.body.event.user].bot);
                  sendMoney(req.body.event.user,Math.floor(body[req.body.event.user].gp*0.9),"You tied at blackjack... Your id is "+id);
                }
                cleanupGame(req.body.event.user);
              }
            }
          });
        }
    }
  res.sendStatus(200);
});
app.post("/lottery",(req,res)=> {
      if (req.body.key == process.env.REFUND) {
      var allLot = [];
      base("Lottery").select({}).eachPage(function page(records, fetchNextPage) {
        records.forEach((val)=> {
          allLot.push({"ID":val.get("ID"),"Check":val.get("Check ID"),"del":val.getId()});
        })
        fetchNextPage();
      },(err)=> {
        var random = rnd(0,allLot.length-1);
        res.send(allLot[random]);
        sendMoney(allLot[random].ID,allLot.length*20,"CONGRATS YOU WON THE LOTTERY!!!! Your ticket id that won was "+allLot[random].Check);
        sendText ("CN9LWFDQF","undefined","*The lottery has been chosen! User <@"+allLot[random].ID+"> has won this lottery! The total gp won was "+allLot.length*20+"!*")
        //Cleaning up
        allLot.map((val)=> {
          console.log(val)
          base('Lottery').destroy([val.del],(err)=>console.log(err));
        });
      });
      } else {
        res.sendStatus(401);
      }
});
app.listen(3000, (err) => console.log("Listening on port 3000"));
  })
.catch((e)=> {
  console.log(e)
  process.exit(1)
});