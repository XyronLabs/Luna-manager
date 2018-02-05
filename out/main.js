"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const luna_1 = require("./luna");
console.log(process.argv);
switch (process.argv[2]) {
    case '--update':
        luna_1.LunaManager.checkForUpdates();
        break;
    case '--force-update':
        luna_1.LunaManager.checkForUpdates(true);
        break;
    default:
        console.log("No arguments!");
}
