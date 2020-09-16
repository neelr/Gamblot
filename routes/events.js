const tools = require("../tools");
module.exports = (req, res) => {
    if (typeof (req.body.event.text) == "string" && req.body.token == process.env.SIGN) {
      var words = req.body.event.text.split(" | ");
      try {
        words[3] = words[3].split("for ")[1].split('"')[1].toLowerCase();
      } catch {
        words[3] = "nope";
      }
      if (words[0] == "$$$" && req.body.event.bot_id == "BH6353LKZ" && words[3] != "!refilling the bot!") {
        var id = tools.ID();
        if (words[3] == "blackjack" && words[5] != "undefined") {
          tools.getGames((e, r, b) => {
            var body = JSON.parse(r.body);
            if (body) {
              if (Object.keys(body).includes(words[1].split("<@")[1].split(">")[0])) {
                tools.sendText(words[4], words[5], "Starting a new game and killing your old one......");
                tools.cleanupGame(words[1].split("<@")[1].split(">")[0]);
                tools.sendText(words[4], words[5], ":blackjack:A GAME HAS STARTED:blackjack: \n *RULES:* \n 1) Type `hit` for a card \n 2) Type `bail` to bail \n *MULTIPLIERS:* \n 1) If you bail you get _70%_ of your money \n 2) If you bust you get _0%_ \n 3) If you win and get 21, you get a _3x_ multiplier!");
                tools.startGame(words[1].split("<@")[1].split(">")[0], words[5], words[4], parseInt(words[2]), 0, 0)
              } else {
                tools.sendText(words[4], words[5], ":blackjack:A GAME HAS STARTED:blackjack: \n *RULES:* \n 1) Type `hit` for a card \n 2) Type `bail` to bail \n *MULTIPLIERS:* \n 1) If you bail you get _70%_ of your money \n 2) If you bust you get _0%_ \n 3) If you win and get 21, you get a _3x_ multiplier!");
                tools.startGame(words[1].split("<@")[1].split(">")[0], words[5], words[4], parseInt(words[2]), 0, 0)
              }
            } else {
              tools.sendText(words[4], words[5], ":blackjack:A GAME HAS STARTED:blackjack: \n *RULES:* \n 1) Type `hit` for a card \n 2) Type `bail` to bail \n *MULTIPLIERS:* \n 1) If you bail you get _70%_ of your money \n 2) If you bust you get _0%_ \n 3) If you win and get 21, you get a _3x_ multiplier!");
              tools.startGame(words[1].split("<@")[1].split(">")[0], words[5], words[4], parseInt(words[2]), 0, 0)
            }
          });
        } else if (words[3] == "lottery") {
          var gp = parseInt(words[2]);
          if (gp == 10) {
            var id = tools.ID();
            tools.sendText(words[4], words[5], "You have been signed up for the lottery to win the jackpot! This will take place at this Saturday at 12:00 PST (HackNight)! You can buy more tickets for a higher chance at winning!");
            tools.addLottery(words[1].split("<@")[1].split(">")[0], id);
            tools.sendMoney(words[1].split("<@")[1].split(">")[0], 0, "Your ID for the lottery is " + id)
          } else {
            tools.sendText(words[4], words[5], "You need to pay 10gp to sign up for the lottery! Refunding you....");
            tools.sendMoney(words[1].split("<@")[1].split(">")[0], gp, "Refund for lottery! Next time pay 10gp!")
          }
        } else if (words[3] == "roulette" && words[5] != "undefined") {
          tools.startRoulette(words[1].split("<@")[1].split(">")[0], words[5], words[4], parseInt(words[2]));
        } else {
          var gp = parseInt(words[2]);
          var num = tools.rnd(0, 100);
          name = words[1].split("<@")[1].split(">")[0]
          if (num <= 33) {
            tools.log(name, gp, "lost all money", 0, id);
            tools.sendText(words[4], words[5], ":flying_money_with_wings: You HAVE LOST ALL YOUR MANEY.. L:flying_money_with_wings:");
            tools.sendMoney(name, 0, "Your gamble id is " + id)
          } else if (num > 33 && num <= 65) {
            tools.log(name, gp, "lost 50% money", Math.floor(gp * 0.5), id);
            tools.sendText(words[4], words[5], ":creeper:You ... get 70% of your money...:creeper:");
            tools.sendMoney(name, Math.floor(gp * 0.7), "Your gamble id is " + id)
          } else if (num > 65 && num <= 95) {
            tools.log(name, gp, "doubled the money", gp * 2, id);
            tools.sendText(words[4], words[5], ":moneybag: You DOUBLED YER MANEY:moneybag:");
            tools.sendMoney(name, gp * 2, "Your gamble id is " + id)
          } else {
            tools.log(name, gp, "JACKPOT", gp * 4, id);
            tools.sendText(words[4], words[5], ":moneybag: :moneybag: :moneybag: You GOT LE JACKPOT!!!:moneybag: :moneybag: :moneybag: ");
            tools.sendMoney(name, gp * 4, "Your gamble id is " + id)
          }
        }
      } else if (req.body.event.text == "hit") {
        tools.getGames((e, r) => {
          var body = JSON.parse(r.body);
          if (Object.keys(body).includes(req.body.event.user)) {
            if (body[req.body.event.user].ts == req.body.event.thread_ts) {
              var add = tools.rnd(1, 10);
              body[req.body.event.user].add = body[req.body.event.user].add ? body[req.body.event.user].add + add : add;
              if (!(body[req.body.event.user].bot == 21 || body[req.body.event.user].bot >= 15)) {
                body[req.body.event.user].bot += tools.rnd(1, 10);
              }
              if (body[req.body.event.user].add == 21) {
                if (body[req.body.event.user].bot == 21) {
                  id = tools.ID();
                  tools.sendText(body[req.body.event.user].channel, body[req.body.event.user].ts, "You got *" + body[req.body.event.user].add + "* ... and the bot did too.... you get 90% back The bot got " + body[req.body.event.user].bot);
                  tools.sendMoney(req.body.event.user, Math.floor(body[req.body.event.user].gp * 0.9), "You tied at blackjack... your id is " + id);
                  tools.log(req.body.event.user, body[req.body.event.user].gp, "Tie blackjack game 21", Math.floor(body[req.body.event.user].gp * 0.9), id);
                } else {
                  id = tools.ID();
                  tools.sendText(body[req.body.event.user].channel, body[req.body.event.user].ts, "You HAVE WON :moneybag: :moneybag: YAY! Transfering your money now!");
                  tools.sendMoney(req.body.event.user, body[req.body.event.user].gp * 3, "You won BLACKJACK! :blackjack: Your id is " + id);
                  tools.log(req.body.event.user, body[req.body.event.user].gp, "Won w/ 21", Math.floor(body[req.body.event.user].gp * 3), id);
                }
                tools.cleanupGame(req.body.event.user);
              } else if (body[req.body.event.user].add > 21) {
                if (body[req.body.event.user].bot <= 21) {
                  id = tools.ID();
                  tools.log(req.body.event.user, body[req.body.event.user].gp, "Bust", 0, id);
                  tools.sendText(body[req.body.event.user].channel, body[req.body.event.user].ts, "You got *" + body[req.body.event.user].add + "* and went over 21... YOU WENT BUST! The bot got " + body[req.body.event.user].bot + " and the game id is " + id);
                } else {
                  id = tools.ID();
                  tools.log(req.body.event.user, body[req.body.event.user].gp, "Bust Tie", Math.floor(body[req.body.event.user].gp * 0.9), id);
                  tools.sendText(body[req.body.event.user].channel, body[req.body.event.user].ts, "You got *" + body[req.body.event.user].add + "* and went over 21... and the bot did too.... you get 90% back");
                  tools.sendMoney(req.body.event.user, Math.floor(body[req.body.event.user].gp * 0.9), "You tied at blackjack... Your game id is " + id);
                }
                tools.cleanupGame(req.body.event.user);
              } else {
                tools.startGame(req.body.event.user, body[req.body.event.user].ts, body[req.body.event.user].channel, body[req.body.event.user].gp, body[req.body.event.user].add, body[req.body.event.user].bot)
                tools.sendText(body[req.body.event.user].channel, body[req.body.event.user].ts, "You have chosen to `hit` and have drawn a(n) *" + add + "*... Now your total is *" + body[req.body.event.user].add + "*. And the bots has played. Make sure you don't go over 21!");
              }
            }
          }
        })
      } else if (req.body.event.text == "bail") {
        tools.getGames((e, r) => {
          var body = JSON.parse(r.body);
          if (Object.keys(body).includes(req.body.event.user)) {
            if (body[req.body.event.user].ts == req.body.event.thread_ts) {
              id = tools.ID()
              while (!(body[req.body.event.user].bot == 21 || body[req.body.event.user].bot >= 16)) {
                body[req.body.event.user].bot += tools.rnd(1, 10);
              }
              if (body[req.body.event.user].bot > 21) {
                tools.sendText(body[req.body.event.user].channel, body[req.body.event.user].ts, "You win! You get a 1.5x multiplier! The bot got " + body[req.body.event.user].bot);
                tools.sendMoney(req.body.event.user, Math.floor(body[req.body.event.user].gp * 1.5), "YOU WIN!!!!!!! Your id is " + id);
                tools.log(req.body.event.user, body[req.body.event.user].gp, "Win Bot bust", Math.floor(body[req.body.event.user].gp * 1.5), id);
              } else if (body[req.body.event.user].bot > body[req.body.event.user].add) {
                tools.sendText(body[req.body.event.user].channel, body[req.body.event.user].ts, "You lost... the bot got " + body[req.body.event.user].bot + " and you got " + body[req.body.event.user].add + ".... The game id is " + id);
                tools.log(req.body.event.user, body[req.body.event.user].gp, "Lose Normal", 0, id);
              } else if (body[req.body.event.user].bot < body[req.body.event.user].add) {
                tools.sendText(body[req.body.event.user].channel, body[req.body.event.user].ts, "You win! You get a 1.5x multiplier! The bot got " + body[req.body.event.user].bot);
                tools.sendMoney(req.body.event.user, Math.floor(body[req.body.event.user].gp * 1.5), "YOU WIN!!!!!!! Your id is " + id);
                tools.log(req.body.event.user, body[req.body.event.user].gp, "Win Bot Lower", Math.floor(body[req.body.event.user].gp * 1.5), id);
              } else if (body[req.body.event.user].bot == body[req.body.event.user].add) {
                tools.log(req.body.event.user, body[req.body.event.user].gp, "Tie", Math.floor(body[req.body.event.user].gp * 0.9), id);
                tools.sendText(body[req.body.event.user].channel, body[req.body.event.user].ts, "You got *" + body[req.body.event.user].add + "* ... and the bot did too.... you get 90% back The bot got " + body[req.body.event.user].bot);
                tools.sendMoney(req.body.event.user, Math.floor(body[req.body.event.user].gp * 0.9), "You tied at blackjack... Your id is " + id);
              }
              tools.cleanupGame(req.body.event.user);
            }
          }
        });
      }
    }
    res.sendStatus(200);
  }
