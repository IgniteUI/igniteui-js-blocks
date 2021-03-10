import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

describe('Update to 11.1.0', () => {
    let appTree: UnitTestTree;
    const runner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));
    const configJson = {
        defaultProject: 'testProj',
        projects: {
            testProj: {
                sourceRoot: '/testSrc'
            }
        },
        schematics: {
            '@schematics/angular:component': {
                prefix: 'appPrefix'
            }
        }
    };

    const migrationName = 'migration-19';

    beforeEach(() => {
        appTree = new UnitTestTree(new EmptyTree());
        appTree.create('/angular.json', JSON.stringify(configJson));
    });

    it('should update fontSet to family', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/icon.component.html`,
            '<igx-icon fontSet="material">settings</igx-icon>'
        );

        const tree = await runner
            .runSchematicAsync('migration-19', {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/icon.component.html')
        ).toEqual('<igx-icon family="material">settings</igx-icon>');
    });

    it('should update isActive to active', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/icon.component.html`,
            '<igx-icon [isActive]="false">settings</igx-icon>'
        );

        const tree = await runner
            .runSchematicAsync('migration-19', {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/icon.component.html')
        ).toEqual('<igx-icon [active]="false">settings</igx-icon>');
    });

    it('should migrate updated getter names', async () => {
        pending('set up tests for migrations through lang service');
        appTree.create(
            '/testSrc/appPrefix/component/icon-test.component.ts',
            `import { Component, ViewChild } from '@angular/core';
import { IgxIconModule, IgxIconComponent } from 'igniteui-angular';

@Component({
    selector: 'app-icon-test',
    templateUrl: './icon-test.component.html',
    styleUrls: ['./icon-test.component.scss']
})
export class IconTestComponent {
    @ViewChild(IgxIconComponent, { static: true })
    private icon: IgxIconComponent;

    constructor() {
        const name = this.icon.getIconName;
        const family = this.icon.getFontSet;
        const color = this.icon.getIconColor;
    }
}
@NgModule({
    declarations: [IconTestComponent],
    exports: [IconTestComponent],
    imports: [IgxIconModule]
});
`);

        const tree = await runner
            .runSchematicAsync('migration-19', {}, appTree)
            .toPromise();

        const expectedContent = `import { Component, ViewChild } from '@angular/core';
import { IgxIconModule, IgxIconComponent } from 'igniteui-angular';

@Component({
    selector: 'app-icon-test',
    templateUrl: './icon-test.component.html',
    styleUrls: ['./icon-test.component.scss']
})
export class IconTestComponent {
    @ViewChild(IgxIconComponent, { static: true })
    private icon: IgxIconComponent;

    constructor() {
        const name = this.icon.getName;
        const family = this.icon.getFamily;
        const color = this.icon.getColor;
    }
}
@NgModule({
    declarations: [IconTestComponent],
    exports: [IconTestComponent],
    imports: [IgxIconModule]
});
`;
        console.log(tree.readContent(
            '/testSrc/appPrefix/component/icon-test.component.ts'
        ));

        expect(
            tree.readContent(
                '/testSrc/appPrefix/component/icon-test.component.ts'
            )
        ).toEqual(expectedContent);
    });

    it('should migrate updated members names', async () => {
        pending('set up tests for migrations through lang service');
        appTree.create(
            '/testSrc/appPrefix/component/icon-test.component.ts',
            `import { Component } from '@angular/core';
            import { IgxIconService } from 'igniteui-angular';

@Component({
    selector: 'app-icon-test',
    templateUrl: './icon-test.component.html',
    styleUrls: ['./icon-test.component.scss']
})
export class IconTestComponent {
    constructor(private _iconService: IgxIconService) {
        const font = this._iconService.defaultFontSet;
        const className = this._iconService.fontSetClassName('material');
        const alias = this._iconService.registerFontSetAlias('material', 'material-icons');
    }
}
@NgModule({
    declarations: [IconTestComponent],
    exports: [IconTestComponent],
    imports: [IgxIconModule]
});
`);

        const tree = await runner
            .runSchematicAsync('migration-19', {}, appTree)
            .toPromise();

        const expectedContent = `import { Component } from '@angular/core';
        import { IgxIconService } from 'igniteui-angular';

@Component({
    selector: 'app-icon-test',
    templateUrl: './icon-test.component.html',
    styleUrls: ['./icon-test.component.scss']
})
export class IconTestComponent {
    constructor(private _iconService: IgxIconService) {
        const font = this._iconService.defaultFamily;
        const className = this._iconService.familyClassName('material');
        const alias = this._iconService.registerFamilyAlias('material', 'material-icons');
    }
}
@NgModule({
    declarations: [IconTestComponent],
    exports: [IconTestComponent],
    imports: [IgxIconModule]
});
`;

        expect(
            tree.readContent(
                '/testSrc/appPrefix/component/icon-test.component.ts'
            )
        ).toEqual(expectedContent);
    });

    it('should replace on-prefixed outputs in chip and chips-area', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/chips.component.html`,
            `<igx-chips-area #chipsAreaTo class="chipAreaTo"
                (onReorder)="chipsOrderChangedTo($event)"
                (onSelection)="chipsSelectionChanged($event)"
                (onMoveStart)="chipsMoveStart($event)"
                (onMoveEnd)="chipsMoveEnd($event)">
                <igx-chip *ngFor="let chip of chipListTo"
                    [id]="chip.id"
                    [draggable]="true"
                    (onClick)="chipClicked()"
                    (onRemove)="chipRemoved()"
                    (onKeyDown)="chipKeyDown()"
                    (onDragEnter)="dragEnter()"
                    (onSelection)="chipSelection()"
                    (onSelectionDone)="chipSelectionDone()"
                    (onMoveStart)="onMoveStartTo()"
                    (onMoveEnd)="moveEndedTo()">
                    <igx-avatar igxPrefix class="chip-area-avatar"></igx-avatar>
                    <span>{{chip.text}}</span>
                </igx-chip>
            </igx-chips-area>`
        );
        const tree = await runner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/chips.component.html'))
            .toEqual(`<igx-chips-area #chipsAreaTo class="chipAreaTo"
                (reorder)="chipsOrderChangedTo($event)"
                (selectionChange)="chipsSelectionChanged($event)"
                (moveStart)="chipsMoveStart($event)"
                (moveEnd)="chipsMoveEnd($event)">
                <igx-chip *ngFor="let chip of chipListTo"
                    [id]="chip.id"
                    [draggable]="true"
                    (chipClick)="chipClicked()"
                    (remove)="chipRemoved()"
                    (keyDown)="chipKeyDown()"
                    (dragEnter)="dragEnter()"
                    (selectedChanging)="chipSelection()"
                    (selectedChanged)="chipSelectionDone()"
                    (moveStart)="onMoveStartTo()"
                    (moveEnd)="moveEndedTo()">
                    <igx-avatar igxPrefix class="chip-area-avatar"></igx-avatar>
                    <span>{{chip.text}}</span>
                </igx-chip>
            </igx-chips-area>`);
    });

    it('should replace IgxTabsComponent event name onTabItemSelected with tabItemSelected', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/tabs.component.html`,
            `<igx-tabs (onTabItemSelected)="tabSelected()"></igx-tabs>`
        );

        const tree = await runner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();
        expect(
            tree.readContent('/testSrc/appPrefix/component/tabs.component.html')
        ).toEqual(`<igx-tabs (tabItemSelected)="tabSelected()"></igx-tabs>`);
    });

    it('should replace IgxTabsComponent event name onTabItemDeselected with tabItemDeselected', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/tabs.component.html`,
            `<igx-tabs (onTabItemDeselected)="tabDeselected()"></igx-tabs>`
        );

        const tree = await runner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();
        expect(
            tree.readContent('/testSrc/appPrefix/component/tabs.component.html')
        ).toEqual(`<igx-tabs (tabItemDeselected)="tabDeselected()"></igx-tabs>`);
    });

    it('should replace IgxListComponent event name onLeftPan with leftPan', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/list.component.html`,
            `<igx-list [allowLeftPanning]="true" (onLeftPan)="leftPanPerformed($event)">`
        );

        const tree = await runner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();
        expect(
            tree.readContent('/testSrc/appPrefix/component/list.component.html')
        ).toEqual(`<igx-list [allowLeftPanning]="true" (leftPan)="leftPanPerformed($event)">`);
    });

    it('should replace IgxListComponent event name onRightPan with rightPan', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/list.component.html`,
            `<igx-list [allowRightPanning]="true" (onRightPan)="rightPanPerformed($event)">`
        );

        const tree = await runner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();
        expect(
            tree.readContent('/testSrc/appPrefix/component/list.component.html')
        ).toEqual(`<igx-list [allowRightPanning]="true" (rightPan)="rightPanPerformed($event)">`);
    });

    it('should replace IgxListComponent event name onPanStateChange with panStateChange', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/list.component.html`,
            `<igx-list (onPanStateChange)="panStateChange($event)"></igx-list>`
        );

        const tree = await runner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();
        expect(
            tree.readContent('/testSrc/appPrefix/component/list.component.html')
        ).toEqual(`<igx-list (panStateChange)="panStateChange($event)"></igx-list>`);
    });

    it('should replace IgxListComponent event name OnItemClicked with itemClicked', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/list.component.html`,
            `<igx-list (onItemClicked)="onItemClicked($event)"></igx-list>`
        );

        const tree = await runner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();
        expect(
            tree.readContent('/testSrc/appPrefix/component/list.component.html')
        ).toEqual(`<igx-list (itemClicked)="onItemClicked($event)"></igx-list>`);
    });

    it('should replace IgxNavbarComponent event name onAction with action', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/navbar.component.html`,
            `<igx-navbar (onAction)="actionExc($event)" title="Sample App" actionButtonIcon="menu"></igx-navbar>`
        );

        const tree = await runner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();
        expect(
            tree.readContent('/testSrc/appPrefix/component/navbar.component.html')
        ).toEqual(`<igx-navbar (action)="actionExc($event)" title="Sample App" actionButtonIcon="menu"></igx-navbar>`);
    });

    it('should update Excel exporter onExportEnded event name to exportEnded', async () => {
        pending('set up tests for migrations through lang service');
        appTree.create(
            '/testSrc/appPrefix/component/excel-export.component.ts',
`import { Component } from '@angular/core';
import { IgxExcelExporterService } from "igniteui-angular";

@Component({
    selector: "app-excel-export",
    styleUrls: ["./excel-export.component.scss"],
    templateUrl: "./excel-export.component.html"
})
export class ExcelExportComponent {
    constructor(private excelExportService: IgxExcelExporterService) {
        this.excelExportService.onExportEnded.subscribe();
    }
}
@NgModule({
    declarations: [ExcelExportComponent],
    exports: [ExcelExportComponent],
    imports: [],
    providers: [IgxExcelExporterService]
});
`);

        const tree = await runner
            .runSchematicAsync('migration-19', {}, appTree)
            .toPromise();

        const expectedContent =
`import { Component } from '@angular/core';
import { IgxExcelExporterService } from "igniteui-angular";

@Component({
    selector: "app-excel-export",
    styleUrls: ["./excel-export.component.scss"],
    templateUrl: "./excel-export.component.html"
})
export class ExcelExportComponent {
    constructor(private excelExportService: IgxExcelExporterService) {
        this.excelExportService.exportEnded.subscribe();
    }
}
@NgModule({
    declarations: [ExcelExportComponent],
    exports: [ExcelExportComponent],
    imports: [],
    providers: [IgxExcelExporterService]
});
`;

        expect(
            tree.readContent(
                '/testSrc/appPrefix/component/excel-export.component.ts'
            )
        ).toEqual(expectedContent);
    });

    it('should update CSV exporter onExportEnded event name to exportEnded', async () => {
        pending('set up tests for migrations through lang service');
        appTree.create(
            '/testSrc/appPrefix/component/csv-export.component.ts',
`import { Component } from '@angular/core';
import { IgxCsvExporterService } from "igniteui-angular";

@Component({
    selector: "app-csv-export",
    styleUrls: ["./csv-export.component.scss"],
    templateUrl: "./csv-export.component.html"
})
export class CsvExportComponent {
    constructor(private csvExportService: IgxCsvExporterService) {
        this.csvExportService.onExportEnded.subscribe();
    }
}
@NgModule({
    declarations: [CsvExportComponent],
    exports: [CsvExportComponent],
    imports: [],
    providers: [IgxCsvExporterService]
});
`);

        const tree = await runner
            .runSchematicAsync('migration-19', {}, appTree)
            .toPromise();

        const expectedContent =
`import { Component } from '@angular/core';
import { IgxCsvExporterService } from "igniteui-angular";

@Component({
    selector: "app-csv-export",
    styleUrls: ["./csv-export.component.scss"],
    templateUrl: "./csv-export.component.html"
})
export class CsvExportComponent {
    constructor(private csvExportService: IgxCsvExporterService) {
        this.csvExportService.exportEnded.subscribe();
    }
}
@NgModule({
    declarations: [CsvExportComponent],
    exports: [CsvExportComponent],
    imports: [],
    providers: [IgxCsvExporterService]
});
`;
        expect(
            tree.readContent(
                '/testSrc/appPrefix/component/csv-export.component.ts'
            )
        ).toEqual(expectedContent);
    });

    it('should replace onSelect and onUnselect with selected and deselected in igx-buttongroup', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/buttongroup.component.html`,
            `<igx-buttongroup
                (onSelect)="someHandler($event)"
                (onUnselect)="someHandler($event)"
            >
            </igx-buttongroup>`
        );

        const tree = await runner.runSchematicAsync(migrationName, {}, appTree).toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/buttongroup.component.html')).toEqual(
            `<igx-buttongroup
                (selected)="someHandler($event)"
                (deselected)="someHandler($event)"
            >
            </igx-buttongroup>`
        );
    });

    it('should replace onAction with clicked in igx-snackbar', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/snackbar.component.html`,
            `<igx-snackbar (onAction)="someHandler($event)"></igx-snackbar>`
        );

        const tree = await runner.runSchematicAsync(migrationName, {}, appTree).toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/snackbar.component.html')).toEqual(
            `<igx-snackbar (clicked)="someHandler($event)"></igx-snackbar>`
        );
    });

    it('should replace onShowing, onShown, onHiding, onHidden with showing, shown, hiding, hidden in igx-toast', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/toast.component.html`,
            `<igx-toast
                (onShowing)="someHandler($event)"
                (onShown)="someHandler($event)"
                (onHiding)="someHandler($event)"
                (onHidden)="someHandler($event)"
            >
            </igx-toast>`
        );

        const tree = await runner.runSchematicAsync(migrationName, {}, appTree).toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/toast.component.html')).toEqual(
            `<igx-toast
                (showing)="someHandler($event)"
                (shown)="someHandler($event)"
                (hiding)="someHandler($event)"
                (hidden)="someHandler($event)"
            >
            </igx-toast>`
        );
    });

    it('should replace IgxTooltipTargetDirective event names onTooltipShow and onTooltipHide with tooltipShow and tooltipHide',
        async () => {
            appTree.create(
            `/testSrc/appPrefix/component/tooltip.component.html`,
    `<button [igxTooltipTarget]="tooltipRef" (onTooltipShow)="showing($event)" (onTooltipHide)="hiding($event)">
        Hover me
    </button>
    <div igxTooltip #tooltipRef="tooltip">
        Hello, I am a tooltip!
    </div>`
        );

        const tree = await runner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();
        expect(
            tree.readContent('/testSrc/appPrefix/component/tooltip.component.html')
        ).toEqual(
    `<button [igxTooltipTarget]="tooltipRef" (tooltipShow)="showing($event)" (tooltipHide)="hiding($event)">
        Hover me
    </button>
    <div igxTooltip #tooltipRef="tooltip">
        Hello, I am a tooltip!
    </div>`);
    });

    it('should replace outputs with selected in igx-calendar', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/calendar.component.html`,
`<igx-calendar
    (onSelection)="someHandler($event)"
    (onViewChanging)="someHandler($event)"
    (onDateSelection)="someHandler($event)"
    (onYearSelection)="someHandler($event)"
    (onMonthSelection)="someHandler($event)"
></igx-calendar>`
        );

        const tree = await runner.runSchematicAsync(migrationName, {}, appTree).toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/calendar.component.html')).toEqual(
