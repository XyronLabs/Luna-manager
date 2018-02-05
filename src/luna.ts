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

    export function checkCurrentBinariesVersion(): string {
        return "";
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
        request.get({url: url, encoding: 'binary'}, (err, response, body) => {
            if (err) {
                Logger.println(err);
            } else {
                fs.writeFileSync(__dirname + "/luna.zip", body, 'binary');

                extract_zip(__dirname + "/luna.zip", {dir: __dirname}, (err: string) => {
                    if (err) {
                        Logger.println("Could not update Luna to version " + remoteVersion + "\n");
                    } else {
                        fs.unlinkSync(__dirname + "/luna.zip");
                        Logger.println("Luna was successfully updated!\n");
                        // vscode.workspace.getConfiguration('luna').update('version', remoteVersion, vscode.ConfigurationTarget.Workspace);
                    }
                });
            }
        });
    }

}