const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const db = require("./db.json");

const PORT = 8000;

server.use(middlewares);
server.use((req, res) => {
  if (req.method === "GET") {
    const tableName = Object.keys(db).find((key) => req.url.includes(key));
    const data = db[tableName];

    const result = {
      resultMsg: "SUCCESS",
      data: undefined,
    };

    if (!data) {
      result.resultMsg = "FAILED";

      res.status(500).jsonp(result);
    }

    if (req.query.id) {
      result.data = data.find(({ id }) => id == req.query.id);
    } else {
      const page = req.query.page ?? 1;
      const size = req.query.perPage ?? 10;
      const totalCount = data.length;

      result.data = {
        page,
        size,
        totalPages: Math.round(totalCount / size) || 1,
        totalCount,
        list: data,
      };
    }

    res.status(200).jsonp(result);
  }
});
server.use(router);

server.listen(PORT, () => {
  console.log("JSON Server is running");
});
