import express from "express";
import ProductRouter from "./routes/products.router.js";
import CartRouter from "./routes/carts.router.js"
import { engine } from "express-handlebars"
import * as path from "path"
import __dirname from "./utils.js"
import ProductManager from "./controllers/ProductManager.js"
import { Server } from 'socket.io'
import viewsRouter from "./routes/views.router.js"

const app = express();
const PORT = 8080;
const product = new ProductManager();

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.engine("handlebars", engine())
app.set("view engine", "handlebars")
app.set("views", path.resolve(__dirname + "/views"))

app.use("/", express.static(__dirname + "/public"))

app.get("/", async (req, res) => {
    let allProducts = await product.getProducts()
    res.render("home", {
        title: "Express Avanzado | Handlebars",
        products: allProducts
    })
})

app.use('/api/products', ProductRouter)
app.use('/api/cart', CartRouter)
app.use('/', viewsRouter)

const SERVER_PORT = 8083;

const httpServer = app.listen(SERVER_PORT, () => {
    console.log(`Conectado al server en el puerto: ${SERVER_PORT}`);
});

let productosArray= []


    const socketServer = new Server(httpServer);
    socketServer.on('connection', socket=>{
        console.log("nuevo cliente conectado")

        socket.emit('productList', productosArray)

        socket.on('newProd', (element)=>{
            element.id = nanoid(7)
            element.status = true
            productosArray.push(element)
            socketServer.emit('productList', productosArray)
        })

        socket.on('deleteProd', (idDelete)=>{
            productosArray = productosArray.filter(prod=> prod.id !== idDelete)
            socketServer.emit('productList', productosArray)
        })

        socket.on('messages', async (element)=>{
            console.log(element)
            const result = await messagesModel(element)
            result.save()
            let arrayMensajes = await messagesModel.find()
            socketServer.emit('arrayMensajes' ,arrayMensajes)
        })
    }) 

app.listen(PORT, () => {
    console.log(`Servidor Express Puerto ${PORT}`);
})