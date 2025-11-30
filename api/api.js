require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

const corsOptions = {
  // Remplacez par l'URL exacte de votre frontend en production
  // Pour le développement, vous pouvez utiliser '*' mais ce n'est pas sécuritaire en prod.
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Si vous utilisez des cookies/sessions
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error(err));

const Todo = mongoose.model('Todo', new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false }
}));

const router = express.Router();

router.get('/', async (_, res) => res.json(await Todo.find()));
router.post('/', async (req, res) => res.status(201).json(await Todo.create(req.body)));
router.get('/:id', async (req, res) => {
  const todo = await Todo.findById(req.params.id);
  if (!todo) return res.status(404).send('Not found');
  res.json(todo);
});
router.put('/:id', async (req, res) => {
  const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!todo) return res.status(404).send('Not found');
  res.json(todo);
});
router.delete('/:id', async (req, res) => {
  const todo = await Todo.findByIdAndDelete(req.params.id);
  if (!todo) return res.status(404).send('Not found');
  res.sendStatus(204);
});

app.use('/api/v1/todos', router);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

app.listen(port, () => console.log(`✅ Server running on http://localhost:${port}`));
