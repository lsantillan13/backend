const fs = require('fs');
const productsDir = './data/productos.txt';
const DIR = './data/carrito.txt';
const ARR = [];
/*Array*/
//ARR.push(JSON.parse(read))
ARR.flat();

/*Unique ID */
function uniqueID() { return Math.floor(Math.random() * Math.floor(Math.random() * Date.now()));}

class Container {
  constructor() {}

  save(req, res) {
    let id = req.params.id;

    /*Si el documento Existe...*/
    if (fs.existsSync(DIR)) {
      /*===== Array de Productos =====*/
      const productsData = fs.readFileSync(productsDir, 'utf-8');
      const productsDataParsed = JSON.parse(productsData);
      /*===== Array de Carritos =====*/
      const data = fs.readFileSync(DIR, 'utf-8');
      const parsed = JSON.parse(data);






      let A = parsed.filter((x) => { return x.id == id; });
      /*Escribiendo el archivo  */
      /*ID === id*/
      if(A === id){ 
        parsed.push({ id: uniqueID(), timestamp: Date.now(), productos:productsDataParsed});
        fs.writeFileSync(DIR, JSON.stringify(parsed, 8, '\t'));
        ARR.push({ id: uniqueID(), timestamp: Date.now(), products:productsDataParsd});
      }
      else{
        console.log('algo');
      }

      res
        .status(200).send('<h1>Test</h1>');
      /*En caso que el documento no exista, lo crea y le otorga al carrito el id 1*/
    } else {
      fs.writeFile(DIR, '[]', (err) =>
        err
          ? console.log(`Error: ${err}`)
          : console.log('{', DIR, '} File Created succesfuly.')
      );
      //ARR.push({ title, price, img, id: 1 });
      res
        .status(200)
        .send({ Message: 'File Created & Product added under ID: 1' });
    }
  } // Todos => Crear una funcion que me permita repetir el mismo código en el {else if} y el{else}























  async getAll(req, res) {
    /*Si el documento exíste lo lee y envía al cliente su contenido*/
    if (fs.existsSync(DIR) === true) {
      const data = fs.readFileSync(DIR, 'utf-8');
      await res.send(data);
    } else {
      /*Si no existe lo crea y muestra un array vacío*/
      fs.writeFileSync(DIR, '[]');
      const data = fs.readFileSync(DIR, 'utf-8');
      await res.send(data);
    }
  }

  getById(req, res, next) {
    try {
      const DATA = fs.readFileSync(DIR, 'utf-8');
      let parsed = JSON.parse(DATA);
      const productId = req.params.id;
      /*Filtro el id*/
      let A = parsed.filter((x) => {
        return x.id == productId;
      });
      /*Si el ID Matchea con el parametro, lo devuelvo al cliente / Si hay error el next pasa al Catch*/
      A[0].id == productId ? res.send(A) : next();
    } catch (error) {
      res.send({ Error: 'Producto no encontrado' });
    }
  } // => Devuelve el objeto con el parametro solicitado.

  deleteById(req, res, next) {
    try {
      const productId = req.params.id;
      const DATA = fs.readFileSync(DIR, 'utf-8');
      const PARSED = JSON.parse(DATA);
      let A = PARSED.filter((x) => {
        return x.id !== productId;
      });
      //console.log(A[0].id)
      let B = PARSED.filter((x) => {
        return x.id == productId;
      });
      const STRING = JSON.stringify(A, 8, '\t');
      if (B[0].id == productId) {
        fs.writeFileSync(DIR, STRING);
        res.status(204).send();
        next();
      }
      return;
    } catch (error) {
      res.status(400).send({ Error: error }) && console.log(error);
    }
  } // => Elimína el objeto con el parametro solicitado.

  deleteAll() {
    try {
      fs.unlinkSync(DIR);
      console.log('{', DIR, '} File Deleted succesfuly.');
    } catch (e) {
      console.log('File cannot be deleted...', e);
    }
  } //              => Elimina del archivo el objeto con el id buscado.

  updateById(req, res, next) {
    try {
      const DATA = fs.readFileSync(DIR, 'utf-8');
      const PARSED = JSON.parse(DATA);

      const productId = req.params.id;
      const { title, price, img } = req.body;
      /*Finded*/
      let A = PARSED.filter((e) => {
        return e.id == productId;
      });
      /*Without*/
      let B = PARSED.filter((e) => {
        return e.id != productId;
      });
      /*NewArray*/
      let C = [];
      /*Añado al array el filtrado sin el producto buscado*/
      C.push(B);
      /*Si el producto coincide con el parametro*/
      if (A[0].id == productId) {
        /*Actualizo el producto con su body*/
        const updatedProd = (A[0] = { title, price, img, id: A[0].id });
        /*Pusheo el nuevo producto al array*/
        C[0].push(updatedProd);
        /*Ordeno los indices de menor a mayor según su ID*/
        const sorted = C[0].sort(function (a, b) {
          return a.id - b.id;
        });
        /*Sobreescribo el archivo con los datos antiguos y último cambio*/
        fs.writeFileSync(DIR, JSON.stringify(sorted, 8, '\t'));
        res.status(200).send();
        /*De haber error de índice el Next() va al Catch*/
        next();
      } else {
        return;
      }
    } catch (error) {
      res.send({ Error: 'Producto no encontrado' });
    }
  }
}
//new Container().test();

exports.ARR = ARR;
module.exports = Container;
