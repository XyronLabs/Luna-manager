import * as fs from 'fs'
import * as request from 'request'
import * as extract_zip from 'extract-zip'

import Logger from './Logger'
import LunaExtension from './LunaExtension'

export namespace LunaManager {

    export function newProject(path: string): void {
        fs.appendFile(path + '/main.luna','', err => {
            if (err) console.error(err)
        });
        checkForUpdates(path, true)
    }

    export function checkForUpdates(path: string, force?: boolean): void {
        Logger.println("Luna is checking for updates, please wait...");
        let currentVersion = checkCurrentBinariesVersion(path);
        
        checkRemoteBinariesVersion((remoteVersion: string) => {
            Logger.println("Current version: " + currentVersion);
            Logger.println("Remote version: " + remoteVersion);
    
            if (!remoteVersion) {
                Logger.println("Error fetching the latest version!");
                return;
            }
    
            if (!currentVersion || currentVersion < remoteVersion || force)
                updateBinaries(path, remoteVersion);
            else
                Logger.println('Luna is up to date!\n');

        });
    }

    export function checkCurrentBinariesVersion(path: string): (string| undefined) {
        if (fs.existsSync(path + '/luna.json')) {
            return require(path + '/luna.json').version
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

                extract_zip(path + "/luna.zip", {dir: path + ""}, (err: Error | undefined) => {
                    if (err) {
                        Logger.println("Could not update Luna to version " + remoteVersion + "\n");
                    } else {
                        fs.unlinkSync(path + "/luna.zip");
                        Logger.println("Luna was successfully updated!\n");
                        if (fs.existsSync(path + '/luna.json')) {
                            let l = require(path + '/luna.json')
                            l.version = remoteVersion
                            fs.writeFileSync(path + '/luna.json', JSON.stringify(l))
                        } else {
                            fs.appendFileSync(path + '/luna.json', JSON.stringify({version:remoteVersion}))
                        }
                    }
                });
            }
        });
    }

    export namespace Extensions {
        export const baseUrl = "https://raw.githubusercontent.com/XyronLabs/Luna-extensions/master/";
        export const extensionFolder = "/res/lua/extensions/";

        export function updateExtension(path: string, packageName: string) {
            request.get({url: baseUrl + packageName + "/extension.json"}, (err, response, body) => {
                if (err) { Logger.println("Couldn't get extension data"); return; }
                let obj: LunaExtension = JSON.parse(body);
                
                if (!obj.files) obj.files = [];
                obj.files.push("init.lua");
                obj.files.push("extension.json");
    
                if (obj.dependencies) {
                    for (let d of obj.dependencies) {
                        updateExtension(path, d);
                    }
                }
    
                let directoryTree = "";
                for (let currDir of packageName.split('/')) {
                    directoryTree += currDir + "/";
                    
                    if (!fs.existsSync(path + extensionFolder + directoryTree))
                        fs.mkdirSync(path + extensionFolder + directoryTree);
                }
    
                Logger.println("Installing " + obj.name + " " + obj.version);
    
                for(let f of obj.files) {
                    request.get({url: baseUrl + packageName + "/" + f}, (err, response, body) => {
                        if (err) { Logger.println("Couldn't download file: " + f); return; }
                        fs.writeFileSync(path + extensionFolder + packageName + "/" + f, body);
                    });
                }
                
                Logger.println("Installed " + obj.name + " " + obj.version + " successfully!");
            });

        }

        export function checkInstalledExtensions(path: string, force?: boolean) {
            Logger.println("Checking for extension updates")
            let extensions = checkFolderForExtensions();
            
            extensions.forEach(e => {
                let extensionData: LunaExtension = require(getExtensionData(e));
                
                request.get({url: baseUrl + e + "/extension.json"}, (err, response, body) => {
                    let remoteData: LunaExtension = JSON.parse(body);
                    Logger.println(`Extension: ${extensionData.name}, local version = ${extensionData.version}, remote version = ${remoteData.version}`)
    
                    if (extensionData.version < remoteData.version || force) {
                        updateExtension(path, e);
                    }
                });
            });
        }

        function checkFolderForExtensions(folder: string = "", extensionList: string[] = []) {
            if (!fs.existsSync(extensionFolder + folder)) return [];
    
            let folders = fs.readdirSync(extensionFolder + folder);
            folders.forEach(f => {
                if (fs.existsSync(getExtensionData(folder + "/" + f))) {
                    extensionList.push(folder + "/" + f);
                } else {
                    return checkFolderForExtensions(folder + "/" + f, extensionList);
                }
            });
    
            return extensionList;
        }

        function getExtensionData(packageName: string): string {
            return extensionFolder + packageName + "/extension.json";
        }
    }

}