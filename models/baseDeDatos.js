const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Crear la base de datos
const dbname = path.join(__dirname, '../db', 'base.db');
const db = new sqlite3.Database(dbname, err => {
  if (err) return console.error(err.message);
  console.log('Conexion Exitosa con la Base de Datos')
});

db.serialize(() => {
  // Crear la tabla "categorias" si no existe
  db.run(`
  CREATE TABLE IF NOT EXISTS categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL
  )
`);











  //------------------------------------------------------------------
  // Crear la tabla "Productos" si no existe
  db.run(`
  CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    codigo INTEGER NOT NULL,
    precio INTEGER NOT NULL,
    descripcion TEXT NOT NULL,
    calidad TEXT NOT NULL,
    cantidad TEXT NOT NULL,
    categoria_id INTEGER,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
  )
`);
  //-----------------------------------------------------------------
  db.run(`
  CREATE TABLE IF NOT EXISTS imagenes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id TEXT NOT NULL,
    url TEXT NOT NULL,
    destacado TEXT
  )
`);

  db.run(`
  CREATE TABLE IF NOT EXISTS cliente (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    address TEXT NOT NULL,
    country TEXT NOT NULL
  )
`);

  db.run(`
  CREATE TABLE IF NOT EXISTS ventas (
    cliente_id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id TEXT NOT NULL,
    cantidad INTEGER NOT NULL,
    total_pagado INTEGER NOT NULL,
    fecha TEXT NOT NULL,
    ip_cliente TEXT NOT NULL,
    FOREIGN KEY (cliente_id) REFERENCES cliente(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
  )
`);



});

rutabloqueada = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const tokenAuthorized = await promisify(jwt.verify)(req.cookies.jwt, 'token');
      if (tokenAuthorized) {
        return next();
      }
      req.user = row.id;
    } catch (error) {
      console.log(error);
      return next();
    }
  } else {
    res.redirect("/logincliente");
  }
};


rutaloginbloqueada = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const tokenAuthorized = await promisify(jwt.verify)(req.cookies.jwt, 'token');
      if (tokenAuthorized) {
        res.redirect("/web");
      }
    } catch (error) {
      console.log(error);
      res.redirect("/web");
    }
  } else {
    return next();
  }
};




function aggDato(req, res) {
  const { nombre, codigo, precio, descripcion, calidad, cantidad } = req.body;

  const sql = `INSERT INTO productos(nombre, codigo, precio, descripcion, calidad, cantidad) 
    VALUES (?, ?, ?, ?, ?, ?)`;

  db.run(sql, [nombre, codigo, precio, descripcion, calidad, cantidad], err => {
    if (err) return console.error(err.message);
    db.get(`SELECT * FROM productos`, (err, row) => {
      db.run(`INSERT INTO imagenes (producto_id,url,destacado) VALUES (?,?,?)`, [row.id, '', ''], (err) => {
        if (err) {
          console.log(err)
        }
        else {
          console.log('Registros Ingresados Correctamente a la base de datos ');
          res.redirect('/productos');
        }
      })
    })

  });
}

function mostrarProductos(req, res) {
  const sql = `SELECT * FROM productos`;
  db.all(sql, [], (err, rows) => {
    console.log(rows,);
    if (err) return console.error(err.message);
    console.log('Leyendo Tabla productos...')
    res.render('productos.ejs', { modelo: rows });
  })
}

function mostrarUpdate(req, res) {

  const id = req.params.id;
  const sql = `SELECT * FROM productos WHERE id = ?`;
  db.get(sql, [id], (err, row) => {
    if (err) return console.error(err.message);
    res.render('update.ejs', { modelo: row });
  })

}

function update(req, res) {
  const id = req.params.id;

  const { nombre, codigo, precio, descripcion, calidad, cantidad } = req.body;

  const sql = `UPDATE productos SET nombre = ?, codigo = ?, precio = ?, descripcion = ?, calidad = ?, cantidad = ? WHERE id = ?`;

  db.run(sql, [nombre, codigo, precio, descripcion, calidad, cantidad, id], err => {
    if (err) return console.error(err.message);
    console.log(`producto actualizado = Producto : ${id}`);
    res.redirect('/productos');
  });

}

