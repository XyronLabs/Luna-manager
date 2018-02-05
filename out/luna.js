"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
const request = __importStar(require("request"));
// import * as extract_zip from 'extract_zip'
var LunaManager;
(function (LunaManager) {
    function checkRemoteBinariesVersion(_callback) {
        request.get({ url: 'https://raw.githubusercontent.com/XyronLabs/Luna/master/build/vscode_version' }, (err, response, body) => {
            _callback(body);
        });
    }
    LunaManager.checkRemoteBinariesVersion = checkRemoteBinariesVersion;
})(LunaManager = exports.LunaManager || (exports.LunaManager = {}));
