import { TestBed, ComponentFixture, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IgxGridModule } from './grid.module';
import { IgxGridComponent } from './grid.component';
import { DebugElement } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxColumnComponent } from '../columns/column.component';
import { IgxColumnGroupComponent } from '../columns/column-group.component';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { By } from '@angular/platform-browser';
import { DefaultSortingStrategy } from '../../data-operations/sorting-strategy';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxGridHeaderComponent } from '../headers/grid-header.component';
import { GridSummaryFunctions, GridFunctions } from '../../test-utils/grid-functions.spec';
import { wait } from '../../test-utils/ui-interactions.spec';
import { DropPosition } from '../moving/moving.service';
import { OneGroupOneColGridComponent, OneGroupThreeColsGridComponent,
    BlueWhaleGridComponent, ColumnGroupTestComponent, ColumnGroupFourLevelTestComponent,
    ThreeGroupsThreeColumnsGridComponent,
    NestedColGroupsGridComponent, StegosaurusGridComponent,
    OneColPerGroupGridComponent, NestedColumnGroupsGridComponent,
    DynamicGridComponent, NestedColGroupsWithTemplatesGridComponent,
    DynamicColGroupsGridComponent } from '../../test-utils/grid-mch-sample.spec';

const GRID_COL_THEAD_TITLE_CLASS = 'igx-grid__th-title';
const GRID_COL_GROUP_THEAD_TITLE_CLASS = 'igx-grid__thead-title';
const GRID_COL_GROUP_THEAD_GROUP_CLASS = 'igx-grid__thead-group';

