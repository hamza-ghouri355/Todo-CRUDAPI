const express = require('express');
const app = express();
const port = 3000;

const tasksData = require('./data/task.data');
const tasksRoutes = require('./routes/tasks.routes');

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ name: 'Task API', version: '1.0.0', endpoints: ['/tasks'] });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/tasks', tasksRoutes);


tasksData.initDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});