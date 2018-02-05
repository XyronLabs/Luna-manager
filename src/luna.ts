import * as fs from 'fs'
import * as request from 'request'
// import * as extract_zip from 'extract_zip'

export namespace LunaManager {

    export function checkRemoteBinariesVersion(_callback: Function): void {
        request.get({url: 'https://raw.githubusercontent.com/XyronLabs/Luna/master/build/vscode_version'}, (err, response, body) => {
            _callback(body);
        });
    }

}