function mostrarDelete(req, res) {
  const id = req.params.id;
  const sql = `SELECT * FROM productos WHERE id = ?`;
  db.get(sql, [id], (err, row) => {
    if (err) {
      res.status(500).send({ error: err.message });
      return console.error(err.message);
    }
    res.render('delete.ejs', { modelo: row });
  });
}













function deletee(req, res) {
  const id = req.params.id;
  console.log('Consulta Eliminar');
  const sql = `
    DELETE FROM productos WHERE id = ?
  `;
  db.run(sql, [id], err => {
    if (err) {
      res.status(500).send({ error: err.message });
      return console.error(err.message);
    }
    console.log('Producto eliminado');
    res.redirect('/productos');
  });
}

//_-------------------------------------------------
function aggIMG(req, res) {
  const { destacado, img } = req.body;

  const sql = `INSERT INTO imagenes(producto_id,url,destacado) 
    VALUES (?,?,?)`;
  db.get(`SELECT * FROM productos`, (err, row) => {
    db.run(sql, [row.id,img, destacado], err => {
      if (err) return console.error(err.message);
      console.log('URL de imagen Insertada Correctamente');
      res.redirect('/productos');
    });
  })
}
//----------------------------------------------------

function getCategorias(req, res) {
  const sql = `SELECT * FROM categorias`;
  db.all(sql, [], (err, rows) => {
    console.log(rows,);
    if (err) return console.error(err.message);
    console.log('Leyendo Tabla categorias...')
    res.render('categorias.ejs', { modelo: rows });
  })
}

function postCategorias(req, res) {
  const { nombre } = req.body
  const sql = `INSERT INTO categorias(nombre) 
    VALUES (?)`;

  db.run(sql, [nombre], err => {
    if (err) return console.error(err.message);
    console.log('categoria ingresada correctamente');
    res.redirect('/categorias');
  });

}

function mostrarUpdateC(req, res) {
  //Este metodo es el GET
  const id = req.params.id;
  const sql = `SELECT * FROM categorias WHERE id = ?`;
  db.get(sql, [id], (err, row) => {
    console.log(row);
    if (err) return console.error(err.message);
    res.render('updateCategorias.ejs', { modelo: row });
  })
}

function updateCateg(req, res) {
  //Este metodo es el POST
  const id = req.params.id;

  const { nombre } = req.body;

  const sql = `UPDATE categorias SET nombre = ? WHERE id = ?`;

  db.run(sql, [nombre, id], err => {
    if (err) return console.error(err.message);
    console.log(`Categoria actualizada = Categoria : ${id}`);
    res.redirect('/categorias');
  });

}


