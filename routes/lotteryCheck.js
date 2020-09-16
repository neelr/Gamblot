var Airtable = require('airtable');
var base = new Airtable({apiKey: process.env.AIRTABLE}).base('appuWtPdNy4VAOb0a');
module.exports = (req, res) => {
    var allLot = [];
    base("Lottery").select({}).eachPage(function page(records, fetchNextPage) {
      records.forEach((val) => {
        allLot.push({ "ID": val.get("ID"), "Check": val.get("Check ID"), "del": val.id});
      })
      fetchNextPage();
    }, (err) => {
      res.send({ "text": "The current amount of submissions right now is *" + allLot.length + "* which means each submission has a *" + 100 * (1 / (allLot.length)) + "%* chance of winning a jackpot of *" + allLot.length * 20 + "gp*!", "response_type": "in_channel", })
    });
  }