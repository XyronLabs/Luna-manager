import * as fs from 'fs'
import * as request from 'request'
import * as extract_zip from 'extract-zip'
import Logger from './Logger'

export namespace LunaManager {

    export function newProject(path: string): void {
        fs.appendFile(path + '/main.luna','', err => {
            if (err) console.error(err)
        });
    }

    export function checkForUpdates(path: string, force?: boolean): void {
        Logger.println("Luna is checking for updates, please wait...");
        let currentVersion = LunaManager.checkCurrentBinariesVersion(path);
        
        LunaManager.checkRemoteBinariesVersion((remoteVersion: string) => {
            Logger.println("Current version: " + currentVersion);
            Logger.println("Remote version: " + remoteVersion);
    
            if (!remoteVersion) {
                Logger.println("Error fetching the latest version!");
                return;
            }
    
            if (!currentVersion || currentVersion < remoteVersion || force)
                LunaManager.updateBinaries(path, remoteVersion);
            else
                Logger.println('Luna is up to date!\n');

        });
    }

    export function checkCurrentBinariesVersion(path: string): (string| undefined) {
        if (fs.existsSync(path + '/bin/luna.json')) {
            return require(path + '/bin/luna.json').version
        } else {
            return undefined;
        }
    }

    export function checkRemoteBinariesVersion(_callback: Function): void {
        request.get({url: 'https://raw.githubusercontent.com/XyronLabs/Luna/master/build/vscode_version'}, (err, response, body) => {
            _callback(body);
        });
    }

    export function updateBinaries(path: string, remoteVersion: string): void {
        Logger.println("Installing Luna " + remoteVersion + " to this folder: " + path);
        Logger.println("Please wait until this process is finished...")
        
        let url = 'https://github.com/XyronLabs/Luna/releases/download/' + remoteVersion + '/luna-' + remoteVersion + '_standalone_' + process.platform + '.zip';
        
        request.get({url: url, encoding: 'binary'}, (err, response, body) => {
            if (err) {
                Logger.println(err);
            } else {
                fs.writeFileSync(path + "/luna.zip", body, 'binary');

                extract_zip(path + "/luna.zip", {dir: path + "/bin"}, (err: Error | undefined) => {
                    if (err) {
                        Logger.println("Could not update Luna to version " + remoteVersion + "\n");
                    } else {
                        fs.unlinkSync(path + "/luna.zip");
                        Logger.println("Luna was successfully updated!\n");
                        if (fs.existsSync(path + '/bin/luna.json')) {
                            let l = require(path + '/bin/luna.json')
                            l.version = remoteVersion
                            fs.writeFileSync(path + '/bin/luna.json', JSON.stringify(l))
                        } else {
                            fs.appendFileSync(path + '/bin/luna.json', JSON.stringify({version:remoteVersion}))
                        }
                    }
                });
            }
        });
    }

}