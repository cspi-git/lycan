"use strict";

// Main
class Plugin {
    info(){
        return {
            name: "Confuse",
            flow: "jsconfuser + javascript-obfuscator",
            encryptionLevel: "medium",
            author: [
                "I2rys"
            ]
        }
    }

    obfuscate(code, dependencies){
        const javascriptObfuscator = dependencies.javascriptObfuscator
        const jsConfuser = dependencies.jsConfuser

        return new Promise((resolve)=>{
            jsConfuser.obfuscate(code, { target: "node", preset: "medium" }).then((obfuscatedCode)=>{
                obfuscatedCode = javascriptObfuscator.obfuscate(obfuscatedCode, { target: "node", stringArrayEncoding: [ "rc4", "base64" ], identifierNamesGenerator: "dictionary", identifiersDictionary: [ "lllll6y4ca56nC1o2nfu6se6llll", "llll6y4ca56nC1o2nfu6se6llI", "llll6y4ca56nC1o2nfu6se6lII", "llll6y4ca56nC1o2nfu6se6III", "llll6y4ca56nC1o2nfu6se6IIII", "lllI6y4ca56nC1o2nfu6se6IIII", "llII6y4ca56nC1o2nfu6se6IIII", "lIII6y4ca56nC1o2nfu6se6IIII", "IIII6y4ca56nC1o2nfu6se6IIII" ], compact: true, simplify: false, ignoreImports: true, debugProtection: true, seed: 100, stringArray: true, stringArrayRotate: true, stringArrayIndexShift: true, splitStrings: true, splitStringsChunkLength: 100, stringArrayThreshold: 1, numbersToExpressions: true, deadCodeInjection: true, deadCodeInjectionThreshold: 1 })
            
                if(!obfuscatedCode) return resolve(false)
            
                resolve(obfuscatedCode.getObfuscatedCode())
            }).catch(()=>{return resolve(false)})
        })
    }
}

module.exports = Plugin