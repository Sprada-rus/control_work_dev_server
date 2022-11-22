import express from 'express';
import config from 'config';
import {router as api_router} from "./api.routes.js";

const app = express();
app.use(express.json({extended: true}))
app.use('/api', api_router);

const PORT = config.get('port') || 8080;

app.get('/', (request, response) => {
    response.send('Бобро пожаловать');
});

app.listen(PORT, () => {
    console.log(`Let's start with port ${PORT}`)
})