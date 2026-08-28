const express = require('express');
const app = express();
const swaggerui = require('swagger-ui-express');
const openapiSpec=require('./openapi.json');
const port = 3000;

const tasksData = require('./data/task.data');
const tasksRoutes = require('./routes/tasks.routes');
const authRoutes=require('./routes/auth.routes');
const protectedRoutes=require('./routes/protected.routes');


app.use(express.json());
app.use('/auth', authRoutes);
app.get('/public/info', (req, res) => {
  res.json({ message: 'Welcome stranger! This info is public.' });
});
app.use('/protected', protectedRoutes);
app.use('/docs', swaggerui.serve, swaggerui.setup(openapiSpec));


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