/* eslint-disable max-len */
describe('IgxGrid - multi-column headers #grid', () => {
    configureTestSuite();

    let fixture; let grid: IgxGridComponent; let componentInstance;

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                OneGroupOneColGridComponent,
                OneGroupThreeColsGridComponent,
                BlueWhaleGridComponent,
                ColumnGroupTestComponent,
                ColumnGroupFourLevelTestComponent,
                ThreeGroupsThreeColumnsGridComponent,
                NestedColGroupsGridComponent,
                StegosaurusGridComponent,
                OneColPerGroupGridComponent,
                NestedColumnGroupsGridComponent,
                DynamicGridComponent,
                NestedColGroupsWithTemplatesGridComponent,
                DynamicColGroupsGridComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxGridModule
            ]
        }).compileComponents();
    }));

    describe('Initialization and rendering tests: ', () => {
        it('should initialize a grid with column groups', () => {
            fixture = TestBed.createComponent(ColumnGroupTestComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            const expectedColumnGroups = 5;
            const expectedLevel = 2;
            const groupHeaders = GridFunctions.getColumnGroupHeaders(fixture);
            expect(groupHeaders.length).toEqual(expectedColumnGroups);
            expect(grid.getColumnByName('ContactName').level).toEqual(expectedLevel);
        });

        it('Should render column group headers correctly.', fakeAsync(() => {
            fixture = TestBed.createComponent(BlueWhaleGridComponent);
            fixture.detectChanges();
            componentInstance = fixture.componentInstance;
            grid = componentInstance.grid;
            const columnWidthPx = parseInt(componentInstance.columnWidth, 10);
            // 2 levels of column group and 1 level of columns
            const gridHeadersDepth = 3;

            const firstGroupChildrenCount = 100;
            const secondGroupChildrenCount = 2;
            const secondSubGroupChildrenCount = 50;
            const secondSubGroupHeadersDepth = 2;

            const firstGroup = GridFunctions.getColumnGroupHeaders(fixture)[0];
            testColumnGroupHeaderRendering(firstGroup, firstGroupChildrenCount * columnWidthPx,
                gridHeadersDepth * grid.defaultRowHeight, componentInstance.firstGroupTitle,
                'firstGroupColumn', firstGroupChildrenCount);

            let horizontalScroll = grid.headerContainer.getScroll();
            let scrollToNextGroup = firstGroupChildrenCount * columnWidthPx + columnWidthPx;
            horizontalScroll.scrollLeft = scrollToNextGroup;

            tick();
            fixture.detectChanges();
            const secondGroup = GridFunctions.getColumnGroupHeaders(fixture)[1];
            testColumnGroupHeaderRendering(secondGroup,
                secondGroupChildrenCount * secondSubGroupChildrenCount * columnWidthPx,
                gridHeadersDepth * grid.defaultRowHeight, componentInstance.secondGroupTitle,
                'secondSubGroup', 0);

            const secondSubGroups = secondGroup.queryAll(By.css('.secondSubGroup'));
            testColumnGroupHeaderRendering(secondSubGroups[0],
                secondSubGroupChildrenCount * columnWidthPx,
                secondSubGroupHeadersDepth * grid.defaultRowHeight, componentInstance.secondSubGroupTitle,
                'secondSubGroupColumn', secondSubGroupChildrenCount);

            testColumnGroupHeaderRendering(secondSubGroups[1],
                secondSubGroupChildrenCount * columnWidthPx,
                secondSubGroupHeadersDepth * grid.defaultRowHeight, componentInstance.secondSubGroupTitle,
                'secondSubGroupColumn', secondSubGroupChildrenCount);

            horizontalScroll = grid.headerContainer.getScroll();
            scrollToNextGroup = horizontalScroll.scrollLeft +
                secondSubGroupHeadersDepth * secondSubGroupChildrenCount * columnWidthPx;

            horizontalScroll.scrollLeft = scrollToNextGroup;

            tick();
            fixture.detectChanges();

            const idColumn = fixture.debugElement.query(By.css('.lonelyId'));
            testColumnHeaderRendering(idColumn, columnWidthPx,
                gridHeadersDepth * grid.defaultRowHeight, componentInstance.idHeaderTitle);

            const companyNameColumn = GridFunctions.getColumnHeader('CompanyName', fixture);
            testColumnHeaderRendering(companyNameColumn, columnWidthPx,
                2 * grid.defaultRowHeight, componentInstance.companyNameTitle);

            const personDetailsColumn = GridFunctions.getColumnGroupHeader('Person Details', fixture);
            testColumnGroupHeaderRendering(personDetailsColumn, 2 * columnWidthPx,
                2 * grid.defaultRowHeight, componentInstance.personDetailsTitle,
                'personDetailsColumn', 2);

        }));

        it('Should not render empty column group.', () => {
            fixture = TestBed.createComponent(ColumnGroupTestComponent);
            fixture.detectChanges();
            const ci = fixture.componentInstance;

            // Empty column group should not be displayed
            const emptyColGroup = GridFunctions.getColumnGroupHeader('Empty Header', fixture);
            expect(parseInt(ci.emptyColGroup.width, 10)).toBe(0);
            expect(emptyColGroup).toBeUndefined();
        });

        it('Should render headers correctly when having a column per group.', () => {
            fixture = TestBed.createComponent(OneColPerGroupGridComponent);
            fixture.detectChanges();
            const ci = fixture.componentInstance;
            grid = ci.grid;

            const addressColGroup = GridFunctions.getColumnGroupHeader('Address Group', fixture);
            const addressColGroupDepth = 2; // one-level children
            const addressColGroupChildrenCount = 1;

            testColumnGroupHeaderRendering(addressColGroup, parseInt(ci.columnWidth, 10),
                addressColGroupDepth * grid.defaultRowHeight, ci.addressColGroupTitle,
                'addressCol', addressColGroupChildrenCount);

            const addressCol = GridFunctions.getColumnHeader('Address', fixture);

            testColumnHeaderRendering(addressCol, parseInt(ci.columnWidth, 10),
                grid.defaultRowHeight, ci.addressColTitle);

            const phoneColGroup = GridFunctions.getColumnGroupHeader('Phone Group', fixture);
            const phoneColGroupDepth = 2; // one-level children
            const phoneColGroupChildrenCount = 1;

            testColumnGroupHeaderRendering(phoneColGroup, parseInt(ci.phoneColWidth, 10),
                phoneColGroupDepth * grid.defaultRowHeight, ci.phoneColGroupTitle,
                'phoneCol', phoneColGroupChildrenCount);

            const phoneCol = GridFunctions.getColumnHeader('Phone', fixture);

            testColumnHeaderRendering(phoneCol, parseInt(ci.phoneColWidth, 10),
                grid.defaultRowHeight, ci.phoneColTitle);

            const faxColGroup = GridFunctions.getColumnGroupHeader('Fax Group', fixture);
            const faxColGroupDepth = 2; // one-level children
            const faxColGroupChildrenCount = 1;

            testColumnGroupHeaderRendering(faxColGroup, parseInt(ci.faxColWidth, 10),
                faxColGroupDepth * grid.defaultRowHeight, ci.faxColGroupTitle, 'faxCol',
                faxColGroupChildrenCount);

            const faxCol = GridFunctions.getColumnHeader('Fax', fixture);

            testColumnHeaderRendering(faxCol, parseInt(ci.faxColWidth, 10),
                grid.defaultRowHeight, ci.faxColTitle);
        });

        it('Should render headers correctly when having nested column groups.', () => {
            fixture = TestBed.createComponent(NestedColumnGroupsGridComponent);
            fixture.detectChanges();
            NestedColGroupsTests.testHeadersRendering(fixture);
        });

        it('Should render headers correctly when having nested column groups with huge header text.', () => {
            fixture = TestBed.createComponent(NestedColumnGroupsGridComponent);
            fixture.detectChanges();
            const ci = fixture.componentInstance;
            grid = ci.grid;

            const title = 'Lorem Ipsum is simply dummy text of the printing and typesetting' +
                ' industry.Lorem Ipsum has been the industry\'s standard dummy text ever since' +
                ' the 1500s, when an unknown printer took a galley of type and scrambled it to' +
                ' make a type specimen book. It has survived not only five centuries, but also the' +
                ' leap into electronic typesetting, remaining essentially unchanged.It was popularised' +
                ' in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and' +
                ' more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.';
            ci.masterColGroupTitle = ci.firstSlaveColGroupTitle =
                ci.secondSlaveColGroupTitle = ci.addressColTitle = ci.phoneColTitle =
                ci.faxColTitle = ci.cityColTitle = title;
            fixture.detectChanges();
            NestedColGroupsTests.testHeadersRendering(fixture);
        });

        it('Should correctly initialize column group templates.', () => {
            fixture = TestBed.createComponent(NestedColGroupsWithTemplatesGridComponent);
            fixture.detectChanges();
            const ci = fixture.componentInstance;
            const locationColGroup = ci.locationColGroup;
            const contactInfoColGroup = ci.contactInfoColGroup;

            expect(locationColGroup.headerTemplate).toBeDefined();
            expect(contactInfoColGroup.headerTemplate).toBeUndefined();

            const headerSpans: DebugElement[] = fixture.debugElement.queryAll(By.css('.col-group-template'));
            expect(headerSpans.length).toBe(1);
            expect(headerSpans[0].nativeElement.textContent).toMatch('Column group template');
        });

        it('Should correctly change column group templates dynamically.', () => {
            fixture = TestBed.createComponent(NestedColGroupsWithTemplatesGridComponent);
            fixture.detectChanges();
            componentInstance = fixture.componentInstance;
            const locationColGroup = componentInstance.locationColGroup;
            const genInfoColGroup = componentInstance.genInfoColGroup;
            const headerTemplate = componentInstance.dynamicColGroupTemplate;

            locationColGroup.headerTemplate = headerTemplate;
            genInfoColGroup.headerTemplate = headerTemplate;
            fixture.detectChanges();

            let headerSpans: DebugElement[] = fixture.debugElement.queryAll(By.css('.dynamic-col-group-template'));
            expect(headerSpans.length).toBe(2);
            headerSpans.forEach(headerSpan => {
                expect(headerSpan.nativeElement.textContent).toMatch('Dynamic column group template');
            });

            locationColGroup.headerTemplate = null;
            fixture.detectChanges();

            headerSpans = fixture.debugElement.queryAll(By.css('.dynamic-col-group-template'));
            expect(headerSpans.length).toBe(1);
            headerSpans.forEach(headerSpan => {
                expect(headerSpan.nativeElement.textContent).toMatch('Dynamic column group template');
            });
            headerSpans = fixture.debugElement.queryAll(By.css('.col-group-template'));
            expect(headerSpans.length).toBe(0);
            headerSpans = fixture.debugElement.queryAll(By.css('.' + GRID_COL_GROUP_THEAD_TITLE_CLASS));
            expect(headerSpans[1].nativeElement.textContent).toBe('Location');
        });

        it('There shouldn\'t be any errors when dynamically removing a column group with filtering enabled', () => {
            fixture = TestBed.createComponent(DynamicColGroupsGridComponent);
            fixture.detectChanges();

            grid = fixture.componentInstance.grid;

            let columnLength = grid.columnList.length;
            let firstColumnGroup = grid.columnList.first;
            let expectedColumnName = 'First';
            let expectedColumnListLength = 10;

            expect(firstColumnGroup.header).toEqual(expectedColumnName);
            expect(expectedColumnListLength).toEqual(columnLength);

            fixture.componentInstance.columnGroups = fixture.componentInstance.columnGroups.splice(1, fixture.componentInstance.columnGroups.length - 1);
            fixture.detectChanges();
            fixture.componentInstance.columnGroups = fixture.componentInstance.columnGroups.splice(1, fixture.componentInstance.columnGroups.length - 1);
            fixture.detectChanges();

            firstColumnGroup = grid.columnList.first;
            expectedColumnName = 'Third';
            columnLength = grid.columnList.length;
            expectedColumnListLength = 3;

            expect(firstColumnGroup.header).toEqual(expectedColumnName);
            expect(expectedColumnListLength).toEqual(columnLength);
        });

        xit('There shouldn\'t be any errors when dynamically removing or adding a column in column group', () => {
            fixture = TestBed.createComponent(DynamicColGroupsGridComponent);
            fixture.detectChanges();

            grid = fixture.componentInstance.grid;

            expect(grid.columnList.length).toEqual(10);

            expect(() => {
                // Delete column
                fixture.componentInstance.columnGroups[0].columns.splice(0, 1);
                fixture.detectChanges();
            }).not.toThrow();

            expect(grid.columnList.length).toEqual(9);

            expect(() => {
                // Add column
                fixture.componentInstance.columnGroups[0].columns.push({ field: 'Fax', type: 'string' });
                fixture.detectChanges();
            }).not.toThrow();

            expect(grid.columnList.length).toEqual(10);

            expect(() => {
                // Update column
                fixture.componentInstance.columnGroups[0].columns[1] = { field: 'City', type: 'string' };
                fixture.detectChanges();
            }).not.toThrow();

            expect(grid.columnList.length).toEqual(10);
        });

        it('should set title attribute on column group header spans', () => {
            fixture = TestBed.createComponent(ColumnGroupTestComponent);
            fixture.detectChanges();

            grid = fixture.componentInstance.grid;
            const generalGroup = grid.columnList.find(c => c.header === 'General Information');
            generalGroup.title = 'General Information Title';
            fixture.detectChanges();

            const headers = fixture.debugElement.queryAll(By.css('.' + GRID_COL_GROUP_THEAD_TITLE_CLASS));
            const generalHeader = headers.find(h => h.nativeElement.textContent === 'General Information');
            const addressHeader = headers.find(h => h.nativeElement.textContent === 'Address Information');

            expect(generalHeader.nativeElement.firstElementChild.title).toBe('General Information Title');
            expect(addressHeader.nativeElement.firstElementChild.title).toBe('Address Information');
        });
    });

    describe('Columns widths tests (1 group 1 column) ', () => {
        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(OneGroupOneColGridComponent);
            fixture.detectChanges();
            componentInstance = fixture.componentInstance;
            grid = fixture.componentInstance.grid;
        }));

        it('Width should be correct. Column group with column. No width.', () => {
            grid.ngAfterViewInit();
            fixture.detectChanges();
            const locationColGroup = getColGroup(grid, 'Location');
            expect(parseInt(locationColGroup.width, 10) + grid.scrollSize).toBe(parseInt(componentInstance.gridWrapperWidthPx, 10));
            const cityColumn = grid.getColumnByName('City');
            expect(parseInt(cityColumn.width, 10) + grid.scrollSize).toBe(parseInt(componentInstance.gridWrapperWidthPx, 10));
        });

        it('Width should be correct. Column group with column. Width in px.', () => {
            const gridWidth = '600px';
            const gridWidthPx = parseInt(gridWidth, 10);
            grid.width = gridWidth;
            fixture.detectChanges();

            const locationColGroup = getColGroup(grid, 'Location');
            expect(parseInt(locationColGroup.width, 10) + grid.scrollSize).toBe(gridWidthPx);
            const cityColumn = grid.getColumnByName('City');
            expect(parseInt(cityColumn.width, 10) + grid.scrollSize).toBe(gridWidthPx);
        });

        it('Width should be correct. Column group with column. Width in percent.', () => {
            const gridWidth = '50%';
            grid.width = gridWidth;
            fixture.detectChanges();

            const locationColGroup = getColGroup(grid, 'Location');
            const gridWidthInPx = ((parseInt(gridWidth, 10) / 100) *
                parseInt(componentInstance.gridWrapperWidthPx, 10) - grid.scrollSize) + 'px';
            expect(locationColGroup.width).toBe(gridWidthInPx);
            const cityColumn = grid.getColumnByName('City');
            expect(cityColumn.width).toBe(gridWidthInPx);
        });

        it('Width should be correct. Column group with column. Column width in px.', () => {
            const gridColWidth = '200px';
            grid.columnWidth = gridColWidth;
            fixture.detectChanges();

            const locationColGroup = getColGroup(grid, 'Location');
            expect(locationColGroup.width).toBe(gridColWidth);
            const cityColumn = grid.getColumnByName('City');
            expect(cityColumn.width).toBe(gridColWidth);
        });

        it('Width should be correct. Column group with column. Column width in percent.', () => {
            const gridColWidth = '50%';
            grid.columnWidth = gridColWidth;
            fixture.detectChanges();

            const locationColGroup = getColGroup(grid, 'Location');
            const expectedWidth = (grid.calcWidth / 2) + 'px';
            expect(locationColGroup.width).toBe(expectedWidth);
            const cityColumn = grid.getColumnByName('City');
            expect(cityColumn.width).toBe(gridColWidth);
        });

        it('Width should be correct. Column group with column. Column with width in px.', () => {
            const columnWidth = '200px';
            componentInstance.columnWidth = columnWidth;
            fixture.detectChanges();

            const locationColGroup = getColGroup(grid, 'Location');
            expect(locationColGroup.width).toBe(columnWidth);
            const cityColumn = grid.getColumnByName('City');
            expect(cityColumn.width).toBe(columnWidth);
        });

        it('Width should be correct. Column group with column. Column with width in percent.', () => {
            const columnWidth = '50%';
            componentInstance.columnWidth = columnWidth;
            fixture.detectChanges();

            const locationColGroup = getColGroup(grid, 'Location');
            const expectedWidth = (grid.calcWidth / 2) + 'px';
            expect(locationColGroup.width).toBe(expectedWidth);
            const cityColumn = grid.getColumnByName('City');
            expect(cityColumn.width).toBe(columnWidth);
        });

        it('Should not throw exception if multi-column header columns width is set as number', () => {

            expect(() => {
            const cityColumn = grid.getColumnByName('City');
            (cityColumn.width as any) = 55;
            fixture.detectChanges();
            }).not.toThrow();
        });

    });

    describe('Columns widths tests (1 group 3 columns) ', () => {
        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(OneGroupThreeColsGridComponent);
            fixture.detectChanges();
            componentInstance = fixture.componentInstance;
            grid = fixture.componentInstance.grid;
        }));

        it('Width should be correct. Column group with three columns. No width.', () => {
            const scrWitdh = grid.nativeElement.querySelector('.igx-grid__tbody-scrollbar').getBoundingClientRect().width;
            const availableWidth = (parseInt(componentInstance.gridWrapperWidthPx, 10) - scrWitdh).toString();
            const locationColGroup = getColGroup(grid, 'Location');
            const colWidth = Math.floor(parseInt(availableWidth, 10) / 3);
            const colWidthPx = colWidth + 'px';
            expect(locationColGroup.width).toBe((Math.round(colWidth) * 3) + 'px');
            const countryColumn = grid.getColumnByName('Country');
            expect(countryColumn.width).toBe(colWidthPx);
            const regionColumn = grid.getColumnByName('Region');
            expect(regionColumn.width).toBe(colWidthPx);
            const cityColumn = grid.getColumnByName('City');
            expect(cityColumn.width).toBe(colWidthPx);
        });

        it('Width should be correct. Column group with three columns. Width in px.', () => {
            const gridWidth = '600px';
            grid.width = gridWidth;
            fixture.detectChanges();
            const scrWitdh = grid.nativeElement.querySelector('.igx-grid__tbody-scrollbar').getBoundingClientRect().width;
            const gridWidthInPx = parseInt(gridWidth, 10) - scrWitdh;
            const colWidth = Math.floor(gridWidthInPx / 3);
            const colWidthPx = colWidth + 'px';
            const locationColGroup = getColGroup(grid, 'Location');
            expect(locationColGroup.width).toBe((Math.round(colWidth) * 3) + 'px');
            const countryColumn = grid.getColumnByName('Country');
            expect(countryColumn.width).toBe(colWidthPx);
            const regionColumn = grid.getColumnByName('Region');
            expect(regionColumn.width).toBe(colWidthPx);
            const cityColumn = grid.getColumnByName('City');
            expect(cityColumn.width).toBe(colWidthPx);
        });

        it('Width should be correct. Column group with three columns. Columns with mixed width - px and percent.', async () => {
            const col1 = grid.getColumnByName('Country');
            const col2 = grid.getColumnByName('Region');
            const col3 = grid.getColumnByName('City');

            col1.width = '200px';
            col2.width = '20%';
            col3.width = '50%';

            fixture.detectChanges();

            // check group has correct size.
            let locationColGroup = getColGroup(grid, 'Location');
            let expectedWidth = (200 + Math.floor(grid.calcWidth * 0.7)) + 'px';
            expect(locationColGroup.width).toBe(expectedWidth);

            // check header and content have same size.
            const col1Header = grid.getColumnByName('Country').headerCell.elementRef.nativeElement;
            const cell1 = grid.getRowByIndex(0).cells.toArray()[0].nativeElement;
            expect(col1Header.offsetWidth).toEqual(cell1.offsetWidth);

            let col2Header = grid.getColumnByName('Region').headerCell.elementRef.nativeElement;
            let cell2 = grid.getRowByIndex(0).cells.toArray()[1].nativeElement;
            expect(col2Header.offsetWidth - cell2.offsetWidth).toBeLessThanOrEqual(1);

            let col3Header = grid.getColumnByName('City').headerCell.elementRef.nativeElement;
            let cell3 = grid.getRowByIndex(0).cells.toArray()[2].nativeElement;
            expect(col3Header.offsetWidth).toEqual(cell3.offsetWidth);

            // check that if grid is resized, group size is updated.
            componentInstance.gridWrapperWidthPx = '500';
            fixture.detectChanges();

            await wait(100);
            fixture.detectChanges();

            locationColGroup = getColGroup(grid, 'Location');
            expectedWidth = (200 + Math.floor(grid.calcWidth * 0.7)) + 'px';
            expect(locationColGroup.width).toBe(expectedWidth);

            col2Header = grid.getColumnByName('Region').headerCell.elementRef.nativeElement;
            cell2 = grid.getRowByIndex(0).cells.toArray()[1].nativeElement;
            expect(col2Header.offsetWidth - cell2.offsetWidth).toBeLessThanOrEqual(1);

            col3Header = grid.getColumnByName('City').headerCell.elementRef.nativeElement;
            cell3 = grid.getRowByIndex(0).cells.toArray()[2].nativeElement;
            expect(col3Header.offsetWidth).toEqual(cell3.offsetWidth);
        });

        it('Width should be correct. Column group with three columns. Columns with mixed width - px, percent and null.', () => {
            const col1 = grid.getColumnByName('Country');
            const col2 = grid.getColumnByName('Region');
            const col3 = grid.getColumnByName('City');

            col1.width = '200px';
            col2.width = '20%';
            col3.width = null;

            fixture.detectChanges();

            // check group has correct size. Should fill available space in grid since one column has no width.
            const locationColGroup = getColGroup(grid, 'Location');
            const expectedWidth = grid.calcWidth - 1 + 'px';
            expect(locationColGroup.width).toBe(expectedWidth);

            // check header and content have same size.
            const col1Header = grid.getColumnByName('Country').headerCell.elementRef.nativeElement;
            const cell1 = grid.getRowByIndex(0).cells.toArray()[0].nativeElement;
            expect(col1Header.offsetWidth).toEqual(cell1.offsetWidth);

            const col2Header = grid.getColumnByName('Region').headerCell.elementRef.nativeElement;
            const cell2 = grid.getRowByIndex(0).cells.toArray()[1].nativeElement;
            expect(col2Header.offsetWidth - cell2.offsetWidth).toBeLessThanOrEqual(1);

            const col3Header = grid.getColumnByName('City').headerCell.elementRef.nativeElement;
            const cell3 = grid.getRowByIndex(0).cells.toArray()[2].nativeElement;
            expect(col3Header.offsetWidth).toEqual(cell3.offsetWidth);
        });

        it('Width should be correct. Column group with three columns. Width in percent.', () => {
            const gridWidth = '50%';
            grid.width = gridWidth;
            fixture.detectChanges();

            const scrWitdh = grid.nativeElement.querySelector('.igx-grid__tbody-scrollbar').getBoundingClientRect().width;

            const gridWidthInPx = (parseInt(gridWidth, 10) / 100) *
                parseInt(componentInstance.gridWrapperWidthPx, 10) - scrWitdh;
            const colWidth = Math.floor(gridWidthInPx / 3);
            const colWidthPx = colWidth + 'px';
            const locationColGroup = getColGroup(grid, 'Location');
            expect(locationColGroup.width).toBe((Math.round(colWidth) * 3) + 'px');
            const countryColumn = grid.getColumnByName('Country');
            expect(countryColumn.width).toBe(colWidthPx);
            const regionColumn = grid.getColumnByName('Region');
            expect(regionColumn.width).toBe(colWidthPx);
            const cityColumn = grid.getColumnByName('City');
            expect(cityColumn.width).toBe(colWidthPx);
        });

        it('Width should be correct. Column group with three columns. Column width in px.', () => {
            const gridColWidth = '200px';
            grid.columnWidth = gridColWidth;
            fixture.detectChanges();

            const locationColGroup = getColGroup(grid, 'Location');
            const gridWidth = parseInt(gridColWidth, 10) * 3;
            expect(locationColGroup.width).toBe(gridWidth + 'px');
            const countryColumn = grid.getColumnByName('Country');
            expect(countryColumn.width).toBe(gridColWidth);
            const regionColumn = grid.getColumnByName('Region');
            expect(regionColumn.width).toBe(gridColWidth);
            const cityColumn = grid.getColumnByName('City');
            expect(cityColumn.width).toBe(gridColWidth);
        });

        it('Width should be correct. Colum group with three columns. Column width in percent.', () => {
            const gridColWidth = '20%';
            grid.columnWidth = gridColWidth;
            fixture.detectChanges();

            const locationColGroup = getColGroup(grid, 'Location');
            const expectedWidth = (Math.floor(grid.calcWidth * 0.2) * 3) + 'px';
            expect(locationColGroup.width).toBe(expectedWidth);
            const countryColumn = grid.getColumnByName('Country');
            expect(countryColumn.width).toBe(gridColWidth);
            const regionColumn = grid.getColumnByName('Region');
            expect(regionColumn.width).toBe(gridColWidth);
            const cityColumn = grid.getColumnByName('City');
            expect(cityColumn.width).toBe(gridColWidth);
        });

        it('Width should be correct. Column group with three columns. Columns with width in px.', () => {
                const columnWidth = '200px';
                componentInstance.columnWidth = columnWidth;
                fixture.detectChanges();

                const locationColGroup = getColGroup(grid, 'Location');
                const groupWidth = parseInt(columnWidth, 10) * 3;
                expect(locationColGroup.width).toBe(groupWidth + 'px');
                const countryColumn = grid.getColumnByName('Country');
                expect(countryColumn.width).toBe(columnWidth);
                const regionColumn = grid.getColumnByName('Region');
                expect(regionColumn.width).toBe(columnWidth);
                const cityColumn = grid.getColumnByName('City');
                expect(cityColumn.width).toBe(columnWidth);
            });

        it('Width should be correct. Column group with three columns. Columns with width in percent.', () => {
            const columnWidth = '20%';
            componentInstance.columnWidth = columnWidth;
            fixture.detectChanges();

            const locationColGroup = getColGroup(grid, 'Location');
            const expectedWidth = (Math.floor(grid.calcWidth * 0.2) * 3) + 'px';
            expect(locationColGroup.width).toBe(expectedWidth);
            const countryColumn = grid.getColumnByName('Country');
            expect(countryColumn.width).toBe(columnWidth);
            const regionColumn = grid.getColumnByName('Region');
            expect(regionColumn.width).toBe(columnWidth);
            const cityColumn = grid.getColumnByName('City');
            expect(cityColumn.width).toBe(columnWidth);
        });
    });

    describe('Column hiding: ', () => {
        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(ColumnGroupFourLevelTestComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
        }));

        it('column hiding - parent level', () => {
            const addressGroup = grid.columnList.filter(c => c.header === 'Address Information')[0];

            addressGroup.hidden = true;
            fixture.detectChanges();

            expect(GridFunctions.getColumnHeaders(fixture).length).toEqual(4);
            expect(GridFunctions.getColumnGroupHeaders(fixture).length).toEqual(2);
        });

        it('column hiding - child level', () => {
            const addressGroup = fixture.componentInstance.addrInfoColGroup;

            addressGroup.children.first.hidden = true;
            fixture.detectChanges();

            expect(GridFunctions.getColumnGroupHeaders(fixture).length).toEqual(5);
            expect(addressGroup.children.first.hidden).toBe(true);
            expect(addressGroup.children.first.children.toArray().every(c => c.hidden === true)).toEqual(true);
        });

        it('column hiding - Verify column hiding of Individual column and Child column', () => {
            testGroupsAndColumns(7, 11, fixture);

            // Hide individual column
            grid.getColumnByName('ID').hidden = true;
            fixture.detectChanges();
            testGroupsAndColumns(7, 10, fixture);

            // Hide column in goup
            grid.getColumnByName('CompanyName').hidden = true;
            fixture.detectChanges();
            expect(GridFunctions.getColumnGroupHeaders(fixture).length).toEqual(7);
            expect(GridFunctions.getColumnHeaders(fixture).length).toEqual(9);

            grid.getColumnByName('Address').hidden = true;
            fixture.detectChanges();

            testGroupsAndColumns(7, 8, fixture);
        });

        it('column hiding - Verify when 2 of 2 child columns are hidden, the Grouped column would be hidden as well.', () => {
            testGroupsAndColumns(7, 11, fixture);

            // Hide 2 columns in the group
            grid.getColumnByName('ContactName').hidden = true;
            fixture.detectChanges();
            grid.getColumnByName('ContactTitle').hidden = true;
            fixture.detectChanges();

            testGroupsAndColumns(6, 9, fixture);
            expect(getColGroup(grid, 'Person Details').hidden).toEqual(true);

            // Show one of the columns
            grid.getColumnByName('ContactName').hidden = false;
            fixture.detectChanges();

            testGroupsAndColumns(7, 10, fixture);
            expect(getColGroup(grid, 'Person Details').hidden).toEqual(false);
        });

        it('column hiding - Verify when 1 child column and 1 group are hidden, the Grouped column would be hidden as well.', () => {
                testGroupsAndColumns(7, 11, fixture);

                // Hide 2 columns in the group
                grid.getColumnByName('CompanyName').hidden = true;
                fixture.detectChanges();
                getColGroup(grid, 'Person Details').hidden = true;
                fixture.detectChanges();

                testGroupsAndColumns(5, 8, fixture);
                expect(getColGroup(grid, 'General Information').hidden).toEqual(true);

                // Show the group
                getColGroup(grid, 'Person Details').hidden = false;
                fixture.detectChanges();
                testGroupsAndColumns(7, 10, fixture);
                expect(getColGroup(grid, 'General Information').hidden).toEqual(false);
            });
    });

    describe('API methods tests ', () => {
        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(ColumnGroupFourLevelTestComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
        }));

        it('API method level should return correct values', () => {
            grid.getColumnByName('Fax').hidden = true;
            fixture.detectChanges();
            getColGroup(grid, 'Person Details').hidden = true;
            fixture.detectChanges();

            expect(grid.columnList.filter(col => col.columnGroup).length).toEqual(7);

            // Get level of column
            expect(grid.getColumnByName('ID').level).toEqual(0);
            expect(grid.getColumnByName('CompanyName').level).toEqual(1);
            expect(grid.getColumnByName('Country').level).toEqual(2);
            expect(grid.getColumnByName('City').level).toEqual(3);
            expect(grid.getColumnByName('PostalCode').level).toEqual(2);
            // Get level of hidden column
            expect(grid.getColumnByName('Fax').level).toEqual(2);
            // Get level of column in hidden group
            expect(grid.getColumnByName('ContactTitle').level).toEqual(2);

            // Get level of grouped column
            expect(getColGroup(grid, 'General Information').level).toEqual(0);
            expect(getColGroup(grid, 'Location').level).toEqual(1);
            expect(getColGroup(grid, 'Location City').level).toEqual(2);
            expect(getColGroup(grid, 'Contact Information').level).toEqual(1);
            expect(getColGroup(grid, 'Postal Code').level).toEqual(1);
            // Get level of hidden group
            expect(getColGroup(grid, 'Person Details').level).toEqual(1);
        });

        it('API method columnGroup should return correct values', () => {
            grid.getColumnByName('Fax').hidden = true;
            fixture.detectChanges();
            getColGroup(grid, 'Person Details').hidden = true;
            fixture.detectChanges();

            expect(grid.columnList.filter(col => col.columnGroup).length).toEqual(7);
            // Get columnGroup of column
            expect(grid.getColumnByName('ID').columnGroup).toEqual(false);
            expect(grid.getColumnByName('Fax').columnGroup).toEqual(false);
            expect(grid.getColumnByName('ContactTitle').columnGroup).toEqual(false);

            // Get columnGroup of grouped column
            expect(getColGroup(grid, 'General Information').columnGroup).toEqual(true);
            expect(getColGroup(grid, 'Location City').columnGroup).toEqual(true);
            expect(getColGroup(grid, 'Contact Information').columnGroup).toEqual(true);
            expect(getColGroup(grid, 'Postal Code').columnGroup).toEqual(true);
            expect(getColGroup(grid, 'Person Details').columnGroup).toEqual(true);
        });

        it('API method allChildren should return correct values', () => {
            grid.getColumnByName('Fax').hidden = true;
            fixture.detectChanges();
            getColGroup(grid, 'Person Details').hidden = true;
            fixture.detectChanges();

            expect(grid.columnList.filter(col => col.columnGroup).length).toEqual(7);
            // Get allChildren of column
            expect(grid.getColumnByName('ID').allChildren.length).toEqual(0);
            expect(grid.getColumnByName('PostalCode').allChildren.length).toEqual(0);
            // Get allChildren of hidden column
            expect(grid.getColumnByName('Fax').allChildren.length).toEqual(0);

            // Get allChildren of group
            const genInfGroupedColumnAllChildren = getColGroup(grid, 'General Information').allChildren;
            expect(genInfGroupedColumnAllChildren.length).toEqual(4);
            expect(genInfGroupedColumnAllChildren.indexOf(getColGroup(grid, 'Person Details'))).toBeGreaterThanOrEqual(0);

            // Get allChildren of hidden group
            expect(getColGroup(grid, 'Person Details').allChildren.length).toEqual(2);

            // Get allChildren of group with one column
            const postCodeGroupedColumnAllChildren = getColGroup(grid, 'Postal Code').allChildren;
            expect(postCodeGroupedColumnAllChildren.length).toEqual(1);
            expect(postCodeGroupedColumnAllChildren.indexOf(grid.getColumnByName('PostalCode'))).toEqual(0);

            // Get allChildren of group with hidden columns and more levels
            const addressGroupedColumnAllChildren = getColGroup(grid, 'Address Information').allChildren;
            expect(addressGroupedColumnAllChildren.length).toEqual(11);
            expect(addressGroupedColumnAllChildren.indexOf(getColGroup(grid, 'Postal Code'))).toBeGreaterThanOrEqual(0);
            expect(addressGroupedColumnAllChildren.indexOf(grid.getColumnByName('PostalCode'))).toBeGreaterThanOrEqual(0);
            expect(addressGroupedColumnAllChildren.indexOf(grid.getColumnByName('Address'))).toBeGreaterThanOrEqual(0);
            expect(addressGroupedColumnAllChildren.indexOf(grid.getColumnByName('Country'))).toBeGreaterThanOrEqual(0);
            expect(addressGroupedColumnAllChildren.indexOf(grid.getColumnByName('Fax'))).toBeGreaterThanOrEqual(0);
            expect(addressGroupedColumnAllChildren.indexOf(getColGroup(grid, 'General Information'))).toEqual(-1);
        });

        it('API method children should return correct values', () => {
            grid.getColumnByName('Fax').hidden = true;
            fixture.detectChanges();
            getColGroup(grid, 'Person Details').hidden = true;
            fixture.detectChanges();

            expect(grid.columnList.filter(col => col.columnGroup).length).toEqual(7);

            // Get children of grouped column
            expect(getColGroup(grid, 'General Information').children.length).toEqual(2);

            // Get children of hidden group
            expect(getColGroup(grid, 'Person Details').children.length).toEqual(2);

            // Get children of group with one column
            const postCodeGroupedColumnAllChildren = getColGroup(grid, 'Postal Code').children;
            expect(postCodeGroupedColumnAllChildren.length).toEqual(1);

            // Get children of group with more levels
            const addressGroupedColumnAllChildren = getColGroup(grid, 'Address Information').children;
            expect(addressGroupedColumnAllChildren.length).toEqual(3);
        });

        it('API method topLevelParent should return correct values', () => {
            grid.getColumnByName('Fax').hidden = true;
            fixture.detectChanges();
            getColGroup(grid, 'Person Details').hidden = true;
            fixture.detectChanges();

            expect(grid.columnList.filter(col => col.columnGroup).length).toEqual(7);

            // Get topLevelParent of column with no group
            expect(grid.getColumnByName('ID').topLevelParent).toBeNull();

            // Get topLevelParent of column
            const addressGroupedColumn = getColGroup(grid, 'Address Information');
            expect(grid.getColumnByName('PostalCode').topLevelParent).toEqual(addressGroupedColumn);
            expect(grid.getColumnByName('Fax').topLevelParent).toEqual(addressGroupedColumn);
            expect(grid.getColumnByName('Country').topLevelParent).toEqual(addressGroupedColumn);

            const genInfGroupedColumn = getColGroup(grid, 'General Information');
            expect(grid.getColumnByName('ContactName').topLevelParent).toEqual(genInfGroupedColumn);
            expect(grid.getColumnByName('CompanyName').topLevelParent).toEqual(genInfGroupedColumn);

            // Get topLevelParent of top group
            expect(genInfGroupedColumn.topLevelParent).toBeNull();
            expect(addressGroupedColumn.topLevelParent).toBeNull();

            // Get topLevelParent of group
            expect(getColGroup(grid, 'Person Details').topLevelParent).toEqual(genInfGroupedColumn);
            expect(getColGroup(grid, 'Postal Code').topLevelParent).toEqual(addressGroupedColumn);
            expect(getColGroup(grid, 'Location City').topLevelParent).toEqual(addressGroupedColumn);
        });

        it('Should emit "columnInit" event when having multi-column headers.', () => {
            fixture = TestBed.createComponent(NestedColumnGroupsGridComponent);
            const ci = fixture.componentInstance;
            grid = ci.grid;

            spyOn(grid.onColumnInit, 'emit').and.callThrough();
            fixture.detectChanges();
            const colsCount = 4;
            const colGroupsCount = 3;

            expect(grid.onColumnInit.emit).toHaveBeenCalledTimes(colsCount + colGroupsCount);
        });

        it('Should fire "columnInit" event when adding a multi-column header.', () => {
            fixture = TestBed.createComponent(DynamicGridComponent);
            componentInstance = fixture.componentInstance;
            grid = componentInstance.grid;
            fixture.detectChanges();

            spyOn(grid.onColumnInit, 'emit').and.callThrough();
            componentInstance.mchCount.push({});
            fixture.detectChanges();
            const colsCount = 2; // 1 col group and 1 col
            expect(grid.onColumnInit.emit).toHaveBeenCalledTimes(colsCount);
        });
    });

    describe('Column Pinning ', () => {
        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(ColumnGroupTestComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
        }));

        it('column pinning - Pin a column in a group using property.', () => {
            PinningTests.testColumnGroupPinning((component) => {
                component.contactTitleCol.pinned = true;
                fixture.detectChanges();
            }, (component) => {
                component.contactTitleCol.pinned = false;
                fixture.detectChanges();
            });
        });

        it('column pinning - Pin a column in a group using grid API.', () => {
            PinningTests.testColumnGroupPinning((component) => {
                component.grid.pinColumn(component.contactTitleCol);
                fixture.detectChanges();
            }, (component) => {
                component.grid.unpinColumn(component.contactTitleCol);
                fixture.detectChanges();
            });
        });

        it('column pinning - Pin an inner column group using property.', () => {
            PinningTests.testColumnGroupPinning((component) => {
                component.pDetailsColGroup.pinned = true;
                fixture.detectChanges();
            }, (component) => {
                component.pDetailsColGroup.pinned = false;
                fixture.detectChanges();
            });
        });

        it('column pinning - Pin an inner column group using grid API.', () => {
            PinningTests.testColumnGroupPinning((component) => {
                component.grid.pinColumn(component.pDetailsColGroup);
                fixture.detectChanges();
            }, (component) => {
                component.grid.unpinColumn(component.pDetailsColGroup);
                fixture.detectChanges();
            });
        });

        it('column pinning - Pin a group using property.', () => {
            PinningTests.testColumnGroupPinning((component) => {
                component.genInfoColGroup.pinned = true;
                fixture.detectChanges();
            }, (component) => {
                component.genInfoColGroup.pinned = false;
                fixture.detectChanges();
            });
        });

        it('column pinning - Pin a group using API.', () => {
            PinningTests.testColumnGroupPinning((component) => {
                component.grid.pinColumn(component.genInfoColGroup);
                fixture.detectChanges();
            }, (component) => {
                component.grid.unpinColumn(component.genInfoColGroup);
                fixture.detectChanges();
            });
        });

        it('column pinning - Verify pin a not fully visble group', () => {
            const ci = fixture.componentInstance;
            expect(grid.pinnedColumns.length).toEqual(0);
            expect(grid.unpinnedColumns.length).toEqual(16);

            // Pin a Group which is not fully visble
            const grAdressInf = getColGroup(grid, 'Address Information');
            grAdressInf.pinned = true;
            fixture.detectChanges();

            // Verify group and all its children are not pinned
            testColumnPinning(grAdressInf, true);

            expect(grid.getCellByColumn(0, 'ID')).toBeDefined();
            expect(grid.getCellByColumn(0, 'Country')).toBeDefined();
            expect(grid.getCellByColumn(0, 'City')).toBeDefined();

            expect(grid.getCellByColumn(0, 'ID').value).toEqual('ALFKI');
            expect(grid.getCellByColumn(0, 'Country').value).toEqual('Germany');
            expect(grid.getCellByColumn(0, 'City').value).toEqual('Berlin');
        });

        it('Should pin column groups using indexes correctly.', () => {
            fixture = TestBed.createComponent(StegosaurusGridComponent);
            fixture.detectChanges();
            const ci = fixture.componentInstance;
            grid = ci.grid;

            ci.genInfoColGroup.pinned = true;
            fixture.detectChanges();
            ci.idCol.pinned = true;
            fixture.detectChanges();
            ci.postalCodeColGroup.pinned = true;
            fixture.detectChanges();
            ci.cityColGroup.pinned = true;
            fixture.detectChanges();

            testColumnsVisibleIndexes(ci.genInfoColList.concat(ci.idCol)
                .concat(ci.postalCodeColList).concat(ci.cityColList).concat(ci.countryColList)
                .concat(ci.regionColList).concat(ci.addressColList).concat(ci.phoneColList)
                .concat(ci.faxColList));

            // unpinning with index
            expect(grid.unpinColumn(ci.genInfoColGroup, 2)).toBe(true);
            fixture.detectChanges();
            const postUnpinningColList = [ci.idCol].concat(ci.postalCodeColList).concat(ci.cityColList)
                .concat(ci.countryColList).concat(ci.regionColList).concat(ci.genInfoColList)
                .concat(ci.addressColList).concat(ci.phoneColList).concat(ci.faxColList);
            testColumnsVisibleIndexes(postUnpinningColList);
            testColumnPinning(ci.genInfoColGroup, false);

            // pinning to non-existent index
            expect(grid.pinColumn(ci.genInfoColGroup, 15)).toBe(false);
            fixture.detectChanges();
            testColumnsVisibleIndexes(postUnpinningColList);
            testColumnPinning(ci.genInfoColGroup, false);

            // pinning to negative index
            expect(grid.pinColumn(ci.genInfoColGroup, -15)).toBe(false);
            fixture.detectChanges();
            testColumnsVisibleIndexes(postUnpinningColList);
            testColumnPinning(ci.genInfoColGroup, false);

            // pinning with index
            expect(grid.pinColumn(ci.genInfoColGroup, 2)).toBe(true);
            fixture.detectChanges();
            const postPinningColList = [ci.idCol].concat(ci.postalCodeColList).concat(ci.genInfoColList)
                .concat(ci.cityColList).concat(ci.countryColList).concat(ci.regionColList)
                .concat(ci.addressColList).concat(ci.phoneColList).concat(ci.faxColList);
            testColumnsVisibleIndexes(postPinningColList);
            testColumnPinning(ci.genInfoColGroup, true);

            // unpinning to non-existent index
            expect(grid.unpinColumn(ci.genInfoColGroup, 15)).toBe(false);
            testColumnsVisibleIndexes(postPinningColList);
            testColumnPinning(ci.genInfoColGroup, true);

            // unpinning to negative index
            expect(grid.unpinColumn(ci.genInfoColGroup, -15)).toBe(false);
            testColumnsVisibleIndexes(postPinningColList);
            testColumnPinning(ci.genInfoColGroup, true);
        });

        it('Should initially pin the whole group when one column of the group is pinned', () => {
            fixture = TestBed.createComponent(ThreeGroupsThreeColumnsGridComponent);
            fixture.componentInstance.cnPinned = true;
            fixture.detectChanges();
            const contactTitle = fixture.componentInstance.grid.getColumnByName('ContactTitle');
            expect(contactTitle.pinned).toBeTruthy();
        });
    });

    describe('Column moving ', () => {
        // configureTestSuite();
        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(ColumnGroupTestComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
        }));

        it('Should not allow moving group to another level via API.', () => {
            expect(grid.pinnedColumns.length).toEqual(0);
            expect(grid.unpinnedColumns.length).toEqual(16);
            expect(grid.rowList.first.cells.first.value).toMatch('ALFKI');
            expect(grid.rowList.first.cells.toArray()[1].value).toMatch('Alfreds Futterkiste');
            expect(grid.rowList.first.cells.toArray()[2].value).toMatch('Maria Anders');
            expect(grid.rowList.first.cells.toArray()[3].value).toMatch('Sales Representative');

            // Pin a column
            const colID = grid.getColumnByName('ID');
            colID.pinned = true;
            fixture.detectChanges();

            expect(grid.pinnedColumns.length).toEqual(1);
            expect(grid.unpinnedColumns.length).toEqual(15);
            expect(colID.visibleIndex).toEqual(0);
            expect(grid.rowList.first.cells.first.value).toMatch('ALFKI');

            // Try to move a group column to pinned area, where there is non group column
            const contName = grid.getColumnByName('ContactName');
            grid.moveColumn(contName, colID);
            fixture.detectChanges();

            // pinning should be unsuccesfull !
            expect(grid.pinnedColumns.length).toEqual(1);
            expect(grid.unpinnedColumns.length).toEqual(15);
            expect(grid.rowList.first.cells.first.value).toMatch('ALFKI');

            // pin grouped column to the pinned area
            const genGroup = getColGroup(grid, 'General Information');
            genGroup.pinned = true;
            fixture.detectChanges();

            expect(grid.pinnedColumns.length).toEqual(6);
            expect(grid.unpinnedColumns.length).toEqual(10);
            expect(genGroup.visibleIndex).toEqual(1);
            expect(colID.visibleIndex).toEqual(0);

            expect(grid.rowList.first.cells.first.value).toMatch('ALFKI');
            expect(grid.rowList.first.cells.toArray()[1].value).toMatch('Alfreds Futterkiste');
            expect(grid.rowList.first.cells.toArray()[2].value).toMatch('Maria Anders');
            expect(grid.rowList.first.cells.toArray()[3].value).toMatch('Sales Representative');

            // pin grouped column to the pinned area
            const compName = grid.getColumnByName('CompanyName');
            const persDetails = getColGroup(grid, 'Person Details');
            const contTitle = grid.getColumnByName('ContactTitle');

            grid.moveColumn(colID, genGroup);
            grid.moveColumn(compName, persDetails);
            grid.moveColumn(contName, contTitle);
            fixture.detectChanges();
            fixture.detectChanges();

            expect(grid.rowList.first.cells.first.value).toMatch('Sales Representative');
            expect(grid.rowList.first.cells.toArray()[1].value).toMatch('Maria Anders');
            expect(grid.rowList.first.cells.toArray()[2].value).toMatch('Alfreds Futterkiste');
            expect(grid.rowList.first.cells.toArray()[3].value).toMatch('ALFKI');
        });

        it('Should move column group correctly. One level column groups.', () => {
            fixture = TestBed.createComponent(ThreeGroupsThreeColumnsGridComponent);
            fixture.detectChanges();
            const ci = fixture.componentInstance;
            grid = ci.grid;
            const genInfoCols = [ci.genInfoColGroup, ci.companyNameCol,
            ci.contactNameCol, ci.contactTitleCol];
            const locCols = [ci.locationColGroup, ci.countryCol, ci.regionCol, ci.cityCol];
            const contactInfoCols = [ci.contactInfoColGroup, ci.phoneCol, ci.faxCol, ci.postalCodeCol];

            testColumnsOrder(genInfoCols.concat(locCols).concat(contactInfoCols));

            // moving last to be first
            grid.moveColumn(ci.contactInfoColGroup, ci.genInfoColGroup, DropPosition.BeforeDropTarget);
            fixture.detectChanges();
            testColumnsOrder(contactInfoCols.concat(genInfoCols).concat(locCols));

            // moving first to be last
            grid.moveColumn(ci.contactInfoColGroup, ci.locationColGroup);
            fixture.detectChanges();
            testColumnsOrder(genInfoCols.concat(locCols).concat(contactInfoCols));

            // moving inner to be last
            grid.moveColumn(ci.locationColGroup, ci.contactInfoColGroup);
            fixture.detectChanges();
            testColumnsOrder(genInfoCols.concat(contactInfoCols).concat(locCols));

            // moving inner to be first
            grid.moveColumn(ci.contactInfoColGroup, ci.genInfoColGroup, DropPosition.BeforeDropTarget);
            fixture.detectChanges();
            testColumnsOrder(contactInfoCols.concat(genInfoCols).concat(locCols));

            // moving to the same spot, no change expected
            grid.moveColumn(ci.genInfoColGroup, ci.genInfoColGroup);
            fixture.detectChanges();
            testColumnsOrder(contactInfoCols.concat(genInfoCols).concat(locCols));

            // moving column group to the place of a column, no change expected
            grid.moveColumn(ci.genInfoColGroup, ci.countryCol);
            fixture.detectChanges();
            testColumnsOrder(contactInfoCols.concat(genInfoCols).concat(locCols));
        });

        it('Should move columns within column groups. One level column groups.', () => {
            fixture = TestBed.createComponent(ThreeGroupsThreeColumnsGridComponent);
            fixture.detectChanges();
            const ci = fixture.componentInstance;
            grid = ci.grid;
            const genInfoAndLocCols = [ci.genInfoColGroup, ci.companyNameCol,
            ci.contactNameCol, ci.contactTitleCol, ci.locationColGroup, ci.countryCol,
            ci.regionCol, ci.cityCol];

            // moving last to be first
            grid.moveColumn(ci.postalCodeCol, ci.phoneCol, DropPosition.BeforeDropTarget);
            fixture.detectChanges();
            testColumnsOrder(genInfoAndLocCols.concat([ci.contactInfoColGroup,
            ci.postalCodeCol, ci.phoneCol, ci.faxCol]));

            // moving first to be last
            grid.moveColumn(ci.postalCodeCol, ci.faxCol);
            fixture.detectChanges();
            testColumnsOrder(genInfoAndLocCols.concat([ci.contactInfoColGroup,
            ci.phoneCol, ci.faxCol, ci.postalCodeCol]));

            // moving inner to be last
            grid.moveColumn(ci.faxCol, ci.postalCodeCol);
            fixture.detectChanges();
            testColumnsOrder(genInfoAndLocCols.concat([ci.contactInfoColGroup,
            ci.phoneCol, ci.postalCodeCol, ci.faxCol]));

            // moving inner to be first
            grid.moveColumn(ci.postalCodeCol, ci.phoneCol, DropPosition.BeforeDropTarget);
            fixture.detectChanges();
            testColumnsOrder(genInfoAndLocCols.concat([ci.contactInfoColGroup,
            ci.postalCodeCol, ci.phoneCol, ci.faxCol]));

            // moving to the sample spot, no change expected
            grid.moveColumn(ci.postalCodeCol, ci.postalCodeCol);
            fixture.detectChanges();
            testColumnsOrder(genInfoAndLocCols.concat([ci.contactInfoColGroup,
            ci.postalCodeCol, ci.phoneCol, ci.faxCol]));

            // moving column to the place of its column group, no change expected
            grid.moveColumn(ci.postalCodeCol, ci.contactInfoColGroup);
            fixture.detectChanges();
            testColumnsOrder(genInfoAndLocCols.concat([ci.contactInfoColGroup,
            ci.postalCodeCol, ci.phoneCol, ci.faxCol]));

            //// moving column to the place of a column group, no change expected
            grid.moveColumn(ci.postalCodeCol, ci.genInfoColGroup);
            fixture.detectChanges();
            testColumnsOrder(genInfoAndLocCols.concat([ci.contactInfoColGroup,
            ci.postalCodeCol, ci.phoneCol, ci.faxCol]));
        });

        it('Should move columns and groups. Two level column groups.', () => {
            fixture = TestBed.createComponent(NestedColGroupsGridComponent);
            fixture.detectChanges();
            const ci = fixture.componentInstance;
            grid = ci.grid;

            // moving a two-level col
            grid.moveColumn(ci.phoneCol, ci.locationColGroup, DropPosition.BeforeDropTarget);
            fixture.detectChanges();
            testColumnsOrder([ci.contactInfoColGroup, ci.phoneCol, ci.locationColGroup, ci.countryCol,
            ci.genInfoColGroup, ci.companyNameCol, ci.cityCol]);

            // moving a three-level col
            grid.moveColumn(ci.cityCol, ci.contactInfoColGroup, DropPosition.BeforeDropTarget);
            fixture.detectChanges();
            const colsOrder = [ci.cityCol, ci.contactInfoColGroup, ci.phoneCol,
            ci.locationColGroup, ci.countryCol, ci.genInfoColGroup, ci.companyNameCol];
            testColumnsOrder(colsOrder);

            // moving between different groups, hould stay the same
            grid.moveColumn(ci.locationColGroup, ci.companyNameCol);
            fixture.detectChanges();
            testColumnsOrder(colsOrder);

            // moving between different levels, should stay the same
            grid.moveColumn(ci.countryCol, ci.phoneCol);
            testColumnsOrder(colsOrder);

            // moving between different levels, should stay the same
            grid.moveColumn(ci.cityCol, ci.phoneCol);
            fixture.detectChanges();
            testColumnsOrder(colsOrder);

            grid.moveColumn(ci.genInfoColGroup, ci.companyNameCol);
            fixture.detectChanges();
            testColumnsOrder(colsOrder);

            grid.moveColumn(ci.locationColGroup, ci.contactInfoColGroup);
            fixture.detectChanges();
            testColumnsOrder(colsOrder);
        });

        it('Should move columns and groups. Pinning enabled.', () => {
            fixture = TestBed.createComponent(StegosaurusGridComponent);
            fixture.detectChanges();
            const ci = fixture.componentInstance;

            ci.idCol.pinned = true;
            fixture.detectChanges();
            ci.genInfoColGroup.pinned = true;
            fixture.detectChanges();
            ci.postalCodeColGroup.pinned = true;
            fixture.detectChanges();
            ci.cityColGroup.pinned = true;
            fixture.detectChanges();

            // moving group from unpinned to pinned
            ci.grid.moveColumn(ci.phoneColGroup, ci.idCol, DropPosition.BeforeDropTarget);
            fixture.detectChanges();
            let postMovingOrder = ci.phoneColList.concat([ci.idCol]).concat(ci.genInfoColList)
                .concat(ci.postalCodeColList).concat(ci.cityColList).concat(ci.countryColList)
                .concat(ci.regionColList).concat(ci.addressColList).concat(ci.faxColList);
            testColumnsVisibleIndexes(postMovingOrder);
            testColumnPinning(ci.phoneColGroup, true);
            testColumnPinning(ci.idCol, true);

            // moving sub group to different parent, should not be allowed
            ci.grid.moveColumn(ci.pDetailsColGroup, ci.regionCol);
            fixture.detectChanges();
            testColumnsVisibleIndexes(postMovingOrder);
            testColumnPinning(ci.pDetailsColGroup, true);
            testColumnPinning(ci.regionCol, false);

            // moving pinned group as firstly unpinned
            ci.grid.moveColumn(ci.idCol, ci.cityColGroup);
            fixture.detectChanges();
            ci.idCol.pinned = false;
            fixture.detectChanges();
            postMovingOrder = ci.phoneColList.concat(ci.genInfoColList)
                .concat(ci.postalCodeColList).concat(ci.cityColList).concat([ci.idCol])
                .concat(ci.countryColList).concat(ci.regionColList)
                .concat(ci.addressColList).concat(ci.faxColList);
            testColumnsVisibleIndexes(postMovingOrder);
            testColumnPinning(ci.idCol, false);
            testColumnPinning(ci.countryColGroup, false);

            // moving column to different parent, shound not be allowed
            ci.grid.moveColumn(ci.postalCodeCol, ci.cityCol);
            fixture.detectChanges();
            testColumnsVisibleIndexes(postMovingOrder);
            testColumnPinning(ci.postalCodeCol, true);
            testColumnPinning(ci.cityCol, true);
        });
    });

    describe('Features integration tests: ', () => {
        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(ColumnGroupFourLevelTestComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
        }));

        it('sorting - sort a grouped column by API', () => {
            // Verify columns and groups
            testGroupsAndColumns(7, 11, fixture);

            grid.getColumnByName('CompanyName').sortable = true;
            grid.getColumnByName('ContactName').sortable = true;
            fixture.detectChanges();
            // Sort column
            grid.sort({ fieldName: 'CompanyName', dir: SortingDirection.Asc, ignoreCase: true });
            fixture.detectChanges();

            // Verify columns and groups
            testGroupsAndColumns(7, 11, fixture);

            // Verify cells
            expect(grid.getCellByColumn(0, 'ID').value).toEqual('ALFKI');
            expect(grid.getCellByColumn(0, 'ContactTitle').value).toEqual('Sales Representative');
            expect(grid.getCellByColumn(0, 'CompanyName').value).toEqual('Alfreds Futterkiste');
            expect(grid.getCellByColumn(4, 'ID').value).toEqual('BSBEV');
            expect(grid.getCellByColumn(4, 'ContactTitle').value).toEqual('Sales Representative');
            expect(grid.getCellByColumn(4, 'Country').value).toEqual('UK');

            grid.clearSort();
            fixture.detectChanges();
            // Verify columns and groups
            testGroupsAndColumns(7, 11, fixture);

            // Verify cells
            expect(grid.getCellByColumn(0, 'ID').value).toEqual('ALFKI');
            expect(grid.getCellByColumn(0, 'ContactTitle').value).toEqual('Sales Representative');
            expect(grid.getCellByColumn(0, 'CompanyName').value).toEqual('Alfreds Futterkiste');
            expect(grid.getCellByColumn(4, 'ID').value).toEqual('BERGS');
            expect(grid.getCellByColumn(4, 'Country').value).toEqual('Sweden');

            // sort column which is not in the view
            grid.sort({ fieldName: 'ContactName', dir: SortingDirection.Asc, ignoreCase: true });
            fixture.detectChanges();

            // Verify columns and groups
            testGroupsAndColumns(7, 11, fixture);

            // Verify cells
            expect(grid.getCellByColumn(0, 'ID').value).toEqual('ANATR');
            expect(grid.getCellByColumn(0, 'ContactTitle').value).toEqual('Owner');
            expect(grid.getCellByColumn(0, 'CompanyName').value).toEqual('Ana Trujillo Emparedados y helados');
            expect(grid.getCellByColumn(3, 'ID').value).toEqual('FAMIA');
            expect(grid.getCellByColumn(3, 'ContactTitle').value).toEqual('Marketing Assistant');
            expect(grid.getCellByColumn(3, 'Country').value).toEqual('Brazil');
        });

        it('sorting - sort a grouped column by clicking on header cell UI', () => {
            // Verify columns and groups
            testGroupsAndColumns(7, 11, fixture);

            grid.getColumnByName('CompanyName').sortable = true;
            fixture.detectChanges();

            // Sort column by clicking on it
            const contactTitleHeaderCell = GridFunctions.getColumnHeaderByIndex(fixture, 3);
            contactTitleHeaderCell.triggerEventHandler('click', new Event('click'));
            fixture.detectChanges();

            // Verify columns and groups
            testGroupsAndColumns(7, 11, fixture);
            // Verify cells
            expect(grid.getCellByColumn(0, 'ID').value).toEqual('ALFKI');
            expect(grid.getCellByColumn(0, 'ContactTitle').value).toEqual('Sales Representative');
            expect(grid.getCellByColumn(0, 'CompanyName').value).toEqual('Alfreds Futterkiste');
            expect(grid.getCellByColumn(4, 'ID').value).toEqual('BERGS');
            expect(grid.getCellByColumn(4, 'ContactTitle').value).toEqual('Order Administrator');
            expect(grid.getCellByColumn(4, 'Country').value).toEqual('Sweden');
        });

        it('summaries - verify summaries when there are grouped columns', () => {
            const allColumns = grid.columnList;
            allColumns.forEach((col) => {
                if (!col.columnGroup) {
                    col.hasSummary = true;
                }
            });
            fixture.detectChanges();

            const summaryRow = GridSummaryFunctions.getRootSummaryRow(fixture);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, ['Count'], ['27']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['27']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['27']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count'], ['27']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count'], ['27']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 5, ['Count'], ['27']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 6, ['Count'], ['27']);
        });

        it('filtering - filter a grouped column', fakeAsync(() => {
            const initialRowListLenght = grid.rowList.length;
            // Verify columns and groups
            testGroupsAndColumns(7, 11, fixture);

            grid.getColumnByName('ContactTitle').filterable = true;
            tick();
            grid.getColumnByName('PostalCode').filterable = true;
            tick();
            fixture.detectChanges();

            // Filter column
            grid.filter('ContactTitle', 'Accounting Manager',
                IgxStringFilteringOperand.instance().condition('equals'), true);
            tick();
            fixture.detectChanges();
            expect(grid.rowList.length).toEqual(2);

            // Verify columns and groups
            testGroupsAndColumns(7, 11, fixture);

            // Filter column
            grid.filter('PostalCode', '28', IgxStringFilteringOperand.instance().condition('contains'), true);
            tick();
            fixture.detectChanges();
            expect(grid.rowList.length).toEqual(1);

            // Reset filters
            grid.clearFilter('ContactTitle');
            tick();
            grid.clearFilter('PostalCode');
            tick();
            fixture.detectChanges();

            expect(grid.rowList.length).toEqual(initialRowListLenght);
            // Verify columns and groups
            testGroupsAndColumns(7, 11, fixture);

            // Filter column with no match
            grid.filter('ContactTitle', 'no items', IgxStringFilteringOperand.instance().condition('equals'), true);
            tick();
            fixture.detectChanges();
            expect(grid.rowList.length).toEqual(0);
            // Verify columns and groups
            testGroupsAndColumns(7, 11, fixture);

            // Clear filter
            grid.clearFilter('ContactTitle');
            tick();
            fixture.detectChanges();

            expect(grid.rowList.length).toEqual(initialRowListLenght);
            // Verify columns and groups
            testGroupsAndColumns(7, 11, fixture);
        }));

        it('grouping - verify grouping when there are grouped columns', () => {
            fixture = TestBed.createComponent(ColumnGroupTestComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;

            // Verify columns and groups
            testGroupsAndColumns(5, 11, fixture);

            grid.getColumnByName('ContactTitle').groupable = true;
            grid.getColumnByName('Country').groupable = true;
            grid.getColumnByName('Phone').groupable = true;
            fixture.detectChanges();

            grid.groupBy({
                fieldName: 'ContactTitle', dir: SortingDirection.Desc, ignoreCase: false,
                strategy: DefaultSortingStrategy.instance()
            });

            fixture.detectChanges();

            // verify grouping expressions
            const grExprs = grid.groupingExpressions;
            expect(grExprs.length).toEqual(1);
            expect(grExprs[0].fieldName).toEqual('ContactTitle');

            // verify rows
            const groupRows = grid.groupsRowList.toArray();
            const dataRows = grid.dataRowList.toArray();

            expect(groupRows.length).toEqual(1);
            expect(dataRows.length).toEqual(6);

            // Verify first grouped row
            const firstGroupedRow = groupRows[0].groupRow;
            expect(firstGroupedRow.value).toEqual('Sales Representative');
            expect(firstGroupedRow.records.length).toEqual(6);
        });
    });
});

