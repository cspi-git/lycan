"use strict";

// Main
class Plugin {
    info(){
        return {
            name: "Buff",
            flow: "jsconfuser + jsconfuser",
            encryptionLevel: "high",
            author: [
                "I2rys"
            ]
        }
    }

    obfuscate(code, dependencies){
        const jsConfuser = dependencies.jsConfuser

        return new Promise((resolve)=>{
            jsConfuser.obfuscate(code, { target: "node", preset: "high", stringEncoding: false, identifierGenerator: "zeroWidth" }).then((obfuscatedCode)=>{
                jsConfuser.obfuscate(obfuscatedCode, { target: "node", preset: "high", stringEncoding: false, identifierGenerator: "zeroWidth" }).then((obfuscatedCode)=>{
                    resolve(obfuscatedCode)
                }).catch(()=>{
                    return resolve(false)
                })
            }).catch(()=>{
                return resolve(false)
            })
        })
    }
}

module.exports = Plugin