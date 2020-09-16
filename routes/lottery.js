const tools = require("../tools");
var Airtable = require('airtable');
var base = new Airtable({apiKey: process.env.AIRTABLE}).base('appuWtPdNy4VAOb0a');
module.exports = (req, res) => {
    if (req.body.key == process.env.REFUND) {
      var allLot = [];
      base("Lottery").select({}).eachPage(function page(records, fetchNextPage) {
        records.forEach((val) => {
          allLot.push({ "ID": val.get("ID"), "Check": val.get("Check ID"), "del": val.id });
        })
        fetchNextPage();
      }, (err) => {
        var random = tools.rnd(0, allLot.length - 1);
        res.send(allLot[random]);
        tools.sendMoney(allLot[random].ID, allLot.length * 20, "CONGRATS YOU WON THE LOTTERY!!!! Your ticket id that won was " + allLot[random].Check);
        tools.sendText("CN9LWFDQF", "undefined", "*The lottery has been chosen! User <@" + allLot[random].ID + "> has won this lottery! The total gp won was " + allLot.length * 20 + "!*")
        //Cleaning up
        allLot.map((val) => {
          base('Lottery').destroy([val.del]);
        });
      });
    } else {
      res.sendStatus(401);
    }
}