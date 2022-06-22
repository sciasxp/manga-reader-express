const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

var scraperRouter = require("./routes/scraper/scraper");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use("/", scraperRouter);

app.listen(process.env.PORT || 4000);
module.exports = app;
