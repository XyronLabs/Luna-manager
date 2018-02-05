"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const luna_1 = require("./luna");
console.log(process.argv);
switch (process.argv[2]) {
    case '--update':
        luna_1.LunaManager.checkRemoteBinariesVersion((version) => {
            console.log("Luna latest version: " + version);
            luna_1.LunaManager.updateBinaries(version);
        });
        break;
    default:
        console.log("No arguments!");
}
