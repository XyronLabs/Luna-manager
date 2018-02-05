"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const request = __importStar(require("request"));
const extract_zip = __importStar(require("extract-zip"));
const Logger_1 = __importDefault(require("./Logger"));
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
        return "";
    }
    LunaManager.checkCurrentBinariesVersion = checkCurrentBinariesVersion;
    function checkRemoteBinariesVersion(_callback) {
        request.get({ url: 'https://raw.githubusercontent.com/XyronLabs/Luna/master/build/vscode_version' }, (err, response, body) => {
            _callback(body);
        });
    }
    LunaManager.checkRemoteBinariesVersion = checkRemoteBinariesVersion;
    function updateBinaries(remoteVersion) {
        Logger_1.default.println("Installing Luna " + remoteVersion + " to this folder: " + __dirname);
        Logger_1.default.println("Please wait until this process is finished...");
        let url = 'https://github.com/XyronLabs/Luna/releases/download/' + remoteVersion + '/luna-' + remoteVersion + '_standalone_' + process.platform + '.zip';
        request.get({ url: url, encoding: 'binary' }, (err, response, body) => {
            if (err) {
                Logger_1.default.println(err);
            }
            else {
                fs.writeFileSync(__dirname + "/luna.zip", body, 'binary');
                extract_zip(__dirname + "/luna.zip", { dir: __dirname }, (err) => {
                    if (err) {
                        Logger_1.default.println("Could not update Luna to version " + remoteVersion + "\n");
                    }
                    else {
                        fs.unlinkSync(__dirname + "/luna.zip");
                        Logger_1.default.println("Luna was successfully updated!\n");
                        // vscode.workspace.getConfiguration('luna').update('version', remoteVersion, vscode.ConfigurationTarget.Workspace);
                    }
                });
            }
        });
    }
    LunaManager.updateBinaries = updateBinaries;
})(LunaManager = exports.LunaManager || (exports.LunaManager = {}));
