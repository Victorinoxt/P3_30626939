//Librerias y dependencias
require('dotenv').config();
const http = require('http');
const express = require('express');
const app = express();
const path = require('path');
const baseDatosModels = require('./models/baseDeDatos.js');
const {PASSWORD,ADMIN} = process.env;
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
let login= false;
//recursos que se van a cargar en el server 
app.use(express.static(__dirname+'/static'));

//-----------------------------------------------------------------
//Configuración del Servidor
app.set('view engine','ejs');//definimos el motor de plantilla con archivos ejs
app.set('views',path.join(__dirname,"./views"));//definimos la ruta del motor de plantilla
app.use(express.urlencoded({extended:false}));//permite recuperar los valores publicados en un request
port = app.listen(5000);
console.log('Servidor corriendo exitosamente en el puerto 5000');
app.use(cookieParser());



//-----------------------------------------------------------
//enruptamiento
app.get('/',(req,res)=>{
  res.render('index.ejs')
});

app.get('/login',(req,res)=>{
res.render('iniciarSesion.ejs');
});

//Enrutamiento del lado del cliente
app.get('/logincliente',(req,res) => {
  res.render('login.ejs')
})


app.post('/loginCliente',(req,res) => {
  baseDatosModels.loginCliente(req,res);
})



app.get('/registercliente',(req,res) => {
  res.render('register.ejs');
})

app.post('/registercliente',async(req,res) => {
  baseDatosModels.registerCliente(req,res);
})


app.get('/logout',(req,res) => {
  baseDatosModels.logout(req,res);
})









app.get('/web',(req,res) => {
  baseDatosModels.mostrarProductosCliente(req,res)
})

app.get('/webcart',(req,res) => {
  res.render('webcart');
})


app.post('/webcart/:id',baseDatosModels.rutabloqueada, async(req,res) => {
  baseDatosModels.webK(req,res)
})

app.post('/webcartpayment/:id',(req,res) => {
  baseDatosModels.webCartPayment(req,res);
})


app.post('/filter',(req,res) => {
  baseDatosModels.filter(req,res);
})


app.get('/cart/:id',(req,res) => {
  baseDatosModels.Cart(req,res);
})



app.post('/login',(req,res)=>{

 const {admin,password} = req.body;

   if(admin === ADMIN && password === PASSWORD){
    login=true;
    res.redirect('/productos');
   }else{
    login=false;
    res.redirect('/iniciarSesion');
   }

});
  


app.get('/clientsview',(req,res) => {
  baseDatosModels.clientsview(req,res);
})

app.get('/add',(req,res)=>{
res.render('add.ejs');
});

//---------------------------------------------------------
app.get('/addImagen/:id',(req,res)=>{
baseDatosModels.addIMG(req,res)
});


app.post('/addImagen/:id',(req,res)=>{
baseDatosModels.aggIMG(req,res);
});



app.post('/addPost',(req,res)=>{   
baseDatosModels.aggDato(req,res);
});


app.get('/productos',(req,res)=>{
  baseDatosModels.mostrarProductos(req,res);
});
//-------------------------------------------------------
// GET /editar/:id
app.get('/update/:id',(req, res) => {
baseDatosModels.mostrarUpdate(req,res);

});
//-------------------------------------------------------
// POST /editar/:id
app.post('/update/:id', (req, res) => {
 baseDatosModels.update(req,res);
});

//-------------------------------------------------------
// GET /eliminar/:id
app.get('/delete/:id', (req, res) => {
baseDatosModels.deletee(req,res);
});
//-------------------------------------------------------
// POST /eliminar/:id

//------------------------------------------------------
app.get('/categorias', (req, res) => {
 baseDatosModels.getCategorias(req,res);
});
//-------------------------------------------------------
app.get('/addCategorias', (req, res) => {
 res.render('addcategoria.ejs');
});
//-------------------------------------------------------
app.post('/addcategorias', (req, res) => {
 baseDatosModels.postCategorias(req,res);
});
//-------------------------------------------------------
app.get('/updateCategoria/:id',(req,res)=>{
 baseDatosModels.mostrarUpdateC(req,res);
});
//-------------------------------------------------------
app.post('/updateCategoria/:id',(req,res)=>{
baseDatosModels.updateCateg(req,res);
});
//-------------------------------------------------------
//Metodo para manejar rutas no encontradas
app.get('/*',(req,res)=>{
res.render('notfound.ejs')
});

//-------------------------------------------------------







//ejemplo para un commit