const getColGroup = (grid: IgxGridComponent, headerName: string): IgxColumnGroupComponent => {
    const colGroups = grid.columnList.filter(c => c.columnGroup && c.header === headerName);
    if (colGroups.length === 0) {
        return null;
    } else if (colGroups.length === 1) {
        return colGroups[0];
    } else {
        throw new Error('More than one column group found.');
    }
};

// tests column and column group header rendering
const testColumnGroupHeaderRendering = (column: DebugElement, width: number, height: number,
    title: string, descendentColumnCssClass?: string, descendentColumnCount?: number) => {

    expect(column.nativeElement.offsetHeight).toBe(height);
    expect(column.nativeElement.offsetWidth).toBe(width);

    const colHeaderTitle = column.children
        .filter(c => c.nativeElement.classList.contains(GRID_COL_GROUP_THEAD_TITLE_CLASS))[0];
    expect(colHeaderTitle.nativeElement.textContent).toBe(title);

    const colGroupDirectChildren = column.children
        .filter(c => c.nativeElement.classList.contains(GRID_COL_GROUP_THEAD_GROUP_CLASS))[0]
        .children.filter(c => {
            const header = c.query(By.directive(IgxGridHeaderComponent));
            return header.nativeElement.classList.contains(descendentColumnCssClass);
        });

    expect(colGroupDirectChildren.length).toBe(descendentColumnCount);
};

