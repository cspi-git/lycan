"use strict";

// Main
class plugin {
    info(){
        return {
            name: "Base64Obf",
            flow: "javascript-obfuscator + base64",
            encryptionLevel: "high",
            author: [
                "I2rys"
            ]
        }
    }

    obfuscate(code, dependencies){
        const javascriptObfuscator = dependencies.javascriptObfuscator
        const jsConfuser = dependencies.jsConfuser

        return new Promise((resolve)=>{
            var obfuscatedCode = ""
            obfuscatedCode = javascriptObfuscator.obfuscate(code, { target: "node", stringArrayEncoding: [ "rc4", "base64" ], identifierNamesGenerator: "mangled-shuffled", seed: 200, compact: true, stringArrayIndexesType: ["hexadecimal-number", "hexadecimal-numeric-string"], simplify: false, ignoreImports: true, stringArray: true, stringArrayRotate: true, stringArrayIndexShift: true, splitStrings: true, splitStringsChunkLength: 100, stringArrayThreshold: 1, numbersToExpressions: true, deadCodeInjection: true, deadCodeInjectionThreshold: 1, controlFlowFlattening: true, controlFlowFlatteningThreshold: 1 }).getObfuscatedCode()
            obfuscatedCode = "`" + new Buffer.from(obfuscatedCode, "utf8").toString("base64") + "`"
            obfuscatedCode = `
    var base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);

    function base64decode(str) {
    var c1, c2, c3, c4;
    var i, len, out;
    len = str.length;
    i = 0;
    out = "";
    while (i < len) {

        do {
            c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
        } while (i < len && c1 == -1);
        if (c1 == -1)
            break;

        do {
            c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
        } while (i < len && c2 == -1);
        if (c2 == -1)
            break;
        out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

        do {
            c3 = str.charCodeAt(i++) & 0xff;
            if (c3 == 61)
                return out;
            c3 = base64DecodeChars[c3];
        } while (i < len && c3 == -1);
        if (c3 == -1)
            break;
        out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));

        do {
            c4 = str.charCodeAt(i++) & 0xff;
            if (c4 == 61)
                return out;
            c4 = base64DecodeChars[c4];
        } while (i < len && c4 == -1);
        if (c4 == -1)
            break;
        out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
    }
    return out;
    }

    const bmFtZWxlc3NfZHJhZ29u = base64decode(${obfuscatedCode})
    eval(bmFtZWxlc3NfZHJhZ29u)`
            obfuscatedCode = javascriptObfuscator.obfuscate(obfuscatedCode, { target: "node", stringArrayEncoding: [ "rc4", "base64" ], identifierNamesGenerator: "mangled-shuffled", seed: 50, antiDebug: true, compact: true, stringArrayIndexesType: ["hexadecimal-number", "hexadecimal-numeric-string"], simplify: false, ignoreImports: true, stringArray: true, stringArrayRotate: true, stringArrayIndexShift: true, splitStrings: true, splitStringsChunkLength: 100, stringArrayThreshold: 1, numbersToExpressions: true, deadCodeInjection: true, deadCodeInjectionThreshold: 1, controlFlowFlattening: true, controlFlowFlatteningThreshold: 1 }).getObfuscatedCode()

            if(!obfuscatedCode) return resolve(false)

            jsConfuser.obfuscate(obfuscatedCode, { target: "node", preset: "medium", identifierGenerator: "randomized", stringCompression: true, identifierGenerator: { "hexadecimal": 0.25, "randomized": 0.25, "mangled": 0.25, "number": 0.25 }, shuffle: {hash: 0.5, true: 0.5} }).then((obfuscatedCode)=>{
                resolve(obfuscatedCode)
            }).catch(()=>{
                resolve(false)
            })
        })
    }
}

module.exports = plugin