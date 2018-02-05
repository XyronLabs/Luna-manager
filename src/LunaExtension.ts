export default interface LunaExtension {
    name: string;
    description: string;
    version: string;
    path: string;
    dependencies?: string[];
    files?: string[];
}