const testColumnHeaderRendering = (column: DebugElement, width: number, height: number,
    title: string) => {
    expect(column.nativeElement.offsetHeight).toBe(height);
    expect(column.nativeElement.offsetWidth).toBe(width);

    const colHeaderTitle = column.children
        .filter(c => c.nativeElement.classList.contains(GRID_COL_THEAD_TITLE_CLASS))[0];
    expect(colHeaderTitle.nativeElement.textContent.trim()).toBe(title);
};

const testColumnsOrder = (columns: IgxColumnComponent[]) => {
    testColumnsIndexes(columns);
    testColumnsVisibleIndexes(columns);
};

const testColumnsIndexes = (columns: IgxColumnComponent[]) => {
    for (let index = 0; index < columns.length; index++) {
        expect(columns[index].index).toBe(index);
    }
};

const testColumnsVisibleIndexes = (columns: IgxColumnComponent[]) => {
    let visibleIndex = 0;
    for (const column of columns) {
        expect(column.visibleIndex).toBe(visibleIndex);
        if (!(column instanceof IgxColumnGroupComponent)) {
            visibleIndex++;
        }
    }
};

const testGroupsAndColumns = (groups: number, columns: number, ci) => {
    expect(GridFunctions.getColumnGroupHeaders(ci).length).toEqual(groups);
    expect(GridFunctions.getColumnHeaders(ci).length).toEqual(columns);
};

