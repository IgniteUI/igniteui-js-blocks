// eslint-disable-next-line import/no-extraneous-dependencies
import * as ts from 'typescript';
import * as tss from 'typescript/lib/tsserverlibrary';
import { Tree } from '@angular-devkit/schematics';
import { MemberChange } from './schema';
import { escapeRegExp } from './util';
import { Logger } from './tsLogger';
import { TSLanguageService } from './tsPlugin/TSLanguageService';

export const IG_PACKAGE_NAME = 'igniteui-angular';
export const NG_LANG_SERVICE_PACKAGE_NAME = '@angular/language-service';
export const NG_CORE_PACKAGE_NAME = '@angular/core';
export const CUSTOM_TS_PLUGIN_PATH = './tsPlugin';
export const CUSTOM_TS_PLUGIN_NAME = 'igx-ts-plugin';

/** Returns a source file */
// export function getFileSource(sourceText: string): ts.SourceFile {
//     return ts.createSourceFile('', sourceText, ts.ScriptTarget.Latest, true);
// }

export const getIdentifierPositions = (sourceText: string, name: string): Array<{ start: number; end: number }> => {
    const source = ts.createSourceFile('', sourceText, ts.ScriptTarget.Latest, true);
    const positions = [];

    const checkIdentifier = (node: ts.Node): boolean => {
        if (node.kind !== ts.SyntaxKind.Identifier || !node.parent) {
            return false;
        }
        if (node.parent.kind === ts.SyntaxKind.PropertyDeclaration) {
            return false;
        }
        if (node.parent.kind === ts.SyntaxKind.PropertyAssignment ||
            node.parent.kind === ts.SyntaxKind.PropertySignature) {
            // make sure it's not prop assign  `= { IgxClass: "fake"}`
            //                  definition `prop: { IgxClass: string; }`
            //                                     name: initializer
            const propAssign: ts.PropertyAssignment | ts.PropertySignature = node.parent as ts.PropertyAssignment | ts.PropertySignature;
            if (propAssign.name.getText() === name) {
                return false;
            }
        }
        return (node as ts.Identifier).text === name;
    };

    const findIdentifiers = (node: ts.Node) => {
        if (checkIdentifier(node)) {
            // Use `.getStart()` as node.pos includes the space(s) before the identifier text
            positions.push({ start: node.getStart(), end: node.end });
        }
        ts.forEachChild(node, findIdentifiers);
    };
    source.forEachChild(findIdentifiers);
    return positions;
};

/** Returns the positions of import from module string literals  */
export const getImportModulePositions = (sourceText: string, startsWith: string): Array<{ start: number; end: number }> => {
    const source = ts.createSourceFile('', sourceText, ts.ScriptTarget.Latest, true);
    const positions = [];

    for (const statement of source.statements) {
        if (statement.kind === ts.SyntaxKind.ImportDeclaration) {
            const specifier = (statement as ts.ImportDeclaration).moduleSpecifier as ts.StringLiteral;
            if (specifier.text.startsWith(startsWith)) {
                // string literal pos will include quotes, trim with 1
                positions.push({ start: specifier.getStart() + 1, end: specifier.end - 1 });
            }
        }
    }
    return positions;
};

/** Filters out statements to named imports (e.g. `import {x, y}`) from PACKAGE_IMPORT */
const namedImportFilter = (statement: ts.Statement) => {
    if (statement.kind === ts.SyntaxKind.ImportDeclaration &&
        ((statement as ts.ImportDeclaration).moduleSpecifier as ts.StringLiteral).text.endsWith(IG_PACKAGE_NAME)) {

        const clause = (statement as ts.ImportDeclaration).importClause;
        return clause && clause.namedBindings && clause.namedBindings.kind === ts.SyntaxKind.NamedImports;
    }
    return false;
};

