const fs = require('fs');
const path = require('path');
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const PORT = 8000;

server.use(middlewares);
server.use(jsonServer.bodyParser);

const getResponse = () => ({
  status: 'success',
  data: undefined,
});

const getModel = (req) => {
  const db = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'db.json'), 'utf8'),
  );
  const tableName = Object.keys(db).find((key) => req.url.includes(key));
  return db[tableName];
};

server.get('/users/:id', (req, res) => {
  const data = getModel(req);
  const result = getResponse();

  if (!data) {
    result.status = 'failed';

    res.status(500).jsonp(result);
  } else {
    result.data = data.find(({ id }) => id == req.params.id);
  }

  res.status(200).jsonp(result);
});

server.post('/users/list', (req, res) => {
  const data = getModel(req);

  const result = getResponse();

  if (!data) {
    result.status = 'failed';

    res.status(500).jsonp(result);
  }

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

  res.status(200).jsonp(result);
});

server.use(router);

server.listen(PORT, () => {
  console.log('JSON Server is running');
});
