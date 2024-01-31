const express = require('express');
const app = express();
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const bodyParser = require('body-parser');

app.set('view engine', 'pug');
app.set('views', './views');

const RottaUploads = path.join(__dirname, "uploads");
const RottaPublic = path.join(__dirname, "public");


app.use(express.static(RottaPublic));
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static(RottaUploads));

// Dati del blog 
/*const posts = [
  { id: 1, title: 'casa', content: 'Contenuto del primo post. Contenuto del primo post. ' },
  { id: 2, title: 'macchina', content: 'Contenuto del secondo post. Contenuto del secondo post.' },
  // Aggiungi altri post se necessario...
];*/

const admins = [
  { username: 'admin1', password: 'password1' },
  { username: 'admin2', password: 'password2' }
];

const users = [
  { username: 'utente1', password: 'password1' },
  { username: 'utente1', password: 'password2' }
];


//PARTE PRESA DA SIMONE
app.use(bodyParser.urlencoded({ extended: true }));
/* gestione json  */
const posts = read();

function read() {
  try {
    const datiJson = fs.readFileSync("posts.json", 'utf-8');
    // Converte il contenuto JSON in un oggetto JavaScript
    return JSON.parse(datiJson);
  } catch (error) {
    console.log(error);
    return [];
  }
}

function write(datiJson) {//scrive nel file json con unaindendazione di uno spazio
  fs.writeFileSync("posts.json", JSON.stringify(datiJson, null, 1), 'utf-8');
}

function save() {
  write(posts);
}

//setto lo storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, RottaUploads);//cartella di destinaizone
  },
  filename(req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);//nome del file
  }
});
const upload = multer({//inizializzazione dell'accesso allo storage
  storage: storage
});


//FINE PARTE DI SIMONE


//app.get è per la ricezione di tipo get dal client
//res.render è per inviare al client il file pug definito
app.get('/', (req, res) => {
  res.render('login');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  /*req.body contiene tutti i valori passati dal body come oggetto sotto questa forma:
  {
  username: 'usernameInserito',
  password: 'passwordInserito'
}
poi vengono destrutturati
*/
  const { username, password } = req.body;

  // admin => è una funzione dove l'oggetto admin assume a scorrimento i valori di admins
  // .some serve per verificare se almeno un "admin" rispetta i criteri
  const isAdmin = admins.some(admin => admin.username === username && admin.password === password);
  const isUser = users.some(user => user.username === username && user.password === password);

  if (isAdmin) {
    res.redirect('/admin');
  } else if (isUser) {
    res.redirect('/index');
  } else {
    // Credenziali non valide, invia messaggio di errore
    res.render('login', { error: 'Credenziali non valide' });
  }
});

app.get('/admin', (req, res) => {
  res.render('admin', { posts });
});

app.get('/index', (req, res) => {
  res.render('index', { posts });
});


app.get('/posts/:id', (req, res) => {
  let post = posts.find(post => post.id == req.params.id);
  res.render('post', { post });
});





app.get('/admin/new', (req, res) => {
  res.render('add-post');
});

app.get('/admin/elimina/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  const postIndex = posts.findIndex(post => post.id === postId);
  //findIndex restituisce -1 se non è stata trovata alcuna corrispondenza
  if (postIndex !== -1) {
    //splice elimina l'elemento dell'array alla posizione specificata
    posts.splice(postIndex, 1);
    save();
  }
  res.redirect('/admin');
});

app.get('/admin/modifica/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  const post = posts.find(p => p.id === postId);
  res.render('modifica-post', { post });
})
app.post('/admin/posts', upload.single('image'), (req, res) => {
  const { title, content } = req.body;
  const newPost = {
    id: posts.length + 1,
    title,
    content,
    imagePath: req.file ? req.file.filename : ''
  };
  posts.push(newPost);
  //console.log(req.file.filename);
  save();
  res.redirect('/admin');
});
//CONTROLLARE LA MODIFICA
app.post('/admin/modifica/:id', upload.single('image'), (req, res) => {
  const postId = parseInt(req.params.id);
  const { title, content } = req.body;
  const postIndex = posts.findIndex(post => post.id === postId);
  if (postIndex !== -1) {
    posts[postIndex].title = title;
    posts[postIndex].content = content;
    if (req.file) {
        //posts[postIndex].imagePath = req.file.path;
        posts[postIndex].imagePath = req.file.filename;

    }
    save();
}
res.redirect('/admin');
});



app.listen(3000, () => {
  console.log('Server avviato su http://localhost:3000');
});