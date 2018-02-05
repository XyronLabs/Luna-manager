import * as fs from 'fs'
import * as request from 'request'
import * as extract_zip from 'extract-zip'
import Logger from './Logger'

export namespace LunaManager {

    export function checkForUpdates(force?: boolean, autoHide?: boolean): void {
        Logger.println("Luna is checking for updates, please wait...");
        let currentVersion = LunaManager.checkCurrentBinariesVersion();
        
        LunaManager.checkRemoteBinariesVersion((remoteVersion: string) => {
            Logger.println("Current version: " + currentVersion);
            Logger.println("Remote version: " + remoteVersion);
    
            if (!remoteVersion) {
                Logger.println("Error fetching the latest version!");
                return;
            }
    
            if (!currentVersion || currentVersion < remoteVersion || force)
                LunaManager.updateBinaries(remoteVersion);
            else
                Logger.println('Luna is up to date!\n');

        });
    }

    export function checkCurrentBinariesVersion(): (string| undefined) {
        if (fs.existsSync(process.cwd() + '/bin/luna.json')) {
            return require(process.cwd() + '/bin/luna.json').version
        } else {
            return undefined;
        }
    }

    export function checkRemoteBinariesVersion(_callback: Function): void {
        request.get({url: 'https://raw.githubusercontent.com/XyronLabs/Luna/master/build/vscode_version'}, (err, response, body) => {
            _callback(body);
        });
    }

    export function updateBinaries(remoteVersion: string): void {
        Logger.println("Installing Luna " + remoteVersion + " to this folder: " + __dirname);
        Logger.println("Please wait until this process is finished...")
        
        let url = 'https://github.com/XyronLabs/Luna/releases/download/' + remoteVersion + '/luna-' + remoteVersion + '_standalone_' + process.platform + '.zip';
        console.log(url)
        request.get({url: url, encoding: 'binary'}, (err, response, body) => {
            if (err) {
                Logger.println(err);
            } else {
                fs.writeFileSync(__dirname + "/luna.zip", body, 'binary');

                extract_zip(process.cwd() + "/luna.zip", {dir: process.cwd() + "/bin"}, (err: Error | undefined) => {
                    if (err) {
                        Logger.println("Could not update Luna to version " + remoteVersion + "\n");
                    } else {
                        fs.unlinkSync(process.cwd() + "/luna.zip");
                        Logger.println("Luna was successfully updated!\n");
                        if (fs.existsSync(process.cwd() + '/bin/luna.json')) {
                            let l = require(process.cwd() + '/bin/luna.json')
                            l.version = remoteVersion
                            fs.writeFileSync(process.cwd() + '/bin/luna.json', JSON.stringify(l), err => {
                                if (err) console.error(err)
                            })
                        } else {
                            fs.appendFileSync(process.cwd() + '/bin/luna.json',JSON.stringify({version:remoteVersion}))
                        }
                    }
                });
            }
        });
    }

}