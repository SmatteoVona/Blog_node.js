const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.set('view engine', 'pug');
app.set('views', './views');

// Dati del blog 
const posts = [
  { id: 1, title: 'casa', content: 'Contenuto del primo post. Contenuto del primo post. ' },
  { id: 2, title: 'macchina', content: 'Contenuto del secondo post. Contenuto del secondo post.' },
  // Aggiungi altri post se necessario...
];

const admins = [
  { username: 'admin1', password: 'password1' },
  { username: 'admin2', password: 'password2' }
];

const users = [
  { username: 'utente1', password: 'password1' },
  { username: 'utente1', password: 'password2' }
];


app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));

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
  username: 'valoreInserito',
  password: 'valoreInserito'
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
  res.render('admin',{ posts });
});

app.get('/index', (req, res) => {
  res.render('index', { posts });
});


app.get('/posts/:id', (req, res) => {
  //postId ottiene il numero dell'id (se l'id fosse una stringa funzionerebbe comunque)
  const postId = parseInt(req.params.id);
  const post = posts.find(post => post.id === postId);
  res.render('post', { post });
});


app.post('/admin/posts', (req, res) => {
  const { title, content } = req.body;
  const newPost = {
    id: posts.length + 1,
    title,
    content
  };
  posts.push(newPost);
  res.redirect('/');
});


app.get('/admin/new', (req, res) => {
  res.render('add-post');
});

app.get('/admin/delete/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  const postIndex = posts.findIndex(post => post.id === postId);
  //findIndex restituisce -1 se non è stata trovata alcuna corrispondenza
  if (postIndex !== -1) {
    //splice elimina l'elemento dell'array alla posizione specificata
    posts.splice(postIndex, 1);
  }
  res.redirect('/admin');
});


app.listen(3000, () => {
  console.log('Server avviato su http://localhost:3000');
});