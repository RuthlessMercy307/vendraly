const express = require('express');
const path = require('path');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(path.join(__dirname, 'data.db'));

const app = express();
app.use(cors());
app.use(express.json());

// create tables if not exist
const initSql = `CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    email TEXT UNIQUE,
    tipo TEXT,
    reputacao INTEGER DEFAULT 0
);CREATE TABLE IF NOT EXISTS projetos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT,
    descricao TEXT,
    valor_meta REAL,
    retorno_percentual REAL,
    prazo_meses INTEGER,
    valor_atual REAL DEFAULT 0,
    dono_id INTEGER
);CREATE TABLE IF NOT EXISTS investimentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    projeto_id INTEGER,
    usuario_id INTEGER,
    valor REAL,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

db.exec(initSql);

app.post('/login', (req, res) => {
    const { email, tipo } = req.body;
    db.get('SELECT * FROM usuarios WHERE email=?', [email], (err, row) => {
        if (row) {
            res.json(row);
        } else {
            db.run('INSERT INTO usuarios (email, tipo) VALUES (?,?)', [email, tipo], function(err) {
                if(err) return res.status(500).end();
                res.json({id:this.lastID,email,tipo});
            });
        }
    });
});

app.post('/cadastro', (req,res)=>{
    const { nome, email, tipo } = req.body;
    db.run('INSERT INTO usuarios (nome,email,tipo) VALUES (?,?,?)',[nome,email,tipo],function(err){
        if(err) return res.status(500).end();
        res.json({id:this.lastID});
    });
});

app.post('/novo-projeto', (req, res) => {
    const { titulo, descricao, valor_meta, retorno_percentual, prazo_meses } = req.body;
    db.run(`INSERT INTO projetos (titulo,descricao,valor_meta,retorno_percentual,prazo_meses,dono_id) VALUES (?,?,?,?,?,1)`,
        [titulo,descricao,valor_meta,retorno_percentual,prazo_meses], function(err){
            if(err) return res.status(500).end();
            res.json({id:this.lastID});
        });
});

app.get('/projetos', (req,res)=>{
    db.all('SELECT * FROM projetos', (err, rows)=>{
        res.json(rows);
    });
});

app.get('/projeto/:id',(req,res)=>{
    db.get('SELECT * FROM projetos WHERE id=?',[req.params.id],(err,row)=>{
        if(!row) return res.status(404).end();
        res.json(row);
    });
});

app.post('/investir',(req,res)=>{
    const { projeto_id, valor } = req.body;
    db.run('INSERT INTO investimentos (projeto_id,usuario_id,valor) VALUES (?,?,?)',[projeto_id,1,valor],function(err){
        if(err) return res.status(500).end();
        db.get('SELECT retorno_percentual, prazo_meses FROM projetos WHERE id=?',[projeto_id],(err,row)=>{
            const retorno = (valor*(1+row.retorno_percentual/100)).toFixed(2);
            res.json({valor:retorno,prazo:row.prazo_meses});
        });
    });
});

app.listen(3000,()=>console.log('Servidor rodando na porta 3000'));
