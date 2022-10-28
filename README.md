# Lycan
Powerful Javascript obfuscator framework.

## Installation
Github:
```
git clone https://github.com/hanaui-git/lycan
```

NpmJS:
```
npm i javascript-obfuscator recursive-readdir-async readline-sync js-confuser columnify base-64 chalk
```

## Usage
```
node index.js
```

## Walkthrough
Shows Lycan help menu and the list of the current obfuscators It has Including obfuscating the file **obfuscateMe.js** using the Simple obfuscator plugin(ID: 3).

```
$ node index.js
lycan> help

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

lycan> obfuscators

ID | Name      | Flow                               | Encryption Level | Author
0  | Base64Obf | javascript-obfuscator + base64     | high             | I2rys
1  | Buff      | jsconfuser + jsconfuser            | high             | I2rys
2  | Confuse   | jsconfuser + javascript-obfuscator | medium           | I2rys
3  | Simple    | javascript-obfuscator              | medium           | I2rys

lycan> set obfuscateMe.js
[*] Target successfully set.
lycan > obfuscate 3
[*] Obfuscating the file, please wait.
[*] File successfully obfuscated.
lycan > exit
```

## License
MIT © Hanaui