`<igx-calendar
    (selected)="someHandler($event)"
    (viewChanging)="someHandler($event)"
    (dateSelection)="someHandler($event)"
    (yearSelection)="someHandler($event)"
    (monthSelection)="someHandler($event)"
></igx-calendar>`
        );
    });

    it('should replace onSelection and onYearSelection with selected in igx-years-view', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/yearsview.component.html`,
`<igx-years-view
    (onSelection)="changeYear($event)"
    (onYearSelection)="changeYear($event)"
></igx-years-view>`
        );

        const tree = await runner.runSchematicAsync(migrationName, {}, appTree).toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/yearsview.component.html')).toEqual(
`<igx-years-view
    (selected)="changeYear($event)"
    (yearSelection)="changeYear($event)"
></igx-years-view>`
        );
    });

    it('should replace onDateSelection and onViewChanging with selected in igx-days-view', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/daysview.component.html`,
`<igx-days-view
    (onDateSelection)="someHandler($event)"
    (onViewChanging)="someHandler($event)"
></igx-days-view>`
        );

        const tree = await runner.runSchematicAsync(migrationName, {}, appTree).toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/daysview.component.html')).toEqual(
`<igx-days-view
    (dateSelection)="someHandler($event)"
    (viewChanging)="someHandler($event)"
></igx-days-view>`
        );
    });

    it('should replace onSelection and onMonthSelection with selected in igx-months-view', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/monthsview.component.html`,
`<igx-months-view
    (onSelection)="someHandler($event)"
    (onMonthSelection)="someHandler($event)"
></igx-months-view>`
        );

        const tree = await runner.runSchematicAsync(migrationName, {}, appTree).toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/monthsview.component.html')).toEqual(
`<igx-months-view
    (selected)="someHandler($event)"
    (monthSelection)="someHandler($event)"
></igx-months-view>`
        );
    });

    it('should replace onSelection and onMonthSelection with selected in igx-month-picker', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/monthpicker.component.html`,
`<igx-month-picker
    (onSelection)="someHandler($event)"
></igx-month-picker>`
        );

        const tree = await runner.runSchematicAsync(migrationName, {}, appTree).toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/monthpicker.component.html')).toEqual(
