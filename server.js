const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const db = require("./db.json");

const PORT = 8000;

server.use(middlewares);
server.use(jsonServer.bodyParser);
server.use((req, res) => {
  if (req.url.includes("/list") && req.method === "POST") {
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

    if (req.body.id) {
      result.data = data.find(({ id }) => id == req.body.id);
    } else {
      /** Request body */
      const page = req.body.paginationDto?.page ?? 1;
      const size = req.body.paginationDto?.perPage ?? 10;
      
      /** Handle Pagination */
      const totalCount = data.length;
      const start = (page - 1) * size;
      const end = page * size;
      const list = data.slice(start, end);
      const totalPages = Math.round(totalCount / size) || 1;

      result.data = {
        page,
        size,
        totalPages,
        totalCount,
        list,
      };
    }

    res.status(200).jsonp(result);
  }
});
server.use(router);

server.listen(PORT, () => {
  console.log("JSON Server is running");
});
