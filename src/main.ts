import { LunaManager } from './luna'
import * as extract_zip from 'extract-zip'

switch(process.argv[2]) {
    case '--update':
        LunaManager.checkForUpdates(process.cwd())
        break
    
    case '--force-update':
        LunaManager.checkForUpdates(process.cwd(), true)
        break

    case '--new':
        LunaManager.newProject(process.cwd())
        break

    case '--install-extension':
        LunaManager.Extensions.updateExtension(process.cwd(), process.argv[3])
        break

    default:
        console.log("No arguments!")
}