"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const request = require("request");
const extract_zip = require("extract-zip");
const Logger_1 = require("./Logger");
var LunaManager;
(function (LunaManager) {
    function checkForUpdates(force, autoHide) {
        Logger_1.default.println("Luna is checking for updates, please wait...");
        let currentVersion = LunaManager.checkCurrentBinariesVersion();
        LunaManager.checkRemoteBinariesVersion((remoteVersion) => {
            Logger_1.default.println("Current version: " + currentVersion);
            Logger_1.default.println("Remote version: " + remoteVersion);
            if (!remoteVersion) {
                Logger_1.default.println("Error fetching the latest version!");
                return;
            }
            if (!currentVersion || currentVersion < remoteVersion || force)
                LunaManager.updateBinaries(remoteVersion);
            else
                Logger_1.default.println('Luna is up to date!\n');
        });
    }
    LunaManager.checkForUpdates = checkForUpdates;
    function checkCurrentBinariesVersion() {
        if (fs.existsSync(process.cwd() + '/bin/luna.json')) {
            return require(process.cwd() + '/bin/luna.json').version;
        }
        else {
            return undefined;
        }
    }
    LunaManager.checkCurrentBinariesVersion = checkCurrentBinariesVersion;
    function checkRemoteBinariesVersion(_callback) {
        request.get({ url: 'https://raw.githubusercontent.com/XyronLabs/Luna/master/build/vscode_version' }, (err, response, body) => {
            _callback(body);
        });
    }
    LunaManager.checkRemoteBinariesVersion = checkRemoteBinariesVersion;
    function updateBinaries(remoteVersion) {
        Logger_1.default.println("Installing Luna " + remoteVersion + " to this folder: " + process.cwd());
        Logger_1.default.println("Please wait until this process is finished...");
        let url = 'https://github.com/XyronLabs/Luna/releases/download/' + remoteVersion + '/luna-' + remoteVersion + '_standalone_' + process.platform + '.zip';
        console.log(url);
        request.get({ url: url, encoding: 'binary' }, (err, response, body) => {
            if (err) {
                Logger_1.default.println(err);
            }
            else {
                fs.writeFileSync(process.cwd() + "/luna.zip", body, 'binary');
                extract_zip(process.cwd() + "/luna.zip", { dir: process.cwd() + "/bin" }, (err) => {
                    if (err) {
                        Logger_1.default.println("Could not update Luna to version " + remoteVersion + "\n");
                    }
                    else {
                        fs.unlinkSync(process.cwd() + "/luna.zip");
                        Logger_1.default.println("Luna was successfully updated!\n");
                        if (fs.existsSync(process.cwd() + '/bin/luna.json')) {
                            let l = require(process.cwd() + '/bin/luna.json');
                            l.version = remoteVersion;
                            fs.writeFileSync(process.cwd() + '/bin/luna.json', JSON.stringify(l), err => {
                                if (err)
                                    console.error(err);
                            });
                        }
                        else {
                            fs.appendFileSync(process.cwd() + '/bin/luna.json', JSON.stringify({ version: remoteVersion }));
                        }
                    }
                });
            }
        });
    }
    LunaManager.updateBinaries = updateBinaries;
})(LunaManager = exports.LunaManager || (exports.LunaManager = {}));
