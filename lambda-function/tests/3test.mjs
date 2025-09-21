import { exec } from "child_process"

const promise =  new Promise((resolve)=>{
    const command = exec('git clone https://github.com/adityasharma-tech/GolfGodot', (err)=>{
        console.error(err)
    })
    
    command.addListener("message", (message)=>{
        console.log(message.toString())
    })

    command.addListener("error", (err)=>{
        console.error(err)
    })

    command.addListener("exit", (code)=>resolve(code))
})

promise.then(console.log).catch(console.error)