`<igx-month-picker
    (selected)="someHandler($event)"
></igx-month-picker>`
        );
    });

    it('should update Excel exporter onColumnExport and onRowExport event names to columnmExporting and rowExporting', async () => {
        pending('set up tests for migrations through lang service');
        appTree.create(
            '/testSrc/appPrefix/component/excel-export.component.ts',
`import { Component } from '@angular/core';
import { IgxExcelExporterService } from "igniteui-angular";

@Component({
    selector: "app-excel-export",
    styleUrls: ["./excel-export.component.scss"],
    templateUrl: "./excel-export.component.html"
})
export class ExcelExportComponent {
    constructor(private excelExportService: IgxExcelExporterService) {
        this.excelExportService.onColumnExport.subscribe();
        this.excelExportService.onRowExport.subscribe();
    }
}
@NgModule({
    declarations: [ExcelExportComponent],
    exports: [ExcelExportComponent],
    imports: [],
    providers: [IgxExcelExporterService]
});
`);

        const tree = await runner
            .runSchematicAsync('migration-19', {}, appTree)
            .toPromise();

        const expectedContent =
`import { Component } from '@angular/core';
import { IgxExcelExporterService } from "igniteui-angular";

@Component({
    selector: "app-excel-export",
    styleUrls: ["./excel-export.component.scss"],
    templateUrl: "./excel-export.component.html"
})
export class ExcelExportComponent {
    constructor(private excelExportService: IgxExcelExporterService) {
        this.excelExportService.columnExporting.subscribe();
        this.excelExportService.rowExporting.subscribe();
    }
}
@NgModule({
    declarations: [ExcelExportComponent],
    exports: [ExcelExportComponent],
    imports: [],
    providers: [IgxExcelExporterService]
});
`;

        expect(
            tree.readContent(
                '/testSrc/appPrefix/component/excel-export.component.ts'
            )
        ).toEqual(expectedContent);
    });

    it('should update CSV exporter onColumnExport and onRowExport event names to columnmExporting and rowExporting', async () => {
        pending('set up tests for migrations through lang service');
        appTree.create(
            '/testSrc/appPrefix/component/csv-export.component.ts',
`import { Component } from '@angular/core';
import { IgxCsvExporterService } from "igniteui-angular";

@Component({
    selector: "app-csv-export",
    styleUrls: ["./csv-export.component.scss"],
    templateUrl: "./csv-export.component.html"
})
export class CsvExportComponent {
    constructor(private csvExportService: IgxCsvExporterService) {
        this.csvExportService.onColumnExport.subscribe();
        this.csvExportService.onRowExport.subscribe();
    }
}
@NgModule({
    declarations: [CsvExportComponent],
    exports: [CsvExportComponent],
    imports: [],
    providers: [IgxCsvExporterService]
});
`);

        const tree = await runner
            .runSchematicAsync('migration-19', {}, appTree)
            .toPromise();

        const expectedContent =
`import { Component } from '@angular/core';
import { IgxCsvExporterService } from "igniteui-angular";

@Component({
    selector: "app-csv-export",
    styleUrls: ["./csv-export.component.scss"],
    templateUrl: "./csv-export.component.html"
})
export class CsvExportComponent {
    constructor(private csvExportService: IgxCsvExporterService) {
        this.csvExportService.columnExporting.subscribe();
        this.csvExportService.rowExporting.subscribe();
    }
}
@NgModule({
    declarations: [CsvExportComponent],
    exports: [CsvExportComponent],
    imports: [],
    providers: [IgxCsvExporterService]
});
`;
        expect(
            tree.readContent(
                '/testSrc/appPrefix/component/csv-export.component.ts'
            )
        ).toEqual(expectedContent);
    });
});
