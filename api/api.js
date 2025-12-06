const { createClient } = require('redis');
require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

const REDIS_URL = process.env.REDIS_URL || '';
const REDIS_PASSWORD = fs.readFileSync("/run/secrets/redis_password", "utf8").trim();
const mongoUser = fs.readFileSync("/run/secrets/mongo_root_username", "utf8").trim();
const mongoPass = fs.readFileSync("/run/secrets/mongo_root_password", "utf8").trim();
const MONGO_URI = `mongodb://${mongoUser}:${mongoPass}@${process.env.DB_HOST}/${process.env.DB_NAME}?authSource=admin`;

const redisClient = createClient({
  url: REDIS_URL,
  password: REDIS_PASSWORD,
});

redisClient.on('error', err => console.error('🔴 Redis Client Error', err));

async function connectRedis() {
  try {
    await redisClient.connect();
    console.log('✅ Connected to Redis');
  } catch (err) {
    console.error('❌ Could not connect to Redis:', err);
  }
}

connectRedis();

const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error(err));

const Todo = mongoose.model('Todo', new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false }
}));

const router = express.Router();
const CACHE_KEY_ALL_TODOS = 'allTodos';
const CACHE_EXPIRATION = 60;

router.get('/', async (_, res) => {
  try {
    const cachedData = await redisClient.get(CACHE_KEY_ALL_TODOS);
    if (cachedData) {
      console.log('Cache Hit: Returning all todos from Redis');
      return res.json(JSON.parse(cachedData));
    }

    const todos = await Todo.find();

    await redisClient.setEx(
      CACHE_KEY_ALL_TODOS,
      CACHE_EXPIRATION,
      JSON.stringify(todos)
    );
    console.log('Cache Miss: Fetched from DB and stored in Redis');

    return res.json(todos);
  } catch (error) {
    console.error('Error in GET /:', error);
    const todos = await Todo.find();
    res.json(todos);
  }
});
router.post('/', async (req, res) => {
  try {
    const createdTodo = await Todo.create(req.body);

    await redisClient.del(CACHE_KEY_ALL_TODOS);
    console.log('Cache Invalidate: allTodos deleted after POST');

    res.status(201).json(createdTodo);
  } catch (error) {
    console.error('Error in POST /:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.get('/:id', async (req, res) => {
  const todo = await Todo.findById(req.params.id);
  if (!todo) return res.status(404).send('Not found');
  res.json(todo);
});
router.put('/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!todo) return res.status(404).send('Not found');

    await redisClient.del(CACHE_KEY_ALL_TODOS);
    console.log('Cache Invalidate: allTodos deleted after PUT');

    res.json(todo);
  } catch (error) {
    console.error('Error in PUT /:id:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) return res.status(404).send('Not found');

    await redisClient.del(CACHE_KEY_ALL_TODOS);
    console.log('Cache Invalidate: allTodos deleted after DELETE');

    res.sendStatus(204);
  } catch (error) {
    console.error('Error in DELETE /:id:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.use('/api/v1/todos', router);

app.get('/health', (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;
  const isRedisConnected = redisClient.isReady;

  if (isMongoConnected && isRedisConnected) {
    res.status(200).json({
      status: 'ok',
      uptime: process.uptime(),
      db: 'connected',
      cache: 'connected'
    });
  } else {
    res.status(503).json({
      status: 'unavailable',
      db: isMongoConnected ? 'connected' : 'disconnected',
      cache: isRedisConnected ? 'connected' : 'disconnected'
    });
  }
});

app.listen(port, () => console.log(`✅ Server running on http://localhost:${port}`));
