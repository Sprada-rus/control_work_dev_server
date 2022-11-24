import express from 'express';
import config from 'config';
import {router as api_router} from "./api.routes.js";
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json({extended: true}))
app.use('/api', api_router);

if (process.env.NODE_ENV === 'production'){
    app.use('/', express.static(path.join(path.dirname(__dirname), 'software', 'build')));

     app.get('*', (req, res) => {
         res.sendFile(path.resolve(path.dirname(__dirname), 'software', 'build', 'index.html'));
     })
}

const PORT = config.get('port') || 8080;

app.get('/', (request, response) => {
    response.send('Бобро пожаловать');
});

app.listen(PORT, () => {
    console.log(`Let's start with port ${PORT}`)
})