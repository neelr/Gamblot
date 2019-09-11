const express = require("express");
const bodyparse = require("body-parser")
const request = require("request");
const next = require("next");
const dev = process.env.NODE_ENV !== 'production';
const server = next({ dev });
const handle = server.getRequestHandler()
const app = express();
app.use(bodyparse.urlencoded({
    extended: true
}));
app.use(bodyparse.json());
idar = []

function sendMoney(uuid, muns) {
    request({
        method: 'POST',
        url: 'https://slack.com/api/chat.postMessage',
        form: {
            token: process.env.KEY,
            channel: "UH50T81A6",
            text: `<@UH50T81A6> give <@${uuid}> ${muns}gp for playing with the pros`,
            as_user: true
        },
    }, (e, resp) => console.log(resp.body))
}

function rnd(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
        words = req.body.event.text.split(" ");
        if (words[0]=='I' && words[1]=='shall' && words[2]=='transfer' && words[4]=='to'&& words[5] == '<@UMTK90DD0>'& req.body.event.channel != "CGSEAP135" && req.body.event.bot_id == "BH6353LKZ") {
          console.log("got through")  
          request({
                method: "GET",
                url: process.env.STORE
            }, (e, resp) => {
                idar = JSON.parse(resp.body).result;
                if (!(idar.includes(req.body.event.client_msg_id))) {
                    gp = parseInt(words[3].split("gp"));
                    num = rnd(0,100)
                    console.log("HERE", gp, num, req.body)
                    if (num <= 33) {
                        request({
                            method: 'POST',
                            url: 'https://slack.com/api/chat.postMessage',
                            form: {
                                token: process.env.KEY,
                                channel: req.body.event.channel,
                                text: ":flying_money_with_wings: You HAVE LOST ALL YOU MANEY.. L:flying_money_with_wings: ",
                                thread_ts: req.body.event.ts
                            },
                        }, (e, resp) => console.log(resp.body))
                    } else if (num > 33 && num <= 80) {
                        request({
                            method: 'POST',
                            url: 'https://slack.com/api/chat.postMessage',
                            form: {
                                token: process.env.KEY,
                                channel: req.body.event.channel,
                                text: ":creeper:You ... didnt get any money...:creeper:",
                                thread_ts: req.body.event.ts
                            },
                        }, (e, resp) => console.log(resp.body))
                        sendMoney(req.body.event.parent_user_id, Math.floor(gp*0.7))
                    } else if (num > 80 && num <= 99) {
                        request({
                            method: 'POST',
                            url: 'https://slack.com/api/chat.postMessage',
                            form: {
                                token: process.env.KEY,
                                channel: req.body.event.channel,
                                text: ":moneybag: You DOUBLED YER MANEY:moneybag: ",
                                thread_ts: req.body.event.ts
                            },
                        }, (e, resp) => console.log(resp.body))
                        sendMoney(req.body.event.parent_user_id, gp * 2)
                    } else {
                      request({
                            method: 'POST',
                            url: 'https://slack.com/api/chat.postMessage',
                            form: {
                                token: process.env.KEY,
                                channel: req.body.event.channel,
                                text: ":moneybag: :moneybag: :moneybag: You GOT LE JACKPOT!!!:moneybag: :moneybag: :moneybag: ",
                                thread_ts: req.body.event.ts
                            },
                        }, (e, resp) => console.log(resp.body))
                        sendMoney(req.body.event.parent_user_id, gp * 4)
                    }
                    idar.push(req.body.event.client_msg_id);
                    request({
                        method: 'POST',
                        url: process.env.STORE,
                        json: true,
                        body: idar
                    }, (e, resp) => console.log(resp.body));
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