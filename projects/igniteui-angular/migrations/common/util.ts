import { normalize } from '@angular-devkit/core';
import * as path from 'path';
import { SchematicContext, Tree } from '@angular-devkit/schematics';
import { WorkspaceSchema, WorkspaceProject } from '@schematics/angular/utility/workspace-models';
import { execSync } from 'child_process';
import {
    Attribute,
    Comment,
    Element,
    Expansion,
    ExpansionCase,
    getHtmlTagDefinition,
    HtmlParser,
    Node,
    Text,
    Visitor
} from '@angular/compiler';
import { replaceMatch } from './tsUtils';

const configPaths = ['/.angular.json', '/angular.json'];

export const getProjectPaths = (config: WorkspaceSchema): string[] => {
    const sourceDirs = [];

    const projects = getProjects(config);
    for (const proj of projects) {
        const sourcePath = path.join('/', proj.sourceRoot);
        sourceDirs.push(normalize(sourcePath));
    }
    return sourceDirs;
};

export const getWorkspacePath = (host: Tree): string => configPaths.find(x => host.exists(x));

export const getWorkspace = (host: Tree): WorkspaceSchema => {
    const configPath = getWorkspacePath(host);
    if (configPath) {
        return JSON.parse(host.read(configPath).toString());
    }
    return null;
};

export const getProjects = (config: WorkspaceSchema): WorkspaceProject[] => {
    const projects: WorkspaceProject[] = [];

    for (const projName of Object.keys(config.projects)) {
        const proj = config.projects[projName];
        if ((proj.architect && proj.architect.e2e && !proj.architect.build)) {
            // skip old style e2e-only projects
            continue;
        }
        projects.push(proj);
    }
    return projects;
};

export const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string

