const express=require("express")
const app=express()
const dotenv = require("dotenv");
dotenv.config();
const chats = require("./data/data");
const connectDB = require("./config/db");
const userRoutes = require("./Routers/userRouter")
const chatRoutes = require("./Routers/chatRoutes")
const messageRoutes = require("./Routers/messageRoutes")
const {notFound,errorHandler} = require("./middleware/errorMiddleware")
connectDB();

app.use(express.json())

app.get("/", function(req,res){
    res.send("API is running");
})

app.use("/api/user", userRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/message", messageRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, function(req,res){
    console.log(`Listening on port ${PORT}`);
})

const io = require("socket.io")(server,{
    pingTimeout:60000,
    cors:{
        origin:"http://localhost:3000"
    }
})

io.on("connection", (socket)=>{
    console.log("connected to socket.io")

    socket.on("setup",(userData)=>{
        socket.join(userData._id)
        console.log(userData._id)
        socket.emit("connected")
    })

    socket.on("join chat",(room)=>{
        socket.join(room)
        console.log("User joined room: "+room)
    })

    socket.on("typing",(room)=>socket.in(room).emit("typing"))
    socket.on("stop typing",(room)=>socket.in(room).emit("stop typing"))

    socket.on("new message",(newMessageReceived)=>{
        var chat = newMessageReceived.chat;

        if(!chat.users) return console.log("chat.users not defined")

        chat.users.forEach((user) => {
            if(user._id==newMessageReceived.sender._id) return;
            socket.in(user._id).emit("message received", newMessageReceived)
        });
    })

    socket.off("setup",()=>{
        console.log("User Disconnected")
        socket.leave(userData._id)
    })
})