const testColumnPinning = (column: IgxColumnComponent, isPinned: boolean) => {
    expect(column.pinned).toBe(isPinned);
    expect(column.allChildren.every(c => c.pinned === isPinned)).toEqual(true);
};

type PinUnpinFunc = (component: ColumnGroupFourLevelTestComponent) => void;

class PinningTests {
    public static testColumnGroupPinning(pinGenInfoColFunc: PinUnpinFunc, unpinGenInfoColFunc: PinUnpinFunc) {
        const fixture = TestBed.createComponent(ColumnGroupFourLevelTestComponent);
        fixture.detectChanges();
        const ci = fixture.componentInstance;
        const grid = ci.grid;
        expect(grid.pinnedColumns.length).toEqual(0);
        expect(grid.unpinnedColumns.length).toEqual(18);

        // Pin a column in a group
        pinGenInfoColFunc(ci);

        // Verify the topParent group is pinned
        testColumnPinning(ci.genInfoColGroup, true);
        testColumnPinning(ci.idCol, false);
        testColumnPinning(ci.addrInfoColGroup, false);
        testColumnsIndexes(ci.colsAndGroupsNaturalOrder);
        testColumnsVisibleIndexes(ci.genInfoColsAndGroups.concat(ci.idCol).concat(ci.addrInfoColGroup));

        expect(grid.pinnedColumns.length).toEqual(5);
        expect(grid.unpinnedColumns.length).toEqual(13);

        // Unpin a column
        unpinGenInfoColFunc(ci);

        // Verify the topParent group is not pinned
        testColumnPinning(ci.genInfoColGroup, false);
        testColumnPinning(ci.idCol, false);
        testColumnPinning(ci.addrInfoColGroup, false);
        testColumnsOrder(ci.colsAndGroupsNaturalOrder);

        expect(grid.pinnedColumns.length).toEqual(0);
        expect(grid.unpinnedColumns.length).toEqual(18);
    }
}

