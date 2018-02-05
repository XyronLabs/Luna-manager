import { LunaManager } from './luna'
import * as extract_zip from 'extract-zip'

console.log(process.argv)

switch(process.argv[2]) {
    case '--update':
        LunaManager.checkForUpdates()
        break

    default:
        console.log("No arguments!")
}