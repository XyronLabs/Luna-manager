import * as fs from 'fs'
import * as request from 'request'
import * as extract_zip from 'extract-zip'

import LunaExtension from './LunaExtension'

export const baseUrl = "https://raw.githubusercontent.com/XyronLabs/Luna-extensions/master/";
export const extensionFolder = "/res/lua/extensions/";

export function newProject(path: string, printfn: Function): void {
    checkForUpdates(path, printfn, true)
}

export function checkForUpdates(path: string, printfn: Function, force?: boolean): void {
    printfn("Luna is checking for updates, please wait...");
    let currentVersion = checkCurrentBinariesVersion(path);
    
    checkRemoteBinariesVersion((remoteVersion: string) => {
        printfn("Current version: " + currentVersion);
        printfn("Remote version: " + remoteVersion);

        if (!remoteVersion) {
            printfn("Error fetching the latest version!");
            return;
        }

        if (!currentVersion || currentVersion < remoteVersion || force)
            updateBinaries(path, printfn, remoteVersion);
        else
            printfn('Luna is up to date!\n');

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

export function updateBinaries(path: string, printfn: Function, remoteVersion: string): void {
    printfn("Installing Luna " + remoteVersion + " to this folder: " + path);
    printfn("Please wait until this process is finished...")
    
    let url = 'https://github.com/XyronLabs/Luna/releases/download/' + remoteVersion + '/luna-' + remoteVersion + '_standalone_' + process.platform + '.zip';
    
    request.get({url: url, encoding: 'binary'}, (err, response, body) => {
        if (err) {
            printfn(err);
        } else {
            fs.writeFileSync(path + "/luna.zip", body, 'binary');

            extract_zip(path + "/luna.zip", {dir: path + ""}, (err: Error | undefined) => {
                if (err) {
                    printfn("Could not update Luna to version " + remoteVersion + "\n");
                } else {
                    fs.unlinkSync(path + "/luna.zip");
                    printfn("Luna was successfully updated!\n");
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

export function updateExtension(path: string, printfn: Function, packageName: string) {
    request.get({url: baseUrl + packageName + "/extension.json"}, (err, response, body) => {
        if (err) { printfn("Couldn't get extension data"); return; }
        let obj: LunaExtension = JSON.parse(body);
        
        if (!obj.files) obj.files = [];
        obj.files.push("init.lua");
        obj.files.push("extension.json");

        if (obj.dependencies) {
            for (let d of obj.dependencies) {
                updateExtension(path, printfn, d);
            }
        }

        let directoryTree = "";
        for (let currDir of packageName.split('/')) {
            directoryTree += currDir + "/";
            
            if (!fs.existsSync(path + extensionFolder + directoryTree))
                fs.mkdirSync(path + extensionFolder + directoryTree);
        }

        printfn("Installing " + obj.name + " " + obj.version);

        for(let f of obj.files) {
            request.get({url: baseUrl + packageName + "/" + f}, (err, response, body) => {
                if (err) { printfn("Couldn't download file: " + f); return; }
                fs.writeFileSync(path + extensionFolder + packageName + "/" + f, body);
            });
        }
        
        printfn("Installed " + obj.name + " " + obj.version + " successfully!");
    });

}

export function checkInstalledExtensions(path: string, printfn: Function, force?: boolean) {
    printfn("Checking for extension updates")
    let extensions = checkFolderForExtensions(path);
    
    extensions.forEach(e => {
        let extensionData: LunaExtension = require(getExtensionData(path, e));
        
        request.get({url: baseUrl + e + "/extension.json"}, (err, response, body) => {
            let remoteData: LunaExtension = JSON.parse(body);
            printfn(`Extension: ${extensionData.name}, local version = ${extensionData.version}, remote version = ${remoteData.version}`)

            if (extensionData.version < remoteData.version || force) {
                updateExtension(path, printfn, e);
            }
        });
    });
}

export function checkFolderForExtensions(path: string, folder: string = "", extensionList: string[] = []) {
    if (!fs.existsSync(path + extensionFolder + folder)) return [];

    let folders = fs.readdirSync(path + extensionFolder + folder);
    folders.forEach(f => {
        if (fs.existsSync(getExtensionData(path, folder + "/" + f))) {
            extensionList.push(folder + "/" + f);
        } else {
            return checkFolderForExtensions(path, folder + "/" + f, extensionList);
        }
    });

    return extensionList;
}

export function getExtensionData(path: string, packageName: string): string {
    return path + extensionFolder + packageName + "/extension.json";
}

export function removeExtension(path: string, printfn: Function, packageName: string, extensionsData: LunaExtension[], errCallback: Function): void {
    // Check if an installed extension depends on this one
    let ableToRemove = true
    extensionsData.forEach(element => {
        if (element.dependencies) {
            element.dependencies.forEach(d => {
                if (d == packageName) {
                    errCallback(`Can't remove ${path} extension, ${element.name} depends on this extension`) 
                    ableToRemove = false;
                }
            });
        }
    });

    if (ableToRemove) {
        for (let file of fs.readdirSync(path + extensionFolder + packageName))
        fs.unlinkSync(path + extensionFolder + packageName + "/" + file);
        fs.rmdirSync(path + extensionFolder + packageName);
        printfn("Removed extension: " + packageName);
        
        let f = packageName.split('/');
        
        if (f.length > 2) {
            let rootFolder = fs.readdirSync(path + extensionFolder + f[1]);
            if (rootFolder.length == 0)
            fs.rmdirSync(path + extensionFolder + f[1]);
        }
    }
}