class NestedColGroupsTests {
    public static testHeadersRendering(fixture: ComponentFixture<NestedColumnGroupsGridComponent>) {
        const ci = fixture.componentInstance;
        const grid = ci.grid;
        const firstSlaveColGroup = fixture.debugElement.query(By.css('.firstSlaveColGroup'));
        const firstSlaveColGroupDepth = 2; // one-level children
        const firstSlaveColGroupChildrenCount = 2;
        const firstSlaveColGroupWidth = parseInt(ci.columnWidth, 10) + parseInt(ci.phoneColWidth, 10);

        testColumnGroupHeaderRendering(firstSlaveColGroup, firstSlaveColGroupWidth,
            firstSlaveColGroupDepth * grid.defaultRowHeight,
            ci.firstSlaveColGroupTitle, 'firstSlaveChild', firstSlaveColGroupChildrenCount);

        const secondSlaveColGroup = fixture.debugElement.query(By.css('.secondSlaveColGroup'));
        const secondSlaveColGroupDepth = 2; // one-level children
        const secondSlaveColGroupChildrenCount = 2;
        const secondSlaveColGroupWidth = parseInt(ci.faxColWidth, 10) + parseInt(ci.cityColWidth, 10);

        testColumnGroupHeaderRendering(secondSlaveColGroup, secondSlaveColGroupWidth,
            secondSlaveColGroupDepth * grid.defaultRowHeight,
            ci.secondSlaveColGroupTitle, 'secondSlaveChild', secondSlaveColGroupChildrenCount);

        const masterColGroup = fixture.debugElement.query(By.css('.masterColGroup'));
        const masterColGroupWidth = firstSlaveColGroupWidth + secondSlaveColGroupWidth;
        const masterSlaveColGroupDepth = 3;
        const masterColGroupChildrenCount = 0;

        testColumnGroupHeaderRendering(masterColGroup, masterColGroupWidth,
            masterSlaveColGroupDepth * grid.defaultRowHeight, ci.masterColGroupTitle,
            'slaveColGroup', masterColGroupChildrenCount);
    }
}
/* eslint-enable max-len */
