import { Tree } from '@angular-devkit/schematics';
import * as ts from 'typescript/lib/tsserverlibrary';
import { CUSTOM_TS_PLUGIN_NAME, CUSTOM_TS_PLUGIN_PATH } from './tsUtils';

export class ServerHost implements ts.server.ServerHost {
    readonly args: string[];
    readonly newLine: string;
    readonly useCaseSensitiveFileNames: boolean;

    constructor(private host: Tree) {
        this.args = ts.sys.args;
        this.newLine = ts.sys.newLine;
        this.useCaseSensitiveFileNames = ts.sys.useCaseSensitiveFileNames;
    }

    public readFile(path: string, encoding?: string): string | undefined {
        let content;
        try {
            content = this.host.read(path).toString(encoding);
        } finally {
            // eslint-disable-next-line no-unsafe-finally
            return content || ts.sys.readFile(path, encoding);
        }
    }

    public getFileSize(path: string): number {
        return ts.sys.getFileSize(path);
    }

    public watchFile(path: string, callback: ts.FileWatcherCallback, pollingInterval?: number):
        ts.FileWatcher {
        return ts.sys.watchFile(path, callback, pollingInterval);
    }

    public watchDirectory(path: string, callback: ts.DirectoryWatcherCallback, recursive?: boolean):
        ts.FileWatcher {
        return ts.sys.watchDirectory(path, callback, recursive);
    }

    public resolvePath(path: string): string {
        return ts.sys.resolvePath(path);
    }

    public fileExists(path: string): boolean {
        return this.host.exists(path);
    }

    public directoryExists(path: string): boolean {
        let exists: boolean;
        try {
            exists = this.host.getDir(path) !== void 0;
        } finally {
            // eslint-disable-next-line no-unsafe-finally
            return exists || this.fileExists(path);
        }
    }

    public getExecutingFilePath(): string {
        return ts.sys.getExecutingFilePath();
    }

    public getCurrentDirectory(): string {
        return this.host.root.path;
    }

    public getDirectories(path: string): string[] {
        return this.host.getDir(path).subdirs;
    }

    public readDirectory(path: string): string[] {
        return this.host.getDir(path).subfiles;
    }

    public require(initialPath: string, moduleName: string) {
        try {
            const paths = [initialPath];
            if (moduleName === CUSTOM_TS_PLUGIN_NAME) {
                moduleName = CUSTOM_TS_PLUGIN_PATH;
                paths.push(__dirname);
            }
            const modulePath = require.resolve(moduleName, { paths });
            return {
                module: require(modulePath),
                error: undefined,
            };
        } catch (e) {
            return {
                module: undefined,
                error: e as Error,
            };
        }
    }

    public getModifiedTime(path: string): Date | undefined {
        return ts.sys.getModifiedTime(path);
    }

    public realpath(path: string): string {
        return ts.sys.realpath(path);
    }

    public createSHA256Hash(data: string): string {
        return ts.sys.createSHA256Hash(data);
    }

    //#region Not implemented methods

    public write(data: string): void {
        throw new Error('Method "write" not implemented.');
        // ts.sys.write(data);
    }

    public writeOutputIsTTY(): boolean {
        throw new Error('Method "writeOutputIsTTY" not implemented.');
        // return ts.sys.writeOutputIsTTY();
    }

    public writeFile(path: string, data: string, writeByteOrderMark?: boolean): void {
        throw new Error('Method "writeFile" not implemented.');
        // return ts.sys.writeFile(path, data, writeByteOrderMark);
    }

    public createDirectory(path: string): void {
        throw new Error('Method "createDirectory" not implemented.');
        // return ts.sys.createDirectory(path);
    }

    public setModifiedTime(path: string, time: Date): void {
        throw new Error('Method "setModifiedTime" not implemented.');
        // return ts.sys.setModifiedTime(path, time);
    }

    public deleteFile(path: string): void {
        throw new Error('Method "deleteFile" not implemented.');
        // return ts.sys.deleteFile(path);
    }

    public createHash(data: string): string {
        throw new Error('Method "createHash" not implemented.');
        // return ts.sys.createHash(data);
    }

    public getMemoryUsage(): number {
        throw new Error('Method "getMemoryUsage" not implemented.');
        // return ts.sys.getMemoryUsage();
    }

    public exit(exitCode?: number): void {
        throw new Error('Method "exit" not implemented.');
        // return ts.sys.exit(exitCode);
    }

    public setTimeout(callback: (...args: any[]) => void, ms: number, ...args: any[]): any {
        throw new Error('Method "setTimeout" not implemented.');
        // return ts.sys.setTimeout(callback, ms, ...args);
    }

    public clearTimeout(timeoutId: any): void {
        throw new Error('Method "clearTimeout" not implemented.');
        // return ts.sys.clearTimeout(timeoutId);
    }

    public clearScreen(): void {
        throw new Error('Method "clearScreen" not implemented.');
        // return ts.sys.clearScreen();
    }

    public base64decode(input: string): string {
        throw new Error('Method "base64decode" not implemented.');
        // return ts.sys.base64decode(input);
    }

    public base64encode(input: string): string {
        throw new Error('Method "base64encode" not implemented.');
        // return ts.sys.base64encode(input);
    }

    public setImmediate(callback: (...args: any[]) => void, ...args: any[]): any {
        throw new Error('Method "setImmediate" not implemented.');
        // return setImmediate(callback, ...args);
    }

    public clearImmediate(timeoutId: any): void {
        throw new Error('Method "clearImmediate" not implemented.');
        // return clearImmediate(timeoutId);
    }

    //#endregion
}
