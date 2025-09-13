import app from "./app"
import { env } from "./validators/env"

app.listen(env.PORT, (error)=>{
    if (error)
    console.error(`Failed to start server on port ${env.PORT}`);
    else 
        console.info(`Server started on port http://127.0.0.1:${env.PORT}`)
})