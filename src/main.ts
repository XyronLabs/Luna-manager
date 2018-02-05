import { LunaManager } from './luna'
import * as extract_zip from 'extract-zip'

console.log(process.argv)

switch(process.argv[2]) {
    case '--update':
        LunaManager.checkRemoteBinariesVersion((version: string) => {
            console.log("Luna latest version: " + version)
            LunaManager.updateBinaries(version)
        })
        break

    default:
        console.log("No arguments!")
}