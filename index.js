"use strict";

// Dependencies
const javascriptObfuscator = require("javascript-obfuscator")
const recursiveRD = require("recursive-readdir-async")
const readLine = require("readline-sync")
const jsConfuser = require("js-confuser")
const request = require("request-async")
const columnify = require("columnify")
const base64 = require("base-64")
const chalk = require("chalk")
const _ = require("lodash")
const fs = require("fs")

// Variables
var Lycan = {
    version: "1.0.0",
    obfuscators: [],
    toObfuscate: null
}

// Functions
function log(type, message){
    if(type === "i"){
        console.log(`[${chalk.blueBright("*")}] ${message}`)
    }else if(type === "w"){
        console.log(`[${chalk.yellowBright("*")}] ${message}`)
    }else if(type === "e"){
        console.log(`[${chalk.red("*")}] ${message}`)
    }
}

Lycan.checkVersion = async function(){
    try{
        var versions = await request("http://167.172.85.80/api/projects")
        versions = _.find(JSON.parse(versions.body).data, { name: "Lycan" }).versions
        
        for( const version of versions ) if(Lycan.version < version) log("w", `New version detected. Please check https://github.com/OTAKKATO/Lycan\n`)
    }catch{
        log("e", "Unable to check Lycan versions.")
    }

    Lycan.navigation()
}

Lycan.navigation = async function(){
    const command = readLine.question(`${chalk.red("lycan>")} `)
    const commandArgs = command.split(" ")

    if(command === "help"){
        console.log(`
General commands
================

    Command         Description
    -------         -----------
    help            Show this.
    obfuscate       Obfuscate the target.
    set             Set a file or directory(Recursive files) to obfuscate.
    config          Show your configuration.
    obfuscators     Show all the loaded obfuscators.
    version         Show this current Lycan version.
    exit            Exit Lycan.
    `)
    }else if(commandArgs[0] === "obfuscate"){
        if(!Lycan.toObfuscate){
            log("e", "The toObfuscator config is empty, please set a file or directory to obfuscate using the set command.")
            return Lycan.navigation()
        }

        if(!commandArgs[1]){
            log("i", "Usage: obfuscate <obfuscators(ID)(Multiple ids should be split by ,)>")
            return Lycan.navigation()
        }

        const obfuscators = []

        for( const id of commandArgs[1].split(",") ) for( const obfuscator of Lycan.obfuscators ) if(obfuscator.id == id) obfuscators.push(obfuscator)

        if(!obfuscators.length){
            log("e", "Invalid obfuscators id detected.")
            return Lycan.navigation()
        }

        const dependencies = { javascriptObfuscator: javascriptObfuscator, base64: base64, jsConfuser: jsConfuser }
        var obfuscatedIndex = 0
        
        function obfuscateFile(filePath){
            var obfuscatedCode = fs.readFileSync(filePath, "utf8")

            return new Promise((resolve)=>{
                async function obfuscate(){
                    if(obfuscatedIndex === obfuscators.length){
                        fs.writeFileSync(filePath, obfuscatedCode, "utf8")
                        return resolve(obfuscatedCode)
                    }

                    var plugin = require(obfuscators[obfuscatedIndex].path)
                    plugin = new plugin()

                    obfuscatedCode = await plugin.obfuscate(obfuscatedCode, dependencies)
    
                    obfuscatedIndex++
                    obfuscate()
                }

                obfuscate()
            })
        }

        async function obfuscateDirectoryFiles(){
            const javascriptFiles = await recursiveRD.list(Lycan.toObfuscate, { recursive: true, extensions: true, realPath: true, normalizePath: true }, function(obj, index, total){
                if(obj.extension !== ".js"){
                    return true
                }
            })

            var fileIndex = 0

            async function obfuscateFiles(){
                if(fileIndex === javascriptFiles.length){
                    log("i", "Directory Javascript files successfully obfuscated.")
                    return Lycan.navigation()
                }

                log("i", `Obfuscating => ${javascriptFiles[fileIndex].fullname}`)
                await obfuscateFile(javascriptFiles[fileIndex].fullname)
                log("i", `Successfully obfuscated => ${javascriptFiles[fileIndex].fullname}`)

                fileIndex++
                obfuscateFiles()
            }

            obfuscateFiles()
        }

        const toObfuscateStat = fs.statSync(Lycan.toObfuscate)

        if(toObfuscateStat.isFile()){
            log("i", "Obfuscating the file, please wait.")
            await obfuscateFile(Lycan.toObfuscate)

            log("i", "File successfully obfuscated.")
            return Lycan.navigation()
        }else{
            log("i", "Obfuscating the directory Javascript files, please wait.")
            return obfuscateDirectoryFiles()
        }
    }else if(commandArgs[0] === "set"){
        if(!commandArgs[1]){
            log("i", "Usage: set <target>")
            return Lycan.navigation()
        }

        if(!fs.existsSync(commandArgs[1])){
            log("e", "The file path does not exists.")
            return Lycan.navigation()
        }

        Lycan.toObfuscate = commandArgs[1]

        log("i", "Target successfully set.")
    }else if(command === "config"){
        log("i", `toObfuscate => ${Lycan.toObfuscate}`)
    }else if(command === "obfuscators"){
        console.log()
        console.log(columnify(Lycan.obfuscators, {
            columns: ["id", "name", "flow", "encryptionLevel", "author"],
            columnSplitter: " | ",
            config: {
                id: {
                    headingTransform: function(){
                        return "ID"
                    }
                },
                name: {
                    headingTransform: function(){
                        return "Name"
                    }
                },
                flow: {
                    headingTransform: function(){
                        return "Flow"
                    }
                },
                encryptionLevel: {
                    headingTransform: function(){
                        return "Encryption Level"
                    }
                },
                author: {
                    dataTransform: function(author){
                        return author.replace(",", ", ")
                    },
                    headingTransform: function(){
                        return "Author"
                    }
                }
            }
        }, ))
        console.log()
    }else if(command === "version"){
        log("i", `Your Lycan version is ${Lycan.version}`)
    }else if(command === "exit"){
        process.exit()
    }else{
        log("e", "Command is unrecognized.")
    }

    Lycan.navigation()
}

// Main
log("i", "Loading plugins, please wait.")
const plugins = fs.readdirSync("./plugins").map((file)=> `./plugins/${file}`)

for( const pluginPath in plugins ){
    var plugin = require(plugins[pluginPath])
    plugin = new plugin().info()
    plugin.path = plugins[pluginPath]
    plugin.id = pluginPath

    Lycan.obfuscators.push(plugin)
}

console.clear()

console.log(chalk.redBright(`
               .-'''''-.
             .'         '.
            :             :
           :               :
           :      _/|      :
            :   =/_/      :     Lycan - Powerful Javascript obfuscator framework.
            '._/ |     .'       ${Lycan.obfuscators.length} obfuscators loaded.
          (   /  ,|...-'
           \\_/^\\/||__
        _/~  '""~'"' \\_
     __/  -'/  '-._ '\\_\\__
   /jgs  /-''  '\\   \\  \\-.\\
`))

Lycan.checkVersion()