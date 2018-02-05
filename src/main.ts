import { LunaManager } from './luna'

LunaManager.checkRemoteBinariesVersion((version: string) => {
    console.log("Luna latest version: " + version)
})