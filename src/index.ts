import { initServer} from "./app";

async function init(){
    const app = await initServer()

    app.listen(8000, () => {
        return console.log("Server started at port 8000");
    })
}

init();