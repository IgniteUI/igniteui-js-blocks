import { EmptyTree } from '@angular-devkit/schematics';
import { UnitTestTree } from '@angular-devkit/schematics/testing';
import * as fs from 'fs';
import * as path from 'path';
import { ClassChanges, BindingChanges, SelectorChanges, ThemePropertyChanges, ImportsChanges, ElementType } from './schema';
import { UpdateChanges, InputPropertyType, BoundPropertyObject } from './UpdateChanges';
import * as tsUtils from './tsUtils';

describe('UpdateChanges', () => {
    let appTree: UnitTestTree;

    class UnitUpdateChanges extends UpdateChanges {
        public getSelectorChanges() {
            return this.selectorChanges;
        }
        public getClassChanges() {
            return this.classChanges;
        }
        public getOutputChanges() {
            return this.outputChanges;
        }
        public getInputChanges() {
            return this.inputChanges;
        }
        public getThemePropChanges() {
            return this.themePropsChanges;
        }
        public getImportsChanges() {
            return this.importsChanges;
        }
    }

    beforeEach(() => {
        appTree = new UnitTestTree(new EmptyTree());
        appTree.create('/angular.json', JSON.stringify({
            projects: {
                testProj: {
                    sourceRoot: '/'
                }
            }
        }));
    });

    it('should replace/remove components', done => {
        const selectorsJson: SelectorChanges = {
            changes: [
                { type: 'component' as any, selector: 'igx-component', replaceWith: 'igx-replaced' },
                { type: 'component' as any, selector: 'igx-remove', remove: true }
            ]
        };
        const jsonPath = path.join(__dirname, 'changes', 'selectors.json');
        spyOn(fs, 'existsSync').and.callFake((filePath: string) => {
            if (filePath === jsonPath) {
                return true;
            }
            return false;
        });
        spyOn(fs, 'readFileSync').and.returnValue(JSON.stringify(selectorsJson));

        appTree.create(
            'test.component.html',
            '<igx-component> <content> <igx-remove></igx-remove> </igx-component> <igx-remove> <content> </igx-remove>'
        );
        appTree.create(
            'test2.component.html',
            '<igx-remove attr></igx-remove><igx-component>'
        );

        const update = new UnitUpdateChanges(__dirname, appTree);
        expect(fs.existsSync).toHaveBeenCalledWith(jsonPath);
        expect(fs.readFileSync).toHaveBeenCalledWith(jsonPath, 'utf-8');
        expect(update.getSelectorChanges()).toEqual(selectorsJson);

        update.applyChanges();
        expect(appTree.readContent('test.component.html')).toEqual('<igx-replaced> <content>  </igx-replaced> ');
        expect(appTree.readContent('test2.component.html')).toEqual('<igx-replaced>');
        done();
    });

    it('should replace/remove directives', done => {
        const selectorsJson: SelectorChanges = {
            changes: [
                { type: 'directive' as any, selector: 'igxDirective', replaceWith: 'igxReplaced' },
                { type: 'directive' as any, selector: 'igxRemove', remove: true }
            ]
        };
        const jsonPath = path.join(__dirname, 'changes', 'selectors.json');
        spyOn(fs, 'existsSync').and.callFake((filePath: string) => {
            if (filePath === jsonPath) {
                return true;
            }
            return false;
        });
        spyOn(fs, 'readFileSync').and.returnValue(JSON.stringify(selectorsJson));

        appTree.create(
            'test.component.html',
            `<igx-component [igxDirective]="val" igxRemove> <content igxDirective [igxRemove]="val"> </igx-component>` +
            `<igx-component2 [igxRemove]='val'> <content> </igx-component2>`
        );

        const update = new UnitUpdateChanges(__dirname, appTree);
        expect(update.getSelectorChanges()).toEqual(selectorsJson);

        update.applyChanges();
        expect(appTree.readContent('test.component.html')).toEqual(
            `<igx-component [igxReplaced]="val"> <content igxReplaced> </igx-component>` +
            `<igx-component2> <content> </igx-component2>`);
        done();
    });

    it('should replace/remove outputs', done => {
        const outputJson: BindingChanges = {
            changes: [
                {
                    name: 'onReplaceMe', replaceWith: 'replaced',
                    owner: { type: 'component' as any, selector: 'comp' }
                },
                {
                    name: 'onOld', remove: true,
                    owner: { type: 'component' as any, selector: 'another' }
                }
            ]
        };
        const jsonPath = path.join(__dirname, 'changes', 'outputs.json');
        spyOn(fs, 'existsSync').and.callFake((filePath: string) => {
            if (filePath === jsonPath) {
                return true;
            }
            return false;
        });
        spyOn<any>(fs, 'readFileSync').and.callFake(() => JSON.stringify(outputJson));

        const fileContent = `<one (onReplaceMe)="a"> <comp\r\ntag (onReplaceMe)="dwdw" (onOld)=""> </other> <another (onOld)="b" />`;
        appTree.create('test.component.html', fileContent);

        const update = new UnitUpdateChanges(__dirname, appTree);
        expect(fs.existsSync).toHaveBeenCalledWith(jsonPath);
        expect(fs.readFileSync).toHaveBeenCalledWith(jsonPath, 'utf-8');
        expect(update.getOutputChanges()).toEqual(outputJson);

        update.applyChanges();
        expect(appTree.readContent('test.component.html')).toEqual(
            `<one (onReplaceMe)="a"> <comp\r\ntag (replaced)="dwdw" (onOld)=""> </other> <another />`);

        outputJson.changes[0].owner = { type: 'directive' as any, selector: 'tag' };
        outputJson.changes[1].owner = { type: 'directive' as any, selector: 'tag' };
        appTree.overwrite('test.component.html', fileContent);
        const update2 = new UnitUpdateChanges(__dirname, appTree);
        update2.applyChanges();
        expect(appTree.readContent('test.component.html')).toEqual(
            `<one (onReplaceMe)="a"> <comp\r\ntag (replaced)="dwdw"> </other> <another (onOld)="b" />`);
        done();
    });

    it('should replace/remove inputs', done => {
        const inputJson: BindingChanges = {
            changes: [
                {
                    name: 'replaceMe', replaceWith: 'replaced',
                    owner: { type: 'component' as any, selector: 'comp' }
                },
                {
                    name: 'oldProp', remove: true,
                    owner: { type: 'component' as any, selector: 'another' }
                }
            ]
        };
        const jsonPath = path.join(__dirname, 'changes', 'inputs.json');
        spyOn(fs, 'existsSync').and.callFake((filePath: string) => {
            if (filePath === jsonPath) {
                return true;
            }
            return false;
        });
        spyOn<any>(fs, 'readFileSync').and.callFake(() => JSON.stringify(inputJson));

        const fileContent = `<one [replaceMe]="a"> <comp\r\ntag [replaceMe]="dwdw" [oldProp]=''> </other> <another oldProp="b" />`;
        appTree.create('test.component.html', fileContent);

        const update = new UnitUpdateChanges(__dirname, appTree);
        expect(fs.existsSync).toHaveBeenCalledWith(jsonPath);
        expect(fs.readFileSync).toHaveBeenCalledWith(jsonPath, 'utf-8');
        expect(update.getInputChanges()).toEqual(inputJson);

        update.applyChanges();
        expect(appTree.readContent('test.component.html')).toEqual(
            `<one [replaceMe]="a"> <comp\r\ntag [replaced]="dwdw" [oldProp]=''> </other> <another />`);

        inputJson.changes[1].remove = false;
        inputJson.changes[1].replaceWith = 'oldReplaced';
        appTree.overwrite('test.component.html', fileContent);
        const update2 = new UnitUpdateChanges(__dirname, appTree);
        update2.applyChanges();
        expect(appTree.readContent('test.component.html')).toEqual(
            `<one [replaceMe]="a"> <comp\r\ntag [replaced]="dwdw" [oldProp]=''> </other> <another oldReplaced="b" />`);
        inputJson.changes[1].remove = true;

        inputJson.changes[0].owner = { type: 'directive' as any, selector: 'tag' };
        inputJson.changes[1].owner = { type: 'directive' as any, selector: 'tag' };
        appTree.overwrite('test.component.html', fileContent);
        const update3 = new UnitUpdateChanges(__dirname, appTree);
        update3.applyChanges();
        expect(appTree.readContent('test.component.html')).toEqual(
            `<one [replaceMe]="a"> <comp\r\ntag [replaced]="dwdw"> </other> <another oldProp="b" />`);

        inputJson.changes[1].owner = { type: 'component' as any, selector: 'another' };
        inputJson.changes[0].owner = { type: 'component' as any, selector: 'comp' };
        const fileContent2 =
        `<comp\r\ntag [oldProp]="g" [replaceMe]="NOT.replaceMe" ><another oldProp="g" [otherProp]="oldProp" /></comp>`;
        appTree.overwrite('test.component.html', fileContent2);
        const update4 = new UnitUpdateChanges(__dirname, appTree);
        update4.applyChanges();
        expect(appTree.readContent('test.component.html')).toEqual(
            `<comp\r\ntag [oldProp]="g" [replaced]="NOT.replaceMe" ><another [otherProp]="oldProp" /></comp>`);
        done();
    });

    it('should replace class identifiers', done => {
        const classJson: ClassChanges = {
            changes: [
                {
                    name: 'igxClass', replaceWith: 'igxReplace'
                },
                {
                    name: 'igxClass2', replaceWith: 'igxSecond'
                }
            ]
        };
        const jsonPath = path.join(__dirname, 'changes', 'classes.json');
        spyOn(fs, 'existsSync').and.callFake((filePath: string) => {
            if (filePath === jsonPath) {
                return true;
            }
            return false;
        });
        spyOn<any>(fs, 'readFileSync').and.callFake(() => JSON.stringify(classJson));

        const fileContent =
            `import { igxClass, igxClass2 } from "igniteui-angular"; export class Test { prop: igxClass; prop2: igxClass2; }`;
        appTree.create('test.component.ts', fileContent);

        const update = new UnitUpdateChanges(__dirname, appTree);
        expect(fs.existsSync).toHaveBeenCalledWith(jsonPath);
        expect(fs.readFileSync).toHaveBeenCalledWith(jsonPath, 'utf-8');
        expect(update.getClassChanges()).toEqual(classJson);

        update.applyChanges();
        expect(appTree.readContent('test.component.ts')).toEqual(
            `import { igxReplace, igxSecond } from "igniteui-angular"; export class Test { prop: igxReplace; prop2: igxSecond; }`);

        done();
    });

    it('should replace class identifiers (complex file)', done => {
        const classJson: ClassChanges = {
            changes: [
                { name: 'IgxGridComponent', replaceWith: 'IgxGridReplace' },
                { name: 'IgxColumnComponent', replaceWith: 'IgxColumnReplace' },
                { name: 'IgxProvided', replaceWith: 'IgxProvidedReplace' },
                { name: 'STRING_FILTERS', replaceWith: 'REPLACED_CONST' },
                { name: 'IgxCsvExporterService', replaceWith: 'Injected' },
                { name: 'IgxExcelExporterOptions', replaceWith: 'IgxNewable' },
                // partial match:
                { name: 'IgxExporterOptionsBase', replaceWith: 'ReturnType' },
                // no actual matches:
                { name: 'NotType', replaceWith: 'Nope' },
                { name: 'NotAgain', replaceWith: 'NopeAgain' }
            ]
        };
        const jsonPath = path.join(__dirname, 'changes', 'classes.json');
        spyOn(fs, 'existsSync').and.callFake((filePath: string) => {
            if (filePath === jsonPath) {
                return true;
            }
            return false;
        });
        spyOn<any>(fs, 'readFileSync').and.callFake(() => JSON.stringify(classJson));

        const fileContent =
            `import { Component, Injectable, ViewChild } from "@angular/core";` +
            `import { IgxGridComponent } from "igniteui-angular";` +
            `import { IgxColumnComponent, IgxProvided, STRING_FILTERS} from "igniteui-angular";\r\n` +
            `import {` +
            `    IgxCsvExporterService,` +
            `    IgxExcelExporterOptions,` +
            `    IgxExporterOptionsBase` +
            `} from "igniteui-angular";\r\n` +
            `@Component({` +
            `    providers: [IgxProvided, RemoteService]` +
            `})` +
            `export class GridSampleComponent {` +
            `    @ViewChild("grid1", { read: IgxGridComponent }) public grid1: IgxGridComponent;` +
            `    // prop definitions to ignore:\r\n` +
            `    NotType: { NotAgain: string; extraProp: IgxExcelExporterOptions, IgxExcelExporterOptions: string } = {` +
            `        NotAgain: "hai",` +
            `        extraProp: new IgxExcelExporterOptions(),` +
            `        IgxExcelExporterOptions: "fake"` +
            `    }` +
            `    constructor(private csvExporterService: IgxCsvExporterService) { }` +
            `    public initColumns(event: IgxColumnComponent) {` +
            `        const column: IgxColumnComponent = event;` +
            `        this.grid1.filter("ProductName", "Queso", STRING_FILTERS.contains, true);` +
            `    }` +
            `    private getOptions(fileName: string): IgxExporterOptionsBase {` +
            `        return new IgxExcelExporterOptions(fileName);` +
            `    }` +
            `}`
            ;
        appTree.create('test.component.ts', fileContent);

        const update = new UnitUpdateChanges(__dirname, appTree);
        expect(fs.existsSync).toHaveBeenCalledWith(jsonPath);
        expect(fs.readFileSync).toHaveBeenCalledWith(jsonPath, 'utf-8');
        expect(update.getClassChanges()).toEqual(classJson);

        update.applyChanges();
        expect(appTree.readContent('test.component.ts')).toEqual(
            `import { Component, Injectable, ViewChild } from "@angular/core";` +
            `import { IgxGridReplace } from "igniteui-angular";` +
            `import { IgxColumnReplace, IgxProvidedReplace, REPLACED_CONST} from "igniteui-angular";\r\n` +
            `import {` +
            `    Injected,` +
            `    IgxNewable,` +
            `    ReturnType` +
            `} from "igniteui-angular";\r\n` +
            `@Component({` +
            `    providers: [IgxProvidedReplace, RemoteService]` +
            `})` +
            `export class GridSampleComponent {` +
            `    @ViewChild("grid1", { read: IgxGridReplace }) public grid1: IgxGridReplace;` +
            `    // prop definitions to ignore:\r\n` +
            `    NotType: { NotAgain: string; extraProp: IgxNewable, IgxExcelExporterOptions: string } = {` +
            `        NotAgain: "hai",` +
            `        extraProp: new IgxNewable(),` +
            `        IgxExcelExporterOptions: "fake"` +
            `    }` +
            `    constructor(private csvExporterService: Injected) { }` +
            `    public initColumns(event: IgxColumnReplace) {` +
            `        const column: IgxColumnReplace = event;` +
            `        this.grid1.filter("ProductName", "Queso", REPLACED_CONST.contains, true);` +
            `    }` +
            `    private getOptions(fileName: string): ReturnType {` +
            `        return new IgxNewable(fileName);` +
            `    }` +
            `}`
        );

        done();
    });

    it('should correctly ignore types not from igniteui-angular', () => {
        const classJson: ClassChanges = {
            changes: [
                { name: 'Name', replaceWith: 'NameName' },
                { name: 'Another', replaceWith: 'Other' },
            ]
        };
        const jsonPath = path.join(__dirname, 'changes', 'classes.json');
        spyOn(fs, 'existsSync').and.callFake((filePath: string) => {
            if (filePath === jsonPath) {
                return true;
            }
            return false;
        });
        spyOn<any>(fs, 'readFileSync').and.callFake(() => JSON.stringify(classJson));

        const fileContent =
            `import { Name } from ""; import { Another } from "@space/package"; export class Test { prop: Name; prop2: Another; }`;
        appTree.create('test.component.ts', fileContent);

        const update = new UnitUpdateChanges(__dirname, appTree);
        expect(update.getClassChanges()).toEqual(classJson);

        spyOn(tsUtils, 'getRenamePositions').and.callThrough();

        update.applyChanges();
        expect(tsUtils.getRenamePositions).toHaveBeenCalledWith('/test.component.ts', 'Name', jasmine.anything());
        expect(tsUtils.getRenamePositions).toHaveBeenCalledWith('/test.component.ts', 'Another', jasmine.anything());
        expect(appTree.readContent('test.component.ts')).toEqual(fileContent);
    });

    it('should correctly rename aliased imports and handle collision from other packages', () => {
        const classJson: ClassChanges = {
            changes: [
                { name: 'Type', replaceWith: 'IgxType' },
                { name: 'Size', replaceWith: 'IgxSize' },
                { name: 'IgxService', replaceWith: 'IgxService1' },
                { name: 'IgxDiffService', replaceWith: 'IgxNewDiffService' },
                { name: 'Calendar', replaceWith: 'CalendarActual' }
            ]
        };
        const jsonPath = path.join(__dirname, 'changes', 'classes.json');
        spyOn(fs, 'existsSync').and.callFake((filePath: string) => {
            if (filePath === jsonPath) {
                return true;
            }
            return false;
        });
        spyOn<any>(fs, 'readFileSync').and.callFake(() => JSON.stringify(classJson));

        let fileContent =
`import { Size, Type as someThg } from "igniteui-angular";
import { IgxService, IgxDiffService as eDiffService, Calendar as Calendar } from 'igniteui-angular';
import { Type } from "@angular/core";
export class Test {
    prop: Type;
    prop1: someThg;
    prop2: Size = { prop: "Size" };
    secondary: eDiffService;
    cal: Calendar;

    constructor (public router: Router, private _iconService: IgxService) {}
}`;
        appTree.create('test.component.ts', fileContent);

        const update = new UnitUpdateChanges(__dirname, appTree);
        expect(fs.existsSync).toHaveBeenCalledWith(jsonPath);
        expect(fs.readFileSync).toHaveBeenCalledWith(jsonPath, 'utf-8');
        expect(update.getClassChanges()).toEqual(classJson);

        update.applyChanges();
        let expectedFileContent =
`import { IgxSize, IgxType as someThg } from "igniteui-angular";
import { IgxService1, IgxNewDiffService as eDiffService, CalendarActual as Calendar } from 'igniteui-angular';
import { Type } from "@angular/core";
export class Test {
    prop: Type;
    prop1: someThg;
    prop2: IgxSize = { prop: "Size" };
    secondary: eDiffService;
    cal: Calendar;

    constructor (public router: Router, private _iconService: IgxService1) {}
}`;
        expect(appTree.readContent('test.component.ts')).toEqual(expectedFileContent);

        // with ig feed package:
        fileContent = fileContent.replace(/igniteui-angular/g, '@infragistics/igniteui-angular');
        expectedFileContent = expectedFileContent.replace(/igniteui-angular/g, '@infragistics/igniteui-angular');
        appTree.overwrite('test.component.ts', fileContent);
        update.applyChanges();
        expect(appTree.readContent('test.component.ts')).toEqual(expectedFileContent);
    });

    it('should move property value between element tags', done => {
        const inputJson: BindingChanges = {
            changes: [
                {
                    name: 'name',
                    moveBetweenElementTags: true,
                    conditions: ['igxIcon_is_material_name'],
                    owner: { type: 'component' as any, selector: 'igx-icon' }
                }
            ]
        };
        const jsonPath = path.join(__dirname, 'changes', 'inputs.json');
        spyOn(fs, 'existsSync').and.callFake((filePath: string) => {
            if (filePath === jsonPath) {
                return true;
            }
            return false;
        });
        spyOn<any>(fs, 'readFileSync').and.callFake(() => JSON.stringify(inputJson));

        const fileContent = `<igx-icon fontSet='material' name='phone'></igx-icon>
<igx-icon fontSet="material-icons" name="build"></igx-icon>
<igx-icon name="accessory"></igx-icon>`;
        appTree.create('test.component.html', fileContent);

        const fileContent1 = `<igx-icon fontSet="material" [name]="'phone'"></igx-icon>
<igx-icon fontSet="material-icons" [name]="getName()"></igx-icon>`;
        appTree.create('test1.component.html', fileContent1);

        const update = new UnitUpdateChanges(__dirname, appTree);
        update.addCondition('igxIcon_is_material_name', () => true);

        expect(fs.existsSync).toHaveBeenCalledWith(jsonPath);
        expect(fs.readFileSync).toHaveBeenCalledWith(jsonPath, 'utf-8');
        expect(update.getInputChanges()).toEqual(inputJson);

        update.applyChanges();
        expect(appTree.readContent('test.component.html')).toEqual(
`<igx-icon fontSet='material'>phone</igx-icon>
<igx-icon fontSet="material-icons">build</igx-icon>
<igx-icon>accessory</igx-icon>`);

        expect(appTree.readContent('test1.component.html')).toEqual(
`<igx-icon fontSet="material">{{'phone'}}</igx-icon>
<igx-icon fontSet="material-icons">{{getName()}}</igx-icon>`);

        done();
    });

    it('should replace/remove inputs', done => {
        const themePropsJson: ThemePropertyChanges = {
            changes: [
                {
                    name: '$replace-me', replaceWith: '$replaced',
                    owner: 'igx-theme-func'
                },
                {
                    name: '$remove-me', remove: true,
                    owner: 'igx-theme-func'
                },
                {
                    name: '$old-prop', remove: true,
                    owner: 'igx-comp-theme'
                }
            ]
        };
        const jsonPath = path.join(__dirname, 'changes', 'theme-props.json');
        spyOn(fs, 'existsSync').and.callFake((filePath: string) => {
            if (filePath === jsonPath) {
                return true;
            }
            return false;
        });
        spyOn<any>(fs, 'readFileSync').and.callFake(() => JSON.stringify(themePropsJson));

        const fileContent =
`$var: igx-theme-func(
    $prop1: red,
    $replace-me: 3,
    $remove-me: 0px,
    $prop2: 2
);
$var2: igx-comp-theme(
    $replace-me: not,
    $old-prop: func(val)
);

$var3: igx-comp-theme(
    $replace-me: not,
    $old-prop: func(val, 3, 4),
    $prop3: 1
);`;
        appTree.create('styles.scss', fileContent);
        appTree.create('src/app/app.component.sass', `igx-comp-theme($replace-me: not, $old-prop: 3, $prop3: 2);`);
        appTree.create('test.component.sass', `igx-theme-func($replace-me: 10px, $old-prop: 3, $prop3: 2);`);

        const update = new UnitUpdateChanges(__dirname, appTree);
        expect(fs.existsSync).toHaveBeenCalledWith(jsonPath);
        expect(fs.readFileSync).toHaveBeenCalledWith(jsonPath, 'utf-8');
        expect(update.getThemePropChanges()).toEqual(themePropsJson);

        update.applyChanges();
        expect(appTree.readContent('styles.scss')).toEqual(
`$var: igx-theme-func(
    $prop1: red,
    $replaced: 3,
    $prop2: 2
);
$var2: igx-comp-theme(
    $replace-me: not
);

$var3: igx-comp-theme(
    $replace-me: not,
    $prop3: 1
);`);
        expect(appTree.readContent('src/app/app.component.sass')).toEqual(`igx-comp-theme($replace-me: not, $prop3: 2);`);
        expect(appTree.readContent('test.component.sass')).toEqual(`igx-theme-func($replaced: 10px, $old-prop: 3, $prop3: 2);`);
        done();
    });

    it('should replace imports', done => {
        const importsJson: ImportsChanges = {
            changes: [
                {
                    name: 'IgxIconModule.forRoot()', replaceWith: 'IgxIconModule'
                },
                {
                    name: 'module1', replaceWith: 'module2'
                }
            ]
        };
        const jsonPath = path.join(__dirname, 'changes', 'imports.json');
        spyOn(fs, 'existsSync').and.callFake((filePath: string) => {
            if (filePath === jsonPath) {
                return true;
            }
            return false;
        });
        spyOn<any>(fs, 'readFileSync').and.callFake(() => JSON.stringify(importsJson));

        const fileContent = `
@NgModule({
    declarations: components,
    imports: [
        IgxIconModule.forRoot(),
        IgxGridModule,
        IgxTreeGridModule,
        module1
    ],
    providers: [
        LocalService,
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }`;
        appTree.create('app.module.ts', fileContent);

        const update = new UnitUpdateChanges(__dirname, appTree);
        expect(fs.existsSync).toHaveBeenCalledWith(jsonPath);
        expect(fs.readFileSync).toHaveBeenCalledWith(jsonPath, 'utf-8');
        expect(update.getImportsChanges()).toEqual(importsJson);

        update.applyChanges();
        expect(appTree.readContent('app.module.ts')).toEqual(`
@NgModule({
    declarations: components,
    imports: [
        IgxIconModule,
        IgxGridModule,
        IgxTreeGridModule,
        module2
    ],
    providers: [
        LocalService,
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }`);

        done();
    });

    it('should handle changes with valueTransform functions', done => {
        const inputsJson: BindingChanges = {
            changes: [{
                name: 'someProp',
                replaceWith: 'someOtherProp',
                valueTransform: 'some_prop_transform',
                owner: {
                    selector: 'igx-component',
                    type: ElementType.Component
                }
            }]
        };
        const jsonPath = path.join(__dirname, 'changes', 'inputs.json');
        spyOn(fs, 'existsSync').and.callFake((filePath: string) => {
            if (filePath === jsonPath) {
                return true;
            }
            return false;
        });
        spyOn(fs, 'readFileSync').and.returnValue(JSON.stringify(inputsJson));

        // bracketed
        appTree.create(
            'test.component.html',
            '<igx-component [someProp]="true"></igx-component>'
        );

        // No brackets
        appTree.create(
            'test2.component.html',
            '<igx-component someProp="otherVal"></igx-component>'
        );

        // Small quotes
        appTree.create(
            'test3.component.html',
            `<igx-component someProp='otherVal'></igx-component>`
        );

        // Multiple occurances
        appTree.create(
            'test4.component.html',
            `<igx-component [someProp]="true"><igx-component>
<igx-component [someProp]="false" [someProp]="false" [someProp]="false" [someProp]="false"><igx-component>
<igx-component someProp="true"><igx-component>
<igx-component someProp="false"><igx-component>`
        );

        const update = new UnitUpdateChanges(__dirname, appTree);
        expect(fs.existsSync).toHaveBeenCalledWith(jsonPath);
        expect(fs.readFileSync).toHaveBeenCalledWith(jsonPath, 'utf-8');
        expect(update.getInputChanges()).toEqual(inputsJson);
        update.addValueTransform('some_prop_transform', (args: BoundPropertyObject): void => {
            if (args.bindingType === InputPropertyType.EVAL) {
                    args.value = args.value === 'true' ? '\'trueValue\'' : '\'falseValue\'';
            } else {
                args.value = args.value === 'true' ? 'trueValue' : 'falseValue';
            }
        });

        update.applyChanges();
        expect(appTree.readContent('test.component.html')).toEqual(`<igx-component [someOtherProp]="'trueValue'"></igx-component>`);
        expect(appTree.readContent('test2.component.html')).toEqual(`<igx-component someOtherProp="falseValue"></igx-component>`);
        expect(appTree.readContent('test3.component.html')).toEqual(`<igx-component someOtherProp='falseValue'></igx-component>`);
        expect(appTree.readContent('test4.component.html')).toEqual(`<igx-component [someOtherProp]="'trueValue'"><igx-component>\n` +
// eslint-disable-next-line max-len
`<igx-component [someOtherProp]="'falseValue'" [someOtherProp]="'falseValue'" [someOtherProp]="'falseValue'" [someOtherProp]="'falseValue'"><igx-component>
<igx-component someOtherProp="trueValue"><igx-component>
<igx-component someOtherProp="falseValue"><igx-component>`);
        done();
    });

    it('Should be able to change binding type via transform function', done => {
        const inputsJson: BindingChanges = {
            changes: [{
                name: 'prop',
                replaceWith: 'newProp',
                valueTransform: 'prop_transform',
                owner: {
                    selector: 'igx-component',
                    type: ElementType.Component
                }
            }]
        };
        const jsonPath = path.join(__dirname, 'changes', 'inputs.json');
        spyOn(fs, 'existsSync').and.callFake((filePath: string) => {
            if (filePath === jsonPath) {
                return true;
            }
            return false;
        });
        spyOn(fs, 'readFileSync').and.returnValue(JSON.stringify(inputsJson));

        // bracketed
        appTree.create(
            'test-bound-to-string.component.html',
            `<igx-component [prop]="true">STRING</igx-component>
<igx-component [prop]="false">STRING</igx-component>
<igx-component [prop]="someOtherProperty">BOUND</igx-component>`
        );
        appTree.create(
            'test-string-to-bound.component.html',
            `<igx-component prop="changeThisToBound">BOUND</igx-component>
<igx-component prop="leaveMeBe">STRING</igx-component>`
        );

        const update = new UnitUpdateChanges(__dirname, appTree);
        expect(fs.existsSync).toHaveBeenCalledWith(jsonPath);
        expect(fs.readFileSync).toHaveBeenCalledWith(jsonPath, 'utf-8');
        expect(update.getInputChanges()).toEqual(inputsJson);
        update.addValueTransform('prop_transform', (args: BoundPropertyObject): void => {
            if (args.bindingType === InputPropertyType.EVAL) {
                switch (args.value) {
                    case 'true':
                        args.value = 'TRUTHY-STRING-VALUE';
                        args.bindingType = InputPropertyType.STRING;
                    break;
                    case 'false':
                        args.value = 'FALSY-STRING-VALUE';
                        args.bindingType = InputPropertyType.STRING;
                        break;
                    default:
                        args.value += ' ? true : false';
                }
            } else {
                if (args.value === 'changeThisToBound') {
                    args.bindingType = InputPropertyType.EVAL;
                    args.value = 'true';
                }
            }
        });

        update.applyChanges();
        expect(appTree.readContent('test-bound-to-string.component.html')).toEqual(
`<igx-component newProp="TRUTHY-STRING-VALUE">STRING</igx-component>
<igx-component newProp="FALSY-STRING-VALUE">STRING</igx-component>
<igx-component [newProp]="someOtherProperty ? true : false">BOUND</igx-component>`);
        expect(appTree.readContent('test-string-to-bound.component.html')).toEqual(
`<igx-component [newProp]="true">BOUND</igx-component>
<igx-component newProp="leaveMeBe">STRING</igx-component>`);
        done();
    });

    describe('Project loading', () => {
        it('should correctly load project files', () => {
            const tsFile = '/src/component.ts';
            const htmlFile = '/src/component.html';
            const scssFile = '/src/component.scss';
            const sassFile = '/src/component.sass';
            appTree.overwrite('/angular.json', JSON.stringify({
                projects: {
                    testProj: {
                        sourceRoot: '/src'
                    }
                }
            }));
            appTree.create(tsFile, '');
            appTree.create(htmlFile, '');
            appTree.create(scssFile, '');
            appTree.create(sassFile, '');

            // skip loading json config files
            spyOn(fs, 'existsSync').and.returnValue(false);

            const update = new UnitUpdateChanges(__dirname, appTree);
            expect(update.tsFiles).toContain(tsFile);
            expect(update.templateFiles).toContain(htmlFile);
            expect(update.sassFiles).toContain(scssFile);
            expect(update.sassFiles).toContain(sassFile);
        });

        it('should correctly load multiple and library project files', () => {
            const tsFile = 'component.ts';
            const htmlFile = 'component.html';
            const scssFile = 'component.scss';
            const sassFile = 'component.sass';
            const workspace = {
                projects: {
                    testProj: {
                        projectType: 'application',
                        sourceRoot: 'src-one'
                    },
                    test2Proj: {
                        projectType: 'application',
                        sourceRoot: '/src-two'
                    },
                    libProj: {
                        projectType: 'library',
                        sourceRoot: 'src-lib'
                    }
                }
            };
            appTree.overwrite('/angular.json', JSON.stringify(workspace));
            for (const projName of Object.keys(workspace.projects)) {
                const root = workspace.projects[projName].sourceRoot;
                appTree.create(path.posix.join(root, tsFile), '');
                appTree.create(path.posix.join(root, htmlFile), '');
                appTree.create(path.posix.join(root, scssFile), '');
                appTree.create(path.posix.join(root, sassFile), '');
            }

            // skip loading json config files
            spyOn(fs, 'existsSync').and.returnValue(false);

            const update = new UnitUpdateChanges(__dirname, appTree);
            for (const projName of Object.keys(workspace.projects)) {
                const root = workspace.projects[projName].sourceRoot;
                expect(update.tsFiles).toContain(path.posix.join(`/${root}`, tsFile));
                expect(update.templateFiles).toContain(path.posix.join(`/${root}`, htmlFile));
                expect(update.sassFiles).toContain(path.posix.join(`/${root}`, scssFile));
                expect(update.sassFiles).toContain(path.posix.join(`/${root}`, sassFile));
            }
        });
    });
});