async function registerCliente(req, res) {
  const { email, password, address, country } = req.body;
  const llave = "6LeDoU0pAAAAAIBcBUhaf8sIyoF2RJojZ-blAmTI";
  const gRecaptchaResponse = req.body['g-recaptcha-response'];
  const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${llave}&response=${gRecaptchaResponse}`, {
    method: 'POST',
  });
  const Captcha = await response.json();
  if (Captcha.success == true) {
    db.get(`SELECT * FROM cliente WHERE email = ?`, [email], (err, row) => {
      if (row) {
        res.redirect('/registerclient')
      } else {
        db.get(`INSERT INTO cliente(email,password,address,country) VALUES(?,?,?,?)`, [email, password, address, country], (err, rows) => {
          if (err) {
            console.log(err)
          } else {
            res.redirect('/logincliente');
          }
        })
      }
    })
  } else {
    res.status(500).send('¡No se verifico el captcha!');
  }




}

async function loginCliente(req, res) {
  const { email, password } = req.body;
  db.get(`SELECT * FROM cliente WHERE email = ? AND password = ?`, [email, password], (err, row) => {
    if (row) {
      const id = row.id;
      console.log(row)
      const token = jwt.sign({ id: id }, 'token');
      res.cookie("jwt", token);
      res.redirect('/web');
    }
    else {
      console.log('Datos incorrectos');
      res.redirect('/clientWebLogin');
    }
  })



}


function mostrarProductosCliente(req, res) {
  db.all(`SELECT * FROM productos`, [], (err, product) => {
    db.all(`SELECT * FROM categorias`, [], (err, category) => {
      if (err) {
        console.log(err)
      }
      else {
        console.log('Categoria: ' + category)
      }
      db.all(`SELECT * FROM imagenes`, [], (err, images) => {
        console.log(images)
        res.render('web.ejs', {
          product: product,
          category: category,
          images: images
        })
      })
    })
  })
}

function filter(req, res) {
  const { name, quality, description } = req.body;
  const sqlq = "SELECT productos.*, imagenes.url FROM productos LEFT JOIN imagenes ON productos.id = imagenes.producto_id WHERE productos.nombre = ? OR productos.descripcion = ? OR productos.calidad = ?"
  const sqlc = "SELECT * FROM categorias";
  try {
    db.all(sqlq, [name, description, quality], (err, product) => {
      console.log(product)
      db.all(sqlc, [], (err, category) => {
        res.render('web', {
          product: product,
          category: category,
          images: product
        })
      })
    })
  } catch (error) {
    console.log(error);
  }

}

function clientsview(req, res) {
  db.all(`SELECT productos.*, cliente.*, ventas.total_pagado, ventas.cantidad FROM productos JOIN ventas ON productos.id = ventas.producto_id JOIN cliente ON cliente.id = ventas.cliente_id;`, (err, query) => {
    if (err) {
      console.log(err)
    } else {
      res.render('vistaclientes', {
        product: query,
      })
    }
  })
}

function Cart(req, res) {
  const { id } = req.params;
  db.get(`SELECT * FROM productos WHERE id = ?`, [id], (err, product) => {
    db.get(`SELECT * FROM imagenes WHERE id = ?`, [id], (err, images) => {
      res.render('cart', {
        product: product,
        images: images
      })
    })
  })
}




async function webCartPayment(req, res) {
  const { id } = req.params;
  const { tarjeta, cvv, mes, ano, cantidad, total } = req.body;
  console.log(req.body)
  const fecha = new Date();
  const fechaC = fecha.toString();
  const ipClient = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
  try {
    const response = await fetch('https://fakepayment.onrender.com/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UiLCJkYXRlIjoiMjAyNC0wMS0xM1QwNzoyMzozNC42ODNaIiwiaWF0IjoxNzA1MTMwNjE0fQ.iDAk-6xC9ForjFuGCQtSZ0L9J-HicwBsyqwoS8RTJoE`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: total,
        "card-number": tarjeta,
        cvv: cvv,
        "expiration-month": mes,
        "expiration-year": ano,
        "full-name": "APPROVED",
        currency: "USD",
        description: "Transsaction Successfull",
        reference: "payment_id:11"
      })
    });
    const data = await response.json();
    if (data.success == true) {
      const tokenAuthorized = await promisify(jwt.verify)(req.cookies.jwt, 'token');
      const cliente_id = tokenAuthorized.id;

      db.run(`INSERT INTO ventas(cliente_id,producto_id,cantidad,total_pagado,fecha,ip_cliente) VALUES(?,?,?,?,?,?)`, [cliente_id, id, cantidad, total, fechaC, ipClient], (err, row) => {
        if (err) {
          console.log(err)
        } else {
          res.redirect('/web');
        }
      })
    }

  } catch (error) {
    console.log(error)
  }
}

function webK(req,res){
  const { id } = req.params;
  const { cantidad,precio } = req.body;
  const total = cantidad * precio
  db.get(`SELECT * FROM productos WHERE id = ?`, [id], (err, product) => {
    db.get(`SELECT * FROM imagenes WHERE producto_id = ?`, id, (err, img) => {
      res.render('webcart', {
        product: product,
        image: img,
        cant: cantidad,
        total: total
      })
    }
    )
  })
}



//_-------------------------------------------------
module.exports = {
  aggDato,
  mostrarProductos,
  mostrarUpdate,
  update,
  mostrarDelete,
  deletee,
  aggIMG,
  getCategorias,
  postCategorias,
  mostrarUpdateC,
  updateCateg,
  registerCliente,
  loginCliente,
  mostrarProductosCliente,
  Cart,
  rutabloqueada,
  webCartPayment,
  filter,
  clientsview,
  webK
}