export const supports = (name: string): boolean => {
    try {
        execSync(`${name} --version`, { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
};

export const getPackageManager = (host: Tree) => {
    const hasYarn = supports('yarn');
    const hasYarnLock = host.exists('yarn.lock');
    if (hasYarn && hasYarnLock) {
        return 'yarn';
    }
    return 'npm';
};

export const canResolvePackage = (pkg: string): boolean => {
    try {
        // attempt resolve in child process to keep result out of package.json cache
        // otherwise resolve will not read the json again (after install) and won't load the main correctly
        // https://stackoverflow.com/questions/59865584/how-to-invalidate-cached-require-resolve-results
        execSync(`node -e "require.resolve('${pkg}');"`, { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
};

export const getPackageVersion = (pkg: string): string => {
    let version = null;
    try {
        version = require(path.posix.join(pkg, 'package.json'))?.version;
    } catch {}

    return version;
};

export const tryInstallPackage = (context: SchematicContext, packageManager: string, pkg: string) => {
    try {
        context.logger.debug(`Installing ${pkg} via ${packageManager}.`);
        switch (packageManager) {
            case 'yarn':
                execSync(`${packageManager} add ${pkg} --no-lock-file`, { stdio: 'ignore' });
                break;
            case 'npm':
                execSync(`${packageManager} i ${pkg} --no-save`, { stdio: 'ignore' });
                break;
        }
        context.logger.debug(`${pkg} installed successfully.`);
    } catch (e) {
        context.logger.warn(`Could not install ${pkg}.`, JSON.parse(e));
    }
};

export const tryUninstallPackage = (context: SchematicContext, packageManager: string, pkg: string) => {
    try {
        context.logger.debug(`Uninstalling ${pkg} via ${packageManager}`);
        switch (packageManager) {
            case 'yarn':
                execSync(`${packageManager} remove ${pkg}`, { stdio: 'ignore' });
                break;
            case 'npm':
                execSync(`${packageManager} uninstall ${pkg} --no-save`, { stdio: 'ignore' });
                break;
        }
        context.logger.debug(`${pkg} uninstalled successfully.`);
    } catch (e) {
        context.logger
            .warn(`Could not uninstall ${pkg}, you may want to uninstall it manually.`, JSON.parse(e));
    }
};

interface TagOffset {
    start: number;
    end: number;
}

export interface SourceOffset {
    startTag: TagOffset;
    endTag: TagOffset;
    file: {
        content: string;
        url: string;
    };
    node?: Element;
}


export class FileChange {

    constructor(
        public position = 0,
        public text = '',
        public replaceText = '',
        public type: 'insert' | 'replace' = 'insert'
        ) {}

    apply(content: string) {
        if (this.type === 'insert') {
            return `${content.substring(0, this.position)}${this.text}${content.substring(this.position)}`;
        }
        return replaceMatch(content, this.replaceText, this.text, this.position);
    }
}

/**
 * Parses an Angular template file/content and returns an array of the root nodes of the file.
 *
 * @param host
 * @param filePath
 * @param encoding
 */
export const parseFile = (host: Tree, filePath: string, encoding = 'utf8') =>
    new HtmlParser().parse(host.read(filePath).toString(encoding), filePath).rootNodes;

export const findElementNodes = (root: Node[], tag: string | string[]): Node[] => {
    const tags = new Set(Array.isArray(tag) ? tag : [tag]);
    return flatten(Array.isArray(root) ? root : [root])
        .filter((node: Element) => tags.has(node.name));
};

export const hasAttribute = (root: Element, attribute: string | string[]) => {
    const attrs = Array.isArray(attribute) ? attribute : [attribute];
    return !!root.attrs.find(a => attrs.includes(a.name));
};

export const getAttribute = (root: Element, attribute: string | string[]) => {
    const attrs = Array.isArray(attribute) ? attribute : [attribute];
    return root.attrs.filter(a => attrs.includes(a.name));
};

export const getSourceOffset = (element: Element): SourceOffset => {
    const { startSourceSpan, endSourceSpan } = element;
    return {
        startTag: { start: startSourceSpan.start.offset, end: startSourceSpan.end.offset },
        endTag: { start: endSourceSpan.start.offset, end: endSourceSpan.end.offset },
        file: {
            content: startSourceSpan.start.file.content,
            url: startSourceSpan.start.file.url
        },
        node: element
    };
};


const isElement = (node: Node | Element): boolean => (node as Element).children !== undefined;

/**
 * Given an array of `Node` objects, flattens the ast tree to a single array.
 * De facto only `Element` type objects have children.
 *
 * @param list
 */
export const flatten = (list: Node[]) => {
    let r: Node[] = [];

    for (const node of list) {
        r.push(node);

        if (isElement(node)) {
            r = r.concat(flatten((node as Element).children));
        }
    }
    return r;
};

/**
 * https://github.com/angular/angular/blob/master/packages/compiler/test/ml_parser/util/util.ts
 *
 * May be useful for validating the output of our own migrations,
 */
class SerializerVisitor implements Visitor {

    visitElement(element: Element, context: any): any {
        if (getHtmlTagDefinition(element.name).isVoid) {
            return `<${element.name}${this._visitAll(element.attrs, ' ')}/>`;
        }

        return `<${element.name}${this._visitAll(element.attrs, ' ')}>${this._visitAll(element.children)}</${element.name}>`;
    }

    visitAttribute(attribute: Attribute, context: any): any {
        return attribute.value === '' ? `${attribute.name}` : `${attribute.name}="${attribute.value}"`;
    }

    visitText(text: Text, context: any): any {
        return text.value;
    }

    visitComment(comment: Comment, context: any): any {
        return `<!--${comment.value}-->`;
    }

    visitExpansion(expansion: Expansion, context: any): any {
        return `{${expansion.switchValue}, ${expansion.type},${this._visitAll(expansion.cases)}}`;
    }

    visitExpansionCase(expansionCase: ExpansionCase, context: any): any {
        return ` ${expansionCase.value} {${this._visitAll(expansionCase.expression)}}`;
    }

    private _visitAll(nodes: Node[], join: string = ''): string {
        if (nodes.length === 0) {
            return '';
        }
        return join + nodes.map(a => a.visit(this, null)).join(join);
    }
}


export const serializeNodes = (nodes: Node[]): string[] => nodes.map(node => node.visit(new SerializerVisitor(), null));
