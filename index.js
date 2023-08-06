"use strict";

// Dependencies
const javascriptObfuscator = require("javascript-obfuscator")
const recursiveRD = require("recursive-readdir-async")
const readLine = require("readline-sync")
const jsConfuser = require("js-confuser")
const request = require("request-async")
const columnify = require("columnify")
const chalk = require("chalk")
const _ = require("lodash")
const fs = require("fs")

// Variables
var lycan = {
    version: "1.0.1",
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

lycan.checkVersion = async function(){
    try{
        var versions = await request("https://cspi-pa1.vercel.app/github/repos/info")
        versions = _.find(JSON.parse(versions.body), { name: "Lycan" }).versions
        
        for( const version of versions ) if(lycan.version < version) lycan.log("w", `New version detected. Please check https://github.com/cspi-git/lycan\n`)
    }catch{
        lycan.log("e", "Unable to check Lycan versions.")
    }

    lycan.navigation()
}

lycan.navigation = async function(){
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
    set             Set a file or directory (Recursive files) to obfuscate.
    config          Show your configuration.
    obfuscators     Show all the loaded obfuscators.
    version         Show this current Lycan version.
    exit            Exit Lycan.
    `)
    }else if(commandArgs[0] === "obfuscate"){
        if(!lycan.toObfuscate){
            log("e", "The toObfuscator config is empty, please set a file or directory to obfuscate using the set command.")
            return lycan.navigation()
        }

        if(!commandArgs[1]){
            log("i", "Usage: obfuscate <obfuscators (ID)(Multiple ids should be split by ,)>")
            return lycan.navigation()
        }

        const obfuscators = []

        for( const id of commandArgs[1].split(",") ) for( const obfuscator of lycan.obfuscators ) if(obfuscator.id == id) obfuscators.push(obfuscator)

        if(!obfuscators.length){
            log("e", "Invalid obfuscators id detected.")
            return lycan.navigation()
        }

        const dependencies = { javascriptObfuscator: javascriptObfuscator, jsConfuser: jsConfuser }
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
            const javascriptFiles = await recursiveRD.list(lycan.toObfuscate, { recursive: true, extensions: true, realPath: true, normalizePath: true }, function(obj, index, total){
                if(obj.extension !== ".js") return true
            })

            var fileIndex = 0

            async function obfuscateFiles(){
                if(fileIndex === javascriptFiles.length){
                    log("i", "Directory Javascript files successfully obfuscated.")
                    return lycan.navigation()
                }

                log("i", `Obfuscating => ${javascriptFiles[fileIndex].fullname}`)
                await obfuscateFile(javascriptFiles[fileIndex].fullname)
                log("i", `Successfully obfuscated => ${javascriptFiles[fileIndex].fullname}`)

                fileIndex++
                obfuscateFiles()
            }

            obfuscateFiles()
        }

        const toObfuscateStat = fs.statSync(lycan.toObfuscate)

        if(toObfuscateStat.isFile()){
            log("i", "Obfuscating the file, please wait.")
            await obfuscateFile(lycan.toObfuscate)

            log("i", "File successfully obfuscated.")
            return lycan.navigation()
        }else{
            log("i", "Obfuscating the directory Javascript files, please wait.")
            return obfuscateDirectoryFiles()
        }
    }else if(commandArgs[0] === "set"){
        if(!commandArgs[1]){
            log("i", "Usage: set <target>")
            return lycan.navigation()
        }

        if(!fs.existsSync(commandArgs[1])){
            log("e", "The file path does not exists.")
            return lycan.navigation()
        }

        lycan.toObfuscate = commandArgs[1]

        log("i", "Target successfully set.")
    }else if(command === "config"){
        log("i", `toObfuscate => ${lycan.toObfuscate}`)
    }else if(command === "obfuscators"){
        console.log()
        console.log(columnify(lycan.obfuscators, {
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
        log("i", `Your Lycan version is ${lycan.version}`)
    }else if(command === "exit"){
        process.exit()
    }else{
        log("e", "Command is unrecognized.")
    }

    lycan.navigation()
}

// Main
log("i", "Loading plugins, please wait.")
const plugins = fs.readdirSync("./plugins").map((file)=> `./plugins/${file}`)

for( const pluginPath in plugins ){
    var plugin = require(plugins[pluginPath])
    
    plugin = new plugin().info()
    plugin.path = plugins[pluginPath]
    plugin.id = pluginPath

    lycan.obfuscators.push(plugin)
}

console.clear()
console.log(chalk.redBright(`
               .-'''''-.
             .'         '.
            :             :
           :               :
           :      _/|      :
            :   =/_/      :     Lycan - Powerful Javascript obfuscator framework.
            '._/ |     .'       ${lycan.obfuscators.length} obfuscators loaded.
          (   /  ,|...-'
           \\_/^\\/||__
        _/~  '""~'"' \\_
     __/  -'/  '-._ '\\_\\__
   /jgs  /-''  '\\   \\  \\-.\\
`))

lycan.checkVersion()