import {Router} from "express";
import postgres from "postgres";
import {check, validationResult} from "express-validator";
import jwt from 'jsonwebtoken';
import config from "config";

const router = Router();
let sql = new postgres({
    host: config.get('db_host'),
    port: config.get('db_port'),
    database: config.get('db_name'),
    username: config.get('db_user'),
    password: config.get('db_user_password')
});

const USERS = {
    user: {
        password: 'test123',
        type: 'researcher'
    },
    admin: {
        password: 'admin',
        type: 'admin'
    }
}

router.post('/login',
    [
       check('login').isString(),
       check('password').isLength({min: 4})
    ], async (req, res) => {
        const error = validationResult(req);

        if (!error.isEmpty()){
            res.status(500).json({
                message: 'Введены некорректно логин или пароль'
            });
            return;
        }

        const {login, password} = req.body;

        if (!USERS[login] || USERS[login].password !== password){
            res.status(500).json({
                message: 'Введен неверно логин или пароль'
            });
            return;
        }

        const token = jwt.sign({login: login + Date.now().toString()}, 'develop', {algorithm: 'HS256'});

        res.status(200).json({token, type: USERS[login].type});
    });

router.post('/get_options', async (req, res) => {
        try{
            const result = await sql`select m.id, m.material_name, 
                            array(select v.value from valueofmodcoeff v order by id_math_mod) as math_values,
                            array(select math.math_mod_name from mathmodcoeff math order by id) as math_names
                            from materials m`;

            const reqResult = {};

            for await (let row of result){
                reqResult[row['id']] = {name: row['material_name'], 'math_value': {}};

                row['math_names'].forEach((value, i) => {
                    reqResult[row['id']]['math_value'][value] = row['math_values'][i];
                })

            }

            res.status(200).json(reqResult);
        } catch (e) {
            console.log(e.message);
            res.status(500).json({message: 'Ошибка на стороне сервера'});
        }
  })

export {router};