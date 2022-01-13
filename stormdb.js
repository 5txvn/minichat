const StormDB = require("stormdb");
const engine = new StormDB.localFileEngine("./test.stormdb");2
const db = new StormDB(engine);

db.set("test", "test")
db.save()