export const getRenamePositions = (sourcePath: string, name: string, service: ts.LanguageService):
    Array<{ start: number; end: number }> => {

    const source = service.getProgram().getSourceFile(sourcePath);
    const positions = [];

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const imports = source.statements.filter(<(a: ts.Statement) => a is ts.ImportDeclaration>namedImportFilter);
    if (!imports.length) {
        return positions;
    }
    const elements: ts.NodeArray<ts.ImportSpecifier> =
        imports
            .map(x => (x.importClause.namedBindings as ts.NamedImports).elements)
            .reduce((prev, current) => prev.concat(current) as unknown as ts.NodeArray<ts.ImportSpecifier>);

    for (const elem of elements) {
        if (elem.propertyName && elem.propertyName.text === name) {
            // alias imports `igxClass as smth` -> <propertyName> as <name>
            // other references are only for the name portion
            positions.push({ start: elem.propertyName.getStart(), end: elem.propertyName.getEnd() });
            break;
        }

        if (!elem.propertyName && elem.name.text === name) {
            const renames = service.findRenameLocations(sourcePath, elem.name.getStart(), false, false, false);
            if (renames) {
                const renamesPos = renames.map(x => ({ start: x.textSpan.start, end: x.textSpan.start + x.textSpan.length }));
                positions.push(...renamesPos);
            }
        }
    }

    return positions;
};

export const findMatches = (content: string, change: MemberChange): number[] => {
    let matches: RegExpExecArray;
    const regex = new RegExp(escapeRegExp(change.member), 'g');
    const matchesPositions = [];
    do {
        matches = regex.exec(content);
        if (matches) {
            matchesPositions.push(matches.index);
        }
    } while (matches);

    return matchesPositions;
};

export const replaceMatch = (content: string, toReplace: string, replaceWith: string, index: number): string =>
    content.substring(0, index) +
    replaceWith +
    content.substring(index + toReplace.length, content.length);

//#region Language Service

/**
 * Create a TypeScript language service
 *
 * @param serviceHost A TypeScript language service host
 */
export const getLanguageService = (filePaths: string[], host: Tree, options: ts.CompilerOptions = {}): ts.LanguageService => {
    const fileVersions = new Map<string, number>();
    patchHostOverwrite(host, fileVersions);
    const servicesHost = {
        getCompilationSettings: () => options,
        getScriptFileNames: () => filePaths,
        getScriptVersion: fileName => {
            // return host.actions.filter(x => x.path === fileName && x.kind !== 'c').length.toString();
            const version = fileVersions.get(fileName) || 0;
            return version.toString();
        },
        getScriptSnapshot: fileName => {
            if (!host.exists(fileName)) {
                return undefined;
            }
            return ts.ScriptSnapshot.fromString(host.read(fileName).toString());
        },
        getCurrentDirectory: () => process.cwd(),
        getDefaultLibFileName: opts => ts.getDefaultLibFilePath(opts),
        fileExists: fileName => filePaths.indexOf(fileName) !== -1
    };

    return ts.createLanguageService(servicesHost, ts.createDocumentRegistry());
};

const patchHostOverwrite = (host: Tree, fileVersions: Map<string, number>) => {
    const original = host.overwrite;
    host.overwrite = (path: string, content: Buffer | string) => {
        const version = fileVersions.get(path) || 0;
        fileVersions.set(path, version + 1);
        original.call(host, path, content);
    };
};

/**
 * Create a project service singleton that holds all projects within a directory tree
 *
 * @param serverHost Used by the tss to navigate the directory tree
 */
export const createProjectService = (serverHost: tss.server.ServerHost): tss.server.ProjectService => {
    // set traceToConsole to true to enable logging
    const logger = new Logger(false, tss.server.LogLevel.verbose);
    const projectService = new tss.server.ProjectService({
        host: serverHost,
        logger,
        /* not needed since we will run only migrations */
        cancellationToken: tss.server.nullCancellationToken,
        /* do not allow more than one InferredProject per project root */
        useSingleInferredProject: true,
        useInferredProjectPerProjectRoot: true,
        /* will load only global plug-ins */
        globalPlugins: [CUSTOM_TS_PLUGIN_NAME, NG_LANG_SERVICE_PACKAGE_NAME],
        allowLocalPluginLoads: false,
        typingsInstaller: tss.server.nullTypingsInstaller
    });
    projectService.setHostConfiguration({
        formatOptions: projectService.getHostFormatCodeOptions(),
        extraFileExtensions: [
            {
                extension: '.html',
                isMixedContent: false,
                scriptKind: tss.ScriptKind.External,
            }
        ]
    });
    projectService.configurePlugin({
        pluginName: CUSTOM_TS_PLUGIN_NAME,
        configuration: {}
    });
    projectService.configurePlugin({
        pluginName: NG_LANG_SERVICE_PACKAGE_NAME,
        configuration: {
            angularOnly: false,
        },
    });

    return projectService;
};

/**
 * Attempts to get type definitions using the TypeScript Language Service.
 * Can fall back to a cached version of the TSLS.
 */
const getTypeDefinitions = (langServ: tss.LanguageService, entryPath: string, position: number): any =>
    /*
        getTypeScriptLanguageService is attached by us to the Typescript Language Service
        via a custom made plugin, it's sole purpose is to cache the language service and return it
        before any other plugins modify it
    */
    langServ.getTypeDefinitionAtPosition(entryPath, position)
    || (langServ as TSLanguageService).getTypeScriptLanguageService().getTypeDefinitionAtPosition(entryPath, position);

/**
 * Get type information about a TypeScript identifier
 *
 * @param langServ TypeScript/Angular LanguageService
 * @param entryPath path to file
 * @param position Index of identifier
 */
export const getTypeDefinitionAtPosition =
    (langServ: tss.LanguageService, entryPath: string, position: number): tss.DefinitionInfo | null => {
        const definition = langServ.getDefinitionAndBoundSpan(entryPath, position)?.definitions[0];
        if (!definition) {
            return null;
        }

        // if the definition's kind is a reference, the identifier is a template variable referred in an internal/external template
        if (definition.kind.toString() === 'reference') {
            return langServ.getDefinitionAndBoundSpan(entryPath, definition.textSpan.start).definitions[0];
        }
        let typeDefs = getTypeDefinitions(langServ, entryPath, definition.textSpan.start);
        // if there are no type definitions found, the identifier is a ts property, referred in an internal/external template
        // or is a reference in a decorator
        if (!typeDefs) {
            /*
             normally, the tsserver will consider non .ts files as external to the project
             however, we load .html files which we can handle with the Angular language service
             here we're only looking for definitions in a .ts source file
             we call the getSourceFile function which accesses a map of files, previously loaded by the tsserver
             at this point the map contains all .html files that we've included
             we have to ignore them, since the language service will attempt to parse them as .ts files
            */
            if (!definition.fileName.endsWith('.ts')) {
                return null;
            }

            const sourceFile = langServ.getProgram().getSourceFile(definition.fileName);
            if (!sourceFile) {
                return null;
            }

            const classDeclaration = sourceFile
                .statements
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                .filter(<(a: tss.Statement) => a is tss.ClassDeclaration>(m => m.kind === tss.SyntaxKind.ClassDeclaration))
                .find(m => m.name.getText() === definition.containerName);

            // there must be at least one class declaration in the .ts file and the property must belong to it
            if (!classDeclaration) {
                return null;
            }

            const member: ts.ClassElement = classDeclaration.members.find(m => m.name.getText() === definition.name);
            if (!member?.name) {
                return null;
            }

            typeDefs = getTypeDefinitions(langServ, definition.fileName, member.name.getStart() + 1);
        }
        if (typeDefs?.length) {
            return typeDefs[0];
        }

        return null;
    };

export const isMemberIgniteUI =
    (change: MemberChange, langServ: tss.LanguageService, entryPath: string, matchPosition: number): boolean => {
        const typeDef = getTypeDefinitionAtPosition(langServ, entryPath, matchPosition - 1);
        return !typeDef ? false : typeDef.fileName.includes(IG_PACKAGE_NAME) && change.definedIn.indexOf(typeDef.name) !== -1;
    };

//#endregion
