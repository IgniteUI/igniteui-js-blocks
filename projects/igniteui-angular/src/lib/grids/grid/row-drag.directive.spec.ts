import { Component, ViewChild, DebugElement } from '@angular/core';
import { TestBed, ComponentFixture, fakeAsync, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { configureTestSuite } from '../../test-utils/configure-suite';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { DataParent, SampleTestData } from '../../test-utils/sample-test-data.spec';
import { Point } from '../../services/public_api';

import { IgxGridModule } from './grid.module';
import { IgxGridComponent } from './grid.component';
import { IgxColumnComponent } from '../columns/column.component';
import { IgxGridRowComponent } from './grid-row.component';
import { IgxRowDragDirective } from '../row-drag.directive';
import { IRowDragStartEventArgs, IRowDragEndEventArgs } from '../common/events';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { IgxDropDirective } from '../../directives/drag-drop/drag-drop.directive';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { IgxHierarchicalGridComponent, IgxHierarchicalGridModule, IgxRowDirective } from '../hierarchical-grid/public_api';
import { IgxRowIslandComponent } from '../hierarchical-grid/row-island.component';
import { IgxTreeGridComponent, IgxTreeGridModule } from '../tree-grid/public_api';
import { GridSelectionMode } from '../common/enums';

const DEBOUNCE_TIME = 50;
const CSS_CLASS_DRAG_INDICATOR = '.igx-grid__drag-indicator';
const CSS_CLASS_DRAG_INDICATOR_OFF = 'igx-grid__drag-indicator--off';
const CSS_CLASS_GRID_ROW = '.igx-grid__tr';
const CSS_CLASS_DRAG_ROW = 'igx-grid__tr--drag';
const CSS_CLASS_GHOST_ROW = 'igx-grid__tr--ghost';
const CSS_CLASS_SELECTED_ROW = 'igx-grid__tr--selected';
const CSS_CLASS_SELECTION_CHECKBOX = '.igx-grid__cbx-selection';
const CSS_CLASS_VIRTUAL_HSCROLLBAR = '.igx-vhelper--horizontal';
const CSS_CLASS_LAST_PINNED_HEADER = 'igx-grid__th--pinned-last';
const CSS_CLASS_DROPPABLE_AREA = '.droppable-area';
const CSS_CLASS_NON_DROPPABLE_AREA = '.non-droppable-area';

describe('Row Drag Tests #grid', () => {
    let fixture: ComponentFixture<any>;
    let dropAreaElement: Element;
    let dragIndicatorElements: DebugElement[];
    let dragIndicatorElement: Element;
    let rowDragDirective: IgxRowDragDirective;
    let startPoint: Point;
    let movePoint: Point;
    let dropPoint: Point;
    let pointerDownEvent: PointerEvent;
    let pointerMoveEvent: PointerEvent;
    let pointerUpEvent: PointerEvent;

    describe('General tests', () => {
        describe('Drag and drop tests', () => {
            let grid: IgxGridComponent;
            let nonDroppableAreaElement: Element;
            let rows: IgxGridRowComponent[];
            let dragRows: DebugElement[];
            let rowToDrag: IgxGridRowComponent;
            configureTestSuite();
            beforeAll(waitForAsync(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        IgxGridRowDraggableComponent
                    ],
                    imports: [
                        FormsModule,
                        NoopAnimationsModule,
                        IgxGridModule
                    ]
                }).compileComponents();
            }));
            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(IgxGridRowDraggableComponent);
                grid = fixture.componentInstance.instance;
                fixture.detectChanges();
                rows = grid.rowList.toArray();
                dropAreaElement = fixture.debugElement.query(By.css(CSS_CLASS_DROPPABLE_AREA)).nativeElement;
                nonDroppableAreaElement = fixture.debugElement.query(By.css(CSS_CLASS_NON_DROPPABLE_AREA)).nativeElement;
                dragIndicatorElements = fixture.debugElement.queryAll(By.css(CSS_CLASS_DRAG_INDICATOR));
                dragRows = fixture.debugElement.queryAll(By.directive(IgxRowDragDirective));
            }));

            it('should drag and drop draggable row over droppable container', () => {
                dragIndicatorElement = dragIndicatorElements[2].nativeElement;
                rowToDrag = rows[1];
                rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);

                startPoint = UIInteractions.getPointFromElement(dragIndicatorElement);
                movePoint = UIInteractions.getPointFromElement(rows[4].nativeElement);
                dropPoint = UIInteractions.getPointFromElement(dropAreaElement);
                pointerDownEvent = UIInteractions.createPointerEvent('pointerdown', startPoint);
                pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', movePoint);
                pointerUpEvent = UIInteractions.createPointerEvent('pointerup', dropPoint);

                spyOn(grid.onRowDragStart, 'emit');
                spyOn(grid.onRowDragEnd, 'emit');

                expect(rowToDrag.dragging).toBeFalsy();
                expect(rowToDrag.grid.rowDragging).toBeFalsy();

                rowDragDirective.onPointerDown(pointerDownEvent);
                rowDragDirective.onPointerMove(pointerMoveEvent);
                expect(rowToDrag.dragging).toBeTruthy();
                expect(rowToDrag.grid.rowDragging).toBeTruthy();
                verifyRowDragStartEvent(grid, rowToDrag, rowDragDirective);

                pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', dropPoint);
                rowDragDirective.onPointerMove(pointerMoveEvent);
                expect(rowToDrag.dragging).toBeTruthy();
                expect(rowToDrag.grid.rowDragging).toBeTruthy();

                rowDragDirective.onPointerUp(pointerUpEvent);
                expect(rowToDrag.dragging).toBeFalsy();
                expect(rowToDrag.grid.rowDragging).toBeFalsy();
                verifyRowDragEndEvent(grid, rowToDrag, rowDragDirective, false);
            });
            it('should be able to drag row only by drag icon', (async () => {
                dragIndicatorElement = dragIndicatorElements[2].nativeElement;
                rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);
                rowToDrag = rows[1];
                const rowElement = rowToDrag.nativeElement;

                const dragIndicatorPoint = UIInteractions.getPointFromElement(dragIndicatorElement);
                const rowPoint = UIInteractions.getPointFromElement(rowElement);
                movePoint = UIInteractions.getPointFromElement(rows[4].nativeElement);
                pointerDownEvent = UIInteractions.createPointerEvent('pointerdown', startPoint);
                pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', movePoint);
                pointerUpEvent = UIInteractions.createPointerEvent('pointerup', dropPoint);
                spyOn(grid.onRowDragStart, 'emit');

                expect(rowToDrag.dragging).toBeFalsy();
                expect(rowToDrag.grid.rowDragging).toBeFalsy();

                await pointerDown(rowElement, rowPoint, fixture);
                await pointerMove(rowElement, movePoint, fixture);
                expect(rowToDrag.dragging).toBeFalsy();
                expect(rowToDrag.grid.rowDragging).toBeFalsy();
                expect(grid.onRowDragStart.emit).toHaveBeenCalledTimes(0);

                await pointerDown(dragIndicatorElement, dragIndicatorPoint, fixture);
                await pointerMove(dragIndicatorElement, movePoint, fixture);
                expect(rowToDrag.dragging).toBeTruthy();
                expect(rowToDrag.grid.rowDragging).toBeTruthy();
                verifyRowDragStartEvent(grid, rowToDrag, rowDragDirective);
                await pointerUp(dragIndicatorElement, movePoint, fixture);
            }));
            it('should not be able to drag grid header', () => {
                const header = fixture.debugElement.query(By.css(CSS_CLASS_GRID_ROW));
                const headerDragDirective = header.injector.get(IgxRowDragDirective, false);
                expect(headerDragDirective).toBe(false);
            });
            it('should cancel dragging when ESCAPE key is pressed.', (async () => {
                dragIndicatorElement = dragIndicatorElements[2].nativeElement;
                const row = rows[1];
                rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);

                startPoint = UIInteractions.getPointFromElement(dragIndicatorElement);
                movePoint = UIInteractions.getPointFromElement(rows[4].nativeElement);
                spyOn(grid.onRowDragStart, 'emit');
                spyOn(grid.onRowDragEnd, 'emit');

                rowDragDirective.onPointerDown(UIInteractions.createPointerEvent('pointerdown', startPoint));
                rowDragDirective.onPointerMove(UIInteractions.createPointerEvent('pointermove', movePoint));
                expect(row.dragging).toBeTruthy();
                expect(grid.rowDragging).toBeTruthy();
                expect(grid.onRowDragStart.emit).toHaveBeenCalledTimes(1);

                UIInteractions.triggerKeyDownEvtUponElem('Escape', dragIndicatorElement);
                await wait(DEBOUNCE_TIME);
                fixture.detectChanges();
                expect(row.dragging).toBeFalsy();
                expect(grid.rowDragging).toBeFalsy();
                expect(grid.onRowDragEnd.emit).toHaveBeenCalledTimes(1);
            }));
            it('should create ghost element upon row dragging', () => {
                dragIndicatorElement = dragIndicatorElements[2].nativeElement;
                rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);
                startPoint = UIInteractions.getPointFromElement(dragIndicatorElement);
                movePoint = UIInteractions.getPointFromElement(rows[4].nativeElement);
                dropPoint = UIInteractions.getPointFromElement(dropAreaElement);
                pointerDownEvent = UIInteractions.createPointerEvent('pointerdown', startPoint);
                pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', movePoint);
                pointerUpEvent = UIInteractions.createPointerEvent('pointerup', dropPoint);
                let ghostElements: HTMLCollection;

                rowDragDirective.onPointerDown(pointerDownEvent);
                rowDragDirective.onPointerMove(pointerMoveEvent);
                pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', dropPoint);
                rowDragDirective.onPointerMove(pointerMoveEvent);
                ghostElements = document.getElementsByClassName(CSS_CLASS_GHOST_ROW);
                expect(ghostElements.length).toEqual(1);

                rowDragDirective.onPointerUp(pointerUpEvent);
                ghostElements = document.getElementsByClassName(CSS_CLASS_GHOST_ROW);
                expect(ghostElements.length).toEqual(0);
            });
            it('should apply drag class to row upon row dragging', () => {
                dragIndicatorElement = dragIndicatorElements[2].nativeElement;
                rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);
                rowToDrag = rows[1];

                startPoint = UIInteractions.getPointFromElement(dragIndicatorElement);
                movePoint = UIInteractions.getPointFromElement(rows[4].nativeElement);
                dropPoint = UIInteractions.getPointFromElement(dropAreaElement);
                pointerDownEvent = UIInteractions.createPointerEvent('pointerdown', startPoint);
                pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', movePoint);
                pointerUpEvent = UIInteractions.createPointerEvent('pointerup', dropPoint);

                expect(rowToDrag.dragging).toBeFalsy();
                expect(rowToDrag.grid.rowDragging).toBeFalsy();
                expect(rowToDrag.element.nativeElement.classList.contains(CSS_CLASS_DRAG_ROW)).toBeFalsy();

                rowDragDirective.onPointerDown(pointerDownEvent);
                rowDragDirective.onPointerMove(pointerMoveEvent);
                expect(rowToDrag.dragging).toBeTruthy();
                expect(rowToDrag.grid.rowDragging).toBeTruthy();
                expect(rowToDrag.element.nativeElement.classList.contains(CSS_CLASS_DRAG_ROW)).toBeTruthy();

                pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', dropPoint);
                rowDragDirective.onPointerMove(pointerMoveEvent);
                rowDragDirective.onPointerUp(pointerUpEvent);
                expect(rowToDrag.dragging).toBeFalsy();
                expect(rowToDrag.grid.rowDragging).toBeFalsy();
                expect(rowToDrag.element.nativeElement.classList.contains(CSS_CLASS_DRAG_ROW)).toBeFalsy();
            });
            it('should align horizontal scrollbar with first column when column pinning is disabled', () => {
                // has no draggable and selectable rows
                grid.width = '400px';
                grid.rowSelection = GridSelectionMode.none;
                grid.rowDraggable = false;
                fixture.detectChanges();
                let rowSelectElement: DebugElement = fixture.debugElement.query(By.css(CSS_CLASS_SELECTION_CHECKBOX));
                let rowDragIndicatorElement: DebugElement = fixture.debugElement.query(By.css(CSS_CLASS_DRAG_INDICATOR));
                let horizontalScrollbarElement: DebugElement = fixture.debugElement.query(By.css(CSS_CLASS_VIRTUAL_HSCROLLBAR));
                expect(rowSelectElement).toBeNull();
                expect(rowDragIndicatorElement).toBeNull();

                // has draggable rows and has no selectable rows
                grid.rowSelection = GridSelectionMode.none;
                grid.rowDraggable = true;
                fixture.detectChanges();
                rowSelectElement = fixture.debugElement.query(By.css(CSS_CLASS_SELECTION_CHECKBOX));
                rowDragIndicatorElement = fixture.debugElement.query(By.css(CSS_CLASS_DRAG_INDICATOR));
                horizontalScrollbarElement = fixture.debugElement.query(By.css(CSS_CLASS_VIRTUAL_HSCROLLBAR));
                const dragIndicatorRect = rowDragIndicatorElement.nativeElement.getBoundingClientRect();
                let horizontalScrollbarRect = horizontalScrollbarElement.nativeElement.getBoundingClientRect();
                expect(rowSelectElement).toBeNull();
                expect(dragIndicatorRect.right).toBe(horizontalScrollbarRect.left);

                // has draggable and selectable rows
                grid.rowSelection = GridSelectionMode.multiple;
                grid.rowDraggable = true;
                fixture.detectChanges();
                horizontalScrollbarElement = fixture.debugElement.query(By.css(CSS_CLASS_VIRTUAL_HSCROLLBAR));
                horizontalScrollbarRect = horizontalScrollbarElement.nativeElement.getBoundingClientRect();
                // The horizontal scrollbar should be visible
                expect(horizontalScrollbarRect.left).not.toBe(0);
            });
            it('should align horizontal scrollbar with first non-pinned column when column pinning is enabled', () => {
                grid.width = '400px';
                grid.pinColumn('ProductName');
                fixture.detectChanges();

                // selectable rows disabled
                let horizontalScrollbarElement: DebugElement = fixture.debugElement.query(By.css(CSS_CLASS_VIRTUAL_HSCROLLBAR));
                let horizontalScrollbarRect = horizontalScrollbarElement.nativeElement.getBoundingClientRect();
                let pinnedColumnHeaderElement: DebugElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_LAST_PINNED_HEADER));
                let pinnedColumnHeaderRect = pinnedColumnHeaderElement.nativeElement.getBoundingClientRect();

                // The horizontal scrollbar should be visible
                expect(horizontalScrollbarRect.left).not.toBe(0);

                // selectable rows enabled
                grid.rowSelection = GridSelectionMode.multiple;
                fixture.detectChanges();
                horizontalScrollbarElement = fixture.debugElement.query(By.css(CSS_CLASS_VIRTUAL_HSCROLLBAR));
                horizontalScrollbarRect = horizontalScrollbarElement.nativeElement.getBoundingClientRect();
                pinnedColumnHeaderElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_LAST_PINNED_HEADER));
                pinnedColumnHeaderRect = pinnedColumnHeaderElement.nativeElement.getBoundingClientRect();
                expect(pinnedColumnHeaderRect.right).toBe(horizontalScrollbarRect.left);
            });
            it('should fire drag events with correct values of event arguments.', () => {
                rowToDrag = rows[2];
                rowDragDirective = dragRows[2].injector.get(IgxRowDragDirective);
                dragIndicatorElement = dragIndicatorElements[3].nativeElement;

                startPoint = UIInteractions.getPointFromElement(dragIndicatorElement);
                dropPoint = UIInteractions.getPointFromElement(dropAreaElement);
                pointerDownEvent = UIInteractions.createPointerEvent('pointerdown', startPoint);
                pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', dropPoint);
                pointerUpEvent = UIInteractions.createPointerEvent('pointerup', dropPoint);

                spyOn(grid.onRowDragStart, 'emit').and.callThrough();
                spyOn(grid.onRowDragEnd, 'emit').and.callThrough();

                rowDragDirective.onPointerDown(pointerDownEvent);
                rowDragDirective.onPointerMove(pointerMoveEvent);
                verifyRowDragStartEvent(grid, rowToDrag, rowDragDirective);

                rowDragDirective.onPointerMove(pointerMoveEvent);
                rowDragDirective.onPointerUp(pointerUpEvent);
                verifyRowDragEndEvent(grid, rowToDrag, rowDragDirective, false);
            });
            it('should emit dragdrop events if dropping a row on a non-interactive area', () => {
                dragIndicatorElement = dragIndicatorElements[2].nativeElement;
                rowToDrag = rows[1];
                rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);

                startPoint = UIInteractions.getPointFromElement(dragIndicatorElement);
                movePoint = UIInteractions.getPointFromElement(rows[4].nativeElement);
                dropPoint = UIInteractions.getPointFromElement(nonDroppableAreaElement);
                pointerDownEvent = UIInteractions.createPointerEvent('pointerdown', startPoint);
                pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', movePoint);
                pointerUpEvent = UIInteractions.createPointerEvent('pointerup', dropPoint);

                spyOn(grid.onRowDragStart, 'emit');
                spyOn(grid.onRowDragEnd, 'emit');

                expect(rowToDrag.dragging).toBeFalsy();
                expect(rowToDrag.grid.rowDragging).toBeFalsy();

                rowDragDirective.onPointerDown(pointerDownEvent);
                rowDragDirective.onPointerMove(pointerMoveEvent);
                expect(rowToDrag.dragging).toBeTruthy();
                expect(rowToDrag.grid.rowDragging).toBeTruthy();
                verifyRowDragStartEvent(grid, rowToDrag, rowDragDirective);

                pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', dropPoint);
                rowDragDirective.onPointerMove(pointerMoveEvent);
                expect(rowToDrag.dragging).toBeTruthy();
                expect(rowToDrag.grid.rowDragging).toBeTruthy();

                rowDragDirective.onPointerUp(pointerUpEvent);
                expect(rowToDrag.dragging).toBeFalsy();
                expect(rowToDrag.grid.rowDragging).toBeFalsy();
                verifyRowDragEndEvent(grid, rowToDrag, rowDragDirective, false);
            });
            it('should destroy the drag ghost if dropping a row on a non-interactive area when animations are enabled', () => {
                grid.onRowDragEnd.subscribe((e: IRowDragEndEventArgs) => {
                    e.animation = true;
                });
                dragIndicatorElement = dragIndicatorElements[2].nativeElement;
                rowToDrag = rows[1];
                rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);

                startPoint = UIInteractions.getPointFromElement(dragIndicatorElement);
                movePoint = UIInteractions.getPointFromElement(rows[4].nativeElement);
                dropPoint = UIInteractions.getPointFromElement(nonDroppableAreaElement);
                pointerDownEvent = UIInteractions.createPointerEvent('pointerdown', startPoint);
                pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', movePoint);
                pointerUpEvent = UIInteractions.createPointerEvent('pointerup', dropPoint);

                spyOn(grid.onRowDragStart, 'emit');
                spyOn(grid.onRowDragEnd, 'emit');

                expect(rowToDrag.dragging).toBeFalsy();
                expect(rowToDrag.grid.rowDragging).toBeFalsy();

                rowDragDirective.onPointerDown(pointerDownEvent);
                rowDragDirective.onPointerMove(pointerMoveEvent);
                expect(rowToDrag.dragging).toBeTruthy();
                expect(rowToDrag.grid.rowDragging).toBeTruthy();
                verifyRowDragStartEvent(grid, rowToDrag, rowDragDirective);

                pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', dropPoint);
                rowDragDirective.onPointerMove(pointerMoveEvent);
                expect(rowToDrag.dragging).toBeTruthy();
                expect(rowToDrag.grid.rowDragging).toBeTruthy();

                rowDragDirective.onPointerUp(pointerUpEvent);
                expect(rowToDrag.dragging).toBeFalsy();
                expect(rowToDrag.grid.rowDragging).toBeFalsy();
                verifyRowDragEndEvent(grid, rowToDrag, rowDragDirective, false);
                const ghostElements = document.getElementsByClassName(CSS_CLASS_GHOST_ROW);
                expect(ghostElements.length).toEqual(0);
                const dragIndicatorsOff = document.getElementsByClassName(CSS_CLASS_DRAG_INDICATOR_OFF);
                expect(dragIndicatorsOff.length).toEqual(0);
            });
            it('should be able to cancel onRowDragStart event.', () => {
                grid.onRowDragStart.subscribe((e: IRowDragStartEventArgs) => {
                    e.cancel = true;
                });
                rowToDrag = rows[2];
                rowDragDirective = dragRows[2].injector.get(IgxRowDragDirective);
                dragIndicatorElement = dragIndicatorElements[rowToDrag.index].nativeElement;

                startPoint = UIInteractions.getPointFromElement(dragIndicatorElement);
                dropPoint = UIInteractions.getPointFromElement(dropAreaElement);
                pointerDownEvent = UIInteractions.createPointerEvent('pointerdown', startPoint);
                pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', dropPoint);
                pointerUpEvent = UIInteractions.createPointerEvent('pointerup', dropPoint);

                spyOn(grid.onRowDragStart, 'emit').and.callThrough();
                spyOn(grid.onRowDragEnd, 'emit').and.callThrough();

                rowDragDirective.onPointerDown(pointerDownEvent);
                rowDragDirective.onPointerMove(pointerMoveEvent);
                expect(grid.onRowDragStart.emit).toHaveBeenCalledTimes(1);

                rowDragDirective.onPointerMove(pointerMoveEvent);
                rowDragDirective.onPointerUp(pointerUpEvent);
                expect(grid.onRowDragEnd.emit).toHaveBeenCalledTimes(0);
                const ghostElements = document.getElementsByClassName(CSS_CLASS_GHOST_ROW);
                expect(ghostElements.length).toEqual(0);
            });
        });
        describe('Custom ghost template tests', () => {
            let grid: IgxGridComponent;
            let rows: IgxGridRowComponent[];
            let dragRows: DebugElement[];
            configureTestSuite();
            beforeAll(waitForAsync(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        IgxGridRowCustomGhostDraggableComponent
                    ],
                    imports: [
                        FormsModule,
                        NoopAnimationsModule,
                        IgxGridModule
                    ]
                }).compileComponents();
            }));
            it('should correctly create custom ghost element', () => {
                fixture = TestBed.createComponent(IgxGridRowCustomGhostDraggableComponent);
                grid = fixture.componentInstance.instance;
                fixture.detectChanges();
                dropAreaElement = fixture.debugElement.query(By.css(CSS_CLASS_DROPPABLE_AREA)).nativeElement;
                rows = grid.rowList.toArray();
                dragIndicatorElements = fixture.debugElement.queryAll(By.css(CSS_CLASS_DRAG_INDICATOR));
                dragRows = fixture.debugElement.queryAll(By.directive(IgxRowDragDirective));
                rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);
                dragIndicatorElement = dragIndicatorElements[2].nativeElement;
                startPoint = UIInteractions.getPointFromElement(dragIndicatorElement);
                movePoint = UIInteractions.getPointFromElement(rows[4].nativeElement);
                dropPoint = UIInteractions.getPointFromElement(dropAreaElement);
                pointerDownEvent = UIInteractions.createPointerEvent('pointerdown', startPoint);
                pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', movePoint);

                rowDragDirective.onPointerDown(pointerDownEvent);
                rowDragDirective.onPointerMove(pointerMoveEvent);
                pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', dropPoint);
                rowDragDirective.onPointerMove(pointerMoveEvent);
                const ghostElements: HTMLCollection = document.getElementsByClassName(CSS_CLASS_GHOST_ROW);
                expect(ghostElements.length).toEqual(1);

                expect((rowDragDirective as any).ghostContext.data.ProductName).toEqual('NetAdvantage');
                expect((rowDragDirective as any).ghostContext.data.ID).toEqual(2);
                expect((rowDragDirective as any).ghostContext.grid).toEqual(grid);

                const ghostText = document.getElementsByClassName(CSS_CLASS_GHOST_ROW)[0].textContent;
                expect(ghostText).toEqual(' Moving a row! ');
            });
        });
    });

    describe('Grid feature integration tests', () => {
        let dragGrid: IgxGridComponent;
        let dropGrid: IgxGridComponent;
        let dragGridRows: IgxGridRowComponent[];
        let dropGridRows: IgxGridRowComponent[];
        let dragRows: DebugElement[];
        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    IgxGridFeaturesRowDragComponent
                ],
                imports: [
                    FormsModule,
                    NoopAnimationsModule,
                    IgxGridModule
                ]
            }).compileComponents();
        }));
        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(IgxGridFeaturesRowDragComponent);
            dragGrid = fixture.componentInstance.dragGrid;
            dropGrid = fixture.componentInstance.dropGrid;
            fixture.detectChanges();
            dragGridRows = dragGrid.rowList.toArray();
            dropAreaElement = fixture.debugElement.query(By.directive(IgxDropDirective)).nativeElement;
            dragIndicatorElements = fixture.debugElement.queryAll(By.css(CSS_CLASS_DRAG_INDICATOR));
            dragRows = fixture.debugElement.queryAll(By.directive(IgxRowDragDirective));
        }));
        const verifyDragAndDropRowCellValues = (dragRowIndex: number, dropRowIndex: number) => {
            const dragRow = dragGrid.getRowByIndex(dragRowIndex);
            const dragRowCells = dragRow.cells.toArray();

            const dropRow = dropGrid.getRowByIndex(dropRowIndex);
            const dropRowCells = dropRow.cells.toArray();
            for (let cellIndex = 0; cellIndex < dropRowCells.length; cellIndex++) {
                expect(dropRowCells[cellIndex].value).toEqual(dragRowCells[cellIndex].value);
            }
        };
        it('should drop row data in the proper grid columns', () => {
            dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);

            startPoint = UIInteractions.getPointFromElement(dragIndicatorElement);
            movePoint = UIInteractions.getPointFromElement(dragGridRows[2].nativeElement);
            dropPoint = UIInteractions.getPointFromElement(dropAreaElement);
            pointerDownEvent = UIInteractions.createPointerEvent('pointerdown', startPoint);
            pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', dropPoint);
            pointerUpEvent = UIInteractions.createPointerEvent('pointerup', dropPoint);

            rowDragDirective.onPointerDown(pointerDownEvent);
            rowDragDirective.onPointerMove(pointerMoveEvent);
            rowDragDirective.onPointerUp(pointerUpEvent);
            fixture.detectChanges();
            verifyDragAndDropRowCellValues(1, 0);
        });
        it('should be able to drag grid row when column moving is enabled', () => {
            const dragGridColumns = dragGrid.columnList.toArray();
            dragGrid.moveColumn(dragGridColumns[0], dragGridColumns[2]);
            fixture.detectChanges();

            dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const row = dragGridRows[1];
            rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);
            const dragRowCells = row.cells.toArray();

            startPoint = UIInteractions.getPointFromElement(dragIndicatorElement);
            movePoint = UIInteractions.getPointFromElement(dragGridRows[2].nativeElement);
            dropPoint = UIInteractions.getPointFromElement(dropAreaElement);
            pointerDownEvent = UIInteractions.createPointerEvent('pointerdown', startPoint);
            pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', movePoint);
            pointerUpEvent = UIInteractions.createPointerEvent('pointerup', dropPoint);

            spyOn(dragGrid.onRowDragStart, 'emit').and.callThrough();
            spyOn(dragGrid.onRowDragEnd, 'emit').and.callThrough();

            rowDragDirective.onPointerDown(pointerDownEvent);
            rowDragDirective.onPointerMove(pointerMoveEvent);
            expect(row.dragging).toBeTruthy();
            expect(row.grid.rowDragging).toBeTruthy();
            verifyRowDragStartEvent(dragGrid, row, rowDragDirective);
            pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', dropPoint);
            rowDragDirective.onPointerMove(pointerMoveEvent);
            rowDragDirective.onPointerUp(pointerUpEvent);
            fixture.detectChanges();
            expect(row.dragging).toBeFalsy();
            expect(row.grid.rowDragging).toBeFalsy();
            verifyRowDragEndEvent(dragGrid, row, rowDragDirective, false);

            dropGridRows = dropGrid.rowList.toArray();
            const dropRowCells = dropGridRows[0].cells.toArray();
            expect(dropRowCells[0].value).toEqual(dragRowCells[2].value);
            expect(dropRowCells[1].value).toEqual(dragRowCells[0].value);
            expect(dropRowCells[2].value).toEqual(dragRowCells[1].value);
            expect(dropRowCells[3].value).toEqual(dragRowCells[3].value);
            expect(dropRowCells[4].value).toEqual(dragRowCells[4].value);
        });
        it('should be able to drag grid row when column pinning is enabled', () => {
            dragGrid.pinColumn('ProductName');
            fixture.detectChanges();

            dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const row = dragGridRows[1];
            rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);
            const dragRowCells = row.cells.toArray();

            startPoint = UIInteractions.getPointFromElement(dragIndicatorElement);
            movePoint = UIInteractions.getPointFromElement(dragGridRows[2].nativeElement);
            dropPoint = UIInteractions.getPointFromElement(dropAreaElement);
            pointerDownEvent = UIInteractions.createPointerEvent('pointerdown', startPoint);
            pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', movePoint);
            pointerUpEvent = UIInteractions.createPointerEvent('pointerup', dropPoint);

            spyOn(dragGrid.onRowDragStart, 'emit').and.callThrough();
            spyOn(dragGrid.onRowDragEnd, 'emit').and.callThrough();

            rowDragDirective.onPointerDown(pointerDownEvent);
            rowDragDirective.onPointerMove(pointerMoveEvent);
            expect(row.dragging).toBeTruthy();
            expect(row.grid.rowDragging).toBeTruthy();
            verifyRowDragStartEvent(dragGrid, row, rowDragDirective);
            pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', dropPoint);
            rowDragDirective.onPointerMove(pointerMoveEvent);
            rowDragDirective.onPointerUp(pointerUpEvent);
            fixture.detectChanges();
            expect(row.dragging).toBeFalsy();
            expect(row.grid.rowDragging).toBeFalsy();
            verifyRowDragEndEvent(dragGrid, row, rowDragDirective, false);

            dropGridRows = dropGrid.rowList.toArray();
            const dropRowCells = dropGridRows[0].cells.toArray();
            expect(dropRowCells[0].value).toEqual(dragRowCells[1].value);
            expect(dropRowCells[1].value).toEqual(dragRowCells[2].value);
            expect(dropRowCells[2].value).toEqual(dragRowCells[0].value);
            expect(dropRowCells[3].value).toEqual(dragRowCells[3].value);
            expect(dropRowCells[4].value).toEqual(dragRowCells[4].value);
        });
        it('should be able to drag grid row when column hiding is enabled', () => {
            const hiddenDragCellValue = dragGrid.getCellByColumn(1, 'Downloads').value;
            dragGrid.columnHiding = true;
            const column = dragGrid.getColumnByName('Downloads');
            column.hidden = true;

            dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const row = dragGridRows[1];
            rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);
            startPoint = UIInteractions.getPointFromElement(dragIndicatorElement);
            movePoint = UIInteractions.getPointFromElement(dragGridRows[2].nativeElement);
            dropPoint = UIInteractions.getPointFromElement(dropAreaElement);
            pointerDownEvent = UIInteractions.createPointerEvent('pointerdown', startPoint);
            pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', movePoint);
            pointerUpEvent = UIInteractions.createPointerEvent('pointerup', dropPoint);

            spyOn(dragGrid.onRowDragStart, 'emit').and.callThrough();
            spyOn(dragGrid.onRowDragEnd, 'emit').and.callThrough();

            rowDragDirective.onPointerDown(pointerDownEvent);
            rowDragDirective.onPointerMove(pointerMoveEvent);
            expect(row.dragging).toBeTruthy();
            expect(dragGrid.rowDragging).toBeTruthy();
            verifyRowDragStartEvent(dragGrid, row, rowDragDirective);
            pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', dropPoint);
            rowDragDirective.onPointerMove(pointerMoveEvent);
            rowDragDirective.onPointerUp(pointerUpEvent);
            fixture.detectChanges();
            expect(row.dragging).toBeFalsy();
            expect(dragGrid.rowDragging).toBeFalsy();
            expect(dropGrid.rowList.length).toEqual(1);
            verifyRowDragEndEvent(dragGrid, row, rowDragDirective, false);

            const hiddenDropCellValue = dropGrid.getCellByColumn(0, 'Downloads').value;
            expect(hiddenDropCellValue).toEqual(hiddenDragCellValue);
        });
        it('should be able to drag sorted grid row', () => {
            dragGrid.sort({ fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: true });

            dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const row = dragGridRows[1];
            rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);
            startPoint = UIInteractions.getPointFromElement(dragIndicatorElement);
            movePoint = UIInteractions.getPointFromElement(dragGridRows[4].nativeElement);
            dropPoint = UIInteractions.getPointFromElement(dropAreaElement);
            pointerDownEvent = UIInteractions.createPointerEvent('pointerdown', startPoint);
            pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', movePoint);
            pointerUpEvent = UIInteractions.createPointerEvent('pointerup', dropPoint);

            spyOn(dragGrid.onRowDragStart, 'emit').and.callThrough();
            spyOn(dragGrid.onRowDragEnd, 'emit').and.callThrough();

            rowDragDirective.onPointerDown(pointerDownEvent);
            rowDragDirective.onPointerMove(pointerMoveEvent);
            expect(row.dragging).toBeTruthy();
            expect(row.grid.rowDragging).toBeTruthy();
            verifyRowDragStartEvent(dragGrid, row, rowDragDirective);

            pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', dropPoint);
            rowDragDirective.onPointerMove(pointerMoveEvent);
            rowDragDirective.onPointerUp(pointerUpEvent);
            fixture.detectChanges();
            expect(row.dragging).toBeFalsy();
            expect(row.grid.rowDragging).toBeFalsy();
            verifyRowDragEndEvent(dragGrid, row, rowDragDirective, false);
            expect(dropGrid.rowList.length).toEqual(1);
            verifyDragAndDropRowCellValues(1, 0);
        });
        it('should be able to drag filtered grid row', () => {
            dragGrid.filter('ProductName', 'Advantage', IgxStringFilteringOperand.instance().condition('contains'), true);

            dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const row = dragGridRows[1];
            rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);
            startPoint = UIInteractions.getPointFromElement(dragIndicatorElement);
            movePoint = UIInteractions.getPointFromElement(dragGridRows[4].nativeElement);
            dropPoint = UIInteractions.getPointFromElement(dropAreaElement);
            pointerDownEvent = UIInteractions.createPointerEvent('pointerdown', startPoint);
            pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', movePoint);
            pointerUpEvent = UIInteractions.createPointerEvent('pointerup', dropPoint);

            spyOn(dragGrid.onRowDragStart, 'emit').and.callThrough();
            spyOn(dragGrid.onRowDragEnd, 'emit').and.callThrough();

            rowDragDirective.onPointerDown(pointerDownEvent);
            rowDragDirective.onPointerMove(pointerMoveEvent);
            expect(row.dragging).toBeTruthy();
            expect(row.grid.rowDragging).toBeTruthy();
            verifyRowDragStartEvent(dragGrid, row, rowDragDirective);

            pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', dropPoint);
            rowDragDirective.onPointerMove(pointerMoveEvent);
            rowDragDirective.onPointerUp(pointerUpEvent);
            fixture.detectChanges();
            expect(row.dragging).toBeFalsy();
            expect(row.grid.rowDragging).toBeFalsy();
            verifyRowDragEndEvent(dragGrid, row, rowDragDirective, false);
            expect(dropGrid.rowList.length).toEqual(1);
            verifyDragAndDropRowCellValues(1, 0);
        });
        it('should be able to drag selected grid row', () => {
            dragGrid.rowSelection = GridSelectionMode.multiple;
            fixture.detectChanges();
            dragGrid.selectRows([2], false);
            fixture.detectChanges();

            dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const row = dragGridRows[1];
            rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);
            expect(row.selected).toBeTruthy();

            startPoint = UIInteractions.getPointFromElement(dragIndicatorElement);
            movePoint = UIInteractions.getPointFromElement(dragGridRows[4].nativeElement);
            dropPoint = UIInteractions.getPointFromElement(dropAreaElement);
            pointerDownEvent = UIInteractions.createPointerEvent('pointerdown', startPoint);
            pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', movePoint);
            pointerUpEvent = UIInteractions.createPointerEvent('pointerup', dropPoint);

            spyOn(dragGrid.onRowDragStart, 'emit').and.callThrough();
            spyOn(dragGrid.onRowDragEnd, 'emit').and.callThrough();

            rowDragDirective.onPointerDown(pointerDownEvent);
            rowDragDirective.onPointerMove(pointerMoveEvent);
            expect(row.dragging).toBeTruthy();
            expect(row.grid.rowDragging).toBeTruthy();
            verifyRowDragStartEvent(dragGrid, row, rowDragDirective);

            pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', dropPoint);
            rowDragDirective.onPointerMove(pointerMoveEvent);
            rowDragDirective.onPointerUp(pointerUpEvent);
            fixture.detectChanges();
            expect(row.dragging).toBeFalsy();
            expect(row.grid.rowDragging).toBeFalsy();
            verifyRowDragEndEvent(dragGrid, row, rowDragDirective, false);
            expect(dropGrid.rowList.length).toEqual(1);
            expect(row.selected).toBeTruthy();
        });
        it('should not apply selection class to ghost element when dragging selected grid row', () => {
            dragGrid.rowSelection = GridSelectionMode.multiple;
            fixture.detectChanges();
            dragGrid.selectRows([2], false);
            fixture.detectChanges();

            dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);
            const row = dragGridRows[1];
            expect(row.selected).toBeTruthy();

            startPoint = UIInteractions.getPointFromElement(dragIndicatorElement);
            movePoint = UIInteractions.getPointFromElement(dragGridRows[4].nativeElement);
            dropPoint = UIInteractions.getPointFromElement(dropAreaElement);
            pointerDownEvent = UIInteractions.createPointerEvent('pointerdown', startPoint);
            pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', movePoint);
            pointerUpEvent = UIInteractions.createPointerEvent('pointerup', dropPoint);

            rowDragDirective.onPointerDown(pointerDownEvent);
            rowDragDirective.onPointerMove(pointerMoveEvent);
            expect(row.dragging).toBeTruthy();
            expect(row.grid.rowDragging).toBeTruthy();

            const ghostElements = document.getElementsByClassName(CSS_CLASS_GHOST_ROW);
            const ghostElement = ghostElements[0];
            expect(ghostElements.length).toEqual(2);
            expect(ghostElement.classList.contains(CSS_CLASS_SELECTED_ROW)).toBeFalsy();

            pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', dropPoint);
            rowDragDirective.onPointerMove(pointerMoveEvent);
            rowDragDirective.onPointerUp(pointerUpEvent);
            fixture.detectChanges();
        });
        it('should be able to drag grid row with selected cells', () => {
            const range = { rowStart: 1, rowEnd: 1, columnStart: 0, columnEnd: 2 };
            dragGrid.selectRange(range);
            fixture.detectChanges();

            const verifyCellSelection = () => {
                for (let index = 0; index < rowCells.length; index++) {
                    const cellSelected = index <= 2 ? true : false;
                    expect(rowCells[index].selected).toEqual(cellSelected);
                }
            };

            dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            const row = dragGridRows[1];
            rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);
            const rowCells = row.cells.toArray();
            verifyCellSelection();

            startPoint = UIInteractions.getPointFromElement(dragIndicatorElement);
            movePoint = UIInteractions.getPointFromElement(dragGridRows[4].nativeElement);
            dropPoint = UIInteractions.getPointFromElement(dropAreaElement);
            pointerDownEvent = UIInteractions.createPointerEvent('pointerdown', startPoint);
            pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', movePoint);
            pointerUpEvent = UIInteractions.createPointerEvent('pointerup', dropPoint);

            spyOn(dragGrid.onRowDragStart, 'emit').and.callThrough();
            spyOn(dragGrid.onRowDragEnd, 'emit').and.callThrough();

            rowDragDirective.onPointerDown(pointerDownEvent);
            rowDragDirective.onPointerMove(pointerMoveEvent);
            expect(row.dragging).toBeTruthy();
            expect(row.grid.rowDragging).toBeTruthy();
            verifyRowDragStartEvent(dragGrid, row, rowDragDirective);

            pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', dropPoint);
            rowDragDirective.onPointerMove(pointerMoveEvent);
            rowDragDirective.onPointerUp(pointerUpEvent);
            fixture.detectChanges();
            expect(row.dragging).toBeFalsy();
            expect(row.grid.rowDragging).toBeFalsy();
            verifyRowDragEndEvent(dragGrid, row, rowDragDirective, false);
            expect(dropGrid.rowList.length).toEqual(1);
            verifyCellSelection();
        });
        it('should be able to drag grouped grid row', () => {
            dragGrid.groupBy({ fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: true });
            fixture.detectChanges();

            dragIndicatorElement = dragIndicatorElements[3].nativeElement;
            const row = dragGridRows[2];
            rowDragDirective = dragRows[2].injector.get(IgxRowDragDirective);
            const rowCells = row.cells.toArray();
            const groupHeader = dragGrid.groupsRecords.find(element => element.value === rowCells[2].value);
            let groupRow = groupHeader.records.find(element => element['ID'] === rowCells[1].value);
            expect(groupHeader.records.length).toEqual(2);
            expect(groupRow).toBeDefined();

            startPoint = UIInteractions.getPointFromElement(dragIndicatorElement);
            movePoint = UIInteractions.getPointFromElement(dragGridRows[4].nativeElement);
            dropPoint = UIInteractions.getPointFromElement(dropAreaElement);
            pointerDownEvent = UIInteractions.createPointerEvent('pointerdown', startPoint);
            pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', movePoint);
            pointerUpEvent = UIInteractions.createPointerEvent('pointerup', dropPoint);

            spyOn(dragGrid.onRowDragStart, 'emit').and.callThrough();
            spyOn(dragGrid.onRowDragEnd, 'emit').and.callThrough();

            rowDragDirective.onPointerDown(pointerDownEvent);
            rowDragDirective.onPointerMove(pointerMoveEvent);
            expect(row.dragging).toBeTruthy();
            expect(row.grid.rowDragging).toBeTruthy();
            verifyRowDragStartEvent(dragGrid, row, rowDragDirective);

            pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', dropPoint);
            rowDragDirective.onPointerMove(pointerMoveEvent);
            rowDragDirective.onPointerUp(pointerUpEvent);
            fixture.detectChanges();
            expect(row.dragging).toBeFalsy();
            expect(row.grid.rowDragging).toBeFalsy();
            verifyRowDragEndEvent(dragGrid, row, rowDragDirective, false);
            expect(dropGrid.rowList.length).toEqual(1);
            expect(groupHeader.records.length).toEqual(2);
            groupRow = groupHeader.records.find(element => element['ID'] === rowCells[1].value);
            expect(groupRow).toBeDefined();
        });
        it('should exit edit mode and discard changes on row dragging', () => {
            dragGrid.rowEditable = true;
            fixture.detectChanges();

            dragIndicatorElement = dragIndicatorElements[2].nativeElement;
            rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);
            const row = dragGridRows[1];

            startPoint = UIInteractions.getPointFromElement(dragIndicatorElement);
            movePoint = UIInteractions.getPointFromElement(dragGridRows[2].nativeElement);
            dropPoint = UIInteractions.getPointFromElement(dropAreaElement);
            pointerDownEvent = UIInteractions.createPointerEvent('pointerdown', startPoint);
            pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', movePoint);
            pointerUpEvent = UIInteractions.createPointerEvent('pointerup', dropPoint);

            const dragCell = dragGrid.getCellByColumn(1, 'Downloads');
            const cacheValue = dragCell.value;
            const cellElement = dragCell.nativeElement;
            let cellInput = null;

            spyOn(dragGrid, 'endEdit').and.callThrough();

            cellElement.dispatchEvent(new Event('focus'));
            fixture.detectChanges();

            cellElement.dispatchEvent(new Event('dblclick'));
            fixture.detectChanges();

            const newCellValue = 2000;
            cellInput = cellElement.querySelector('[igxinput]');
            cellInput.value = newCellValue;
            cellInput.dispatchEvent(new Event('input'));
            fixture.detectChanges();
            expect(row.inEditMode).toBeTruthy();
            expect(dragCell.editMode).toEqual(true);

            rowDragDirective.onPointerDown(pointerDownEvent);
            rowDragDirective.onPointerMove(pointerMoveEvent);
            expect(row.dragging).toBeTruthy();
            expect(row.grid.rowDragging).toBeTruthy();
            expect(dragGrid.endEdit).toHaveBeenCalled();
            expect(row.inEditMode).toBeFalsy();
            expect(dragCell.editMode).toEqual(false);

            pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', dropPoint);
            rowDragDirective.onPointerMove(pointerMoveEvent);
            rowDragDirective.onPointerUp(pointerUpEvent);
            fixture.detectChanges();
            expect(row.dragging).toBeFalsy();
            expect(row.grid.rowDragging).toBeFalsy();

            const dropCell = dropGrid.getCellByColumn(0, 'Downloads');
            expect(dropCell.value).toEqual(cacheValue);
            expect(dragCell.value).toEqual(cacheValue);
        });
    });
});

describe('Row Drag Tests #hGrid', () => {
    let fixture: ComponentFixture<any>;
    let dropAreaElement: Element;
    let dragIndicatorElements: DebugElement[];
    let dragIndicatorElement: Element;
    let rowDragDirective: IgxRowDragDirective;
    let startPoint: Point;
    let movePoint: Point;
    let dropPoint: Point;
    let pointerDownEvent: PointerEvent;
    let pointerMoveEvent: PointerEvent;
    let pointerUpEvent: PointerEvent;
    let dragGrid: IgxHierarchicalGridComponent;
    let dragRows: DebugElement[];
    let pointerMoveToDropEvent: PointerEvent;
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxHierarchicalGridTestComponent,
                IgxHierarchicalGridCustomGhostTestComponent
            ],
            imports: [
                FormsModule,
                NoopAnimationsModule,
                IgxGridModule,
                IgxHierarchicalGridModule
            ]
        }).compileComponents();
    }));
    it('should be able to drag row on every hierarchical level', fakeAsync(/** height/width setter rAF */() => {
        fixture = TestBed.createComponent(IgxHierarchicalGridTestComponent);
        fixture.detectChanges();
        dragGrid = fixture.componentInstance.hDragGrid;
        dropAreaElement = fixture.debugElement.query(By.directive(IgxDropDirective)).nativeElement;
        dragIndicatorElements = fixture.debugElement.queryAll(By.css(CSS_CLASS_DRAG_INDICATOR));
        dragRows = fixture.debugElement.queryAll(By.directive(IgxRowDragDirective));

        // first level row
        let rowToDrag = dragGrid.getRowByIndex(0);
        dragIndicatorElement = rowToDrag.nativeElement.querySelector(CSS_CLASS_DRAG_INDICATOR);
        rowDragDirective = dragRows[0].injector.get(IgxRowDragDirective);

        startPoint = UIInteractions.getPointFromElement(dragIndicatorElement);
        movePoint = UIInteractions.getPointFromElement(dragGrid.getRowByIndex(3).nativeElement);
        dropPoint = UIInteractions.getPointFromElement(dropAreaElement);
        pointerDownEvent = UIInteractions.createPointerEvent('pointerdown', startPoint);
        pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', movePoint);
        pointerMoveToDropEvent = UIInteractions.createPointerEvent('pointermove', dropPoint);
        pointerUpEvent = UIInteractions.createPointerEvent('pointerup', dropPoint);

        spyOn(dragGrid.onRowDragStart, 'emit').and.callThrough();
        spyOn(dragGrid.onRowDragEnd, 'emit').and.callThrough();

        rowDragDirective.onPointerDown(pointerDownEvent);
        rowDragDirective.onPointerMove(pointerMoveEvent);
        verifyRowDragStartEvent(dragGrid, rowToDrag, rowDragDirective, 1);
        // pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', dropPoint);
        rowDragDirective.onPointerMove(pointerMoveToDropEvent);
        rowDragDirective.onPointerUp(pointerUpEvent);
        fixture.detectChanges();
        verifyRowDragEndEvent(dragGrid, rowToDrag, rowDragDirective, false, 1);

        // second level row
        const childGrid = dragGrid.hgridAPI.getChildGrids(false)[0];
        rowToDrag = childGrid.getRowByIndex(0);
        dragIndicatorElement = rowToDrag.nativeElement.querySelector(CSS_CLASS_DRAG_INDICATOR);
        rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);
        startPoint = UIInteractions.getPointFromElement(dragIndicatorElement);
        pointerDownEvent = UIInteractions.createPointerEvent('pointerdown', startPoint);

        spyOn(childGrid.onRowDragStart, 'emit').and.callThrough();
        spyOn(childGrid.onRowDragEnd, 'emit').and.callThrough();

        rowDragDirective.onPointerDown(pointerDownEvent);
        rowDragDirective.onPointerMove(pointerMoveEvent);
        verifyRowDragStartEvent(childGrid, rowToDrag, rowDragDirective, 1);
        rowDragDirective.onPointerMove(pointerMoveToDropEvent);
        rowDragDirective.onPointerUp(pointerUpEvent);
        fixture.detectChanges();
        verifyRowDragEndEvent(childGrid, rowToDrag, rowDragDirective, false, 1);

        // third level row
        const nestedChildGrid = childGrid.hgridAPI.getChildGrids(false)[0];
        rowToDrag = nestedChildGrid.getRowByIndex(0);
        dragIndicatorElement = rowToDrag.nativeElement.querySelector(CSS_CLASS_DRAG_INDICATOR);
        rowDragDirective = dragRows[2].injector.get(IgxRowDragDirective);
        startPoint = UIInteractions.getPointFromElement(dragIndicatorElement);
        pointerDownEvent = UIInteractions.createPointerEvent('pointerdown', startPoint);

        spyOn(nestedChildGrid.onRowDragStart, 'emit').and.callThrough();
        spyOn(nestedChildGrid.onRowDragEnd, 'emit').and.callThrough();

        rowDragDirective.onPointerDown(pointerDownEvent);
        rowDragDirective.onPointerMove(pointerMoveEvent);
        verifyRowDragStartEvent(nestedChildGrid, rowToDrag, rowDragDirective, 1);
        rowDragDirective.onPointerMove(pointerMoveToDropEvent);
        rowDragDirective.onPointerUp(pointerUpEvent);
        fixture.detectChanges();
        verifyRowDragEndEvent(nestedChildGrid, rowToDrag, rowDragDirective, false, 1);
    }));

    it('should correctly create custom ghost element', fakeAsync(/** height/width setter rAF */() => {
        fixture = TestBed.createComponent(IgxHierarchicalGridCustomGhostTestComponent);
        dragGrid = fixture.componentInstance.hDragGrid;
        fixture.detectChanges();
        dragIndicatorElements = fixture.debugElement.queryAll(By.css(CSS_CLASS_DRAG_INDICATOR));
        dragRows = fixture.debugElement.queryAll(By.directive(IgxRowDragDirective));

        // first level row
        let rowToDrag = dragGrid.getRowByIndex(0);
        dragIndicatorElement = rowToDrag.nativeElement.querySelector(CSS_CLASS_DRAG_INDICATOR);
        rowDragDirective = dragRows[0].injector.get(IgxRowDragDirective);

        startPoint = UIInteractions.getPointFromElement(dragIndicatorElement);
        movePoint = UIInteractions.getPointFromElement(dragGrid.getRowByIndex(3).nativeElement);
        dropPoint = UIInteractions.getPointFromElement(dropAreaElement);
        pointerDownEvent = UIInteractions.createPointerEvent('pointerdown', startPoint);
        pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', movePoint);
        pointerMoveToDropEvent = UIInteractions.createPointerEvent('pointermove', dropPoint);
        pointerUpEvent = UIInteractions.createPointerEvent('pointerup', dropPoint);

        rowDragDirective.onPointerDown(pointerDownEvent);
        rowDragDirective.onPointerMove(pointerMoveEvent);
        rowDragDirective.onPointerMove(pointerMoveToDropEvent);
        rowDragDirective.onPointerUp(pointerUpEvent);
        fixture.detectChanges();

        expect((rowDragDirective as any).ghostContext.data.ProductName).toEqual('Product: A0');
        expect((rowDragDirective as any).ghostContext.grid).toEqual(dragGrid);

        // second level row
        const childGrid = dragGrid.hgridAPI.getChildGrids(false)[0];
        rowToDrag = childGrid.getRowByIndex(0);
        dragIndicatorElement = rowToDrag.nativeElement.querySelector(CSS_CLASS_DRAG_INDICATOR);
        rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);
        startPoint = UIInteractions.getPointFromElement(dragIndicatorElement);
        pointerDownEvent = UIInteractions.createPointerEvent('pointerdown', startPoint);

        rowDragDirective.onPointerDown(pointerDownEvent);
        rowDragDirective.onPointerMove(pointerMoveEvent);
        rowDragDirective.onPointerMove(pointerMoveToDropEvent);
        rowDragDirective.onPointerUp(pointerUpEvent);
        fixture.detectChanges();

        expect((rowDragDirective as any).ghostContext.data.ProductName).toEqual('Product: A0');
        expect((rowDragDirective as any).ghostContext.data.ChildLevels).toEqual(2);
        expect((rowDragDirective as any).ghostContext.grid).toEqual(childGrid);
    }));
});

describe('Row Drag Tests #tGrid', () => {
    let fixture: ComponentFixture<any>;
    let dropAreaElement: Element;
    let dragIndicatorElements: DebugElement[];
    let dragIndicatorElement: Element;
    let rowDragDirective: IgxRowDragDirective;
    let startPoint: Point;
    let movePoint: Point;
    let dropPoint: Point;
    let pointerDownEvent: PointerEvent;
    let pointerMoveEvent: PointerEvent;
    let pointerUpEvent: PointerEvent;
    let dragGrid: IgxTreeGridComponent;
    let dragRows: DebugElement[];
    let pointerMoveToDropEvent: PointerEvent;
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTreeGridTestComponent
            ],
            imports: [
                FormsModule,
                NoopAnimationsModule,
                IgxGridModule,
                IgxTreeGridModule
            ]
        }).compileComponents();
    }));
    beforeEach(fakeAsync(() => {
        fixture = TestBed.createComponent(IgxTreeGridTestComponent);
        fixture.detectChanges();
        dragGrid = fixture.componentInstance.treeGrid;
        dropAreaElement = fixture.debugElement.query(By.directive(IgxDropDirective)).nativeElement;
        dragIndicatorElements = fixture.debugElement.queryAll(By.css(CSS_CLASS_DRAG_INDICATOR));
        dragRows = fixture.debugElement.queryAll(By.directive(IgxRowDragDirective));
    }));

    it('should be able to drag row on every hierarchical level', () => {
        // first level row
        dragIndicatorElement = dragIndicatorElements[1].nativeElement;
        let rowToDrag = dragGrid.getRowByIndex(0);
        rowDragDirective = dragRows[0].injector.get(IgxRowDragDirective);

        startPoint = UIInteractions.getPointFromElement(dragIndicatorElement);
        movePoint = UIInteractions.getPointFromElement(dragGrid.getRowByIndex(3).nativeElement);
        dropPoint = UIInteractions.getPointFromElement(dropAreaElement);
        pointerDownEvent = UIInteractions.createPointerEvent('pointerdown', startPoint);
        pointerMoveEvent = UIInteractions.createPointerEvent('pointermove', movePoint);
        pointerMoveToDropEvent = UIInteractions.createPointerEvent('pointermove', dropPoint);
        pointerUpEvent = UIInteractions.createPointerEvent('pointerup', dropPoint);

        spyOn(dragGrid.onRowDragStart, 'emit').and.callThrough();
        spyOn(dragGrid.onRowDragEnd, 'emit').and.callThrough();

        rowDragDirective.onPointerDown(pointerDownEvent);
        rowDragDirective.onPointerMove(pointerMoveEvent);
        verifyRowDragStartEvent(dragGrid, rowToDrag, rowDragDirective, 1);
        rowDragDirective.onPointerMove(pointerMoveToDropEvent);
        rowDragDirective.onPointerUp(pointerUpEvent);
        fixture.detectChanges();
        verifyRowDragEndEvent(dragGrid, rowToDrag, rowDragDirective, false, 1);

        // second level row
        dragIndicatorElement = dragIndicatorElements[2].nativeElement;
        rowToDrag = dragGrid.getRowByIndex(1);
        rowDragDirective = dragRows[1].injector.get(IgxRowDragDirective);
        startPoint = UIInteractions.getPointFromElement(dragIndicatorElement);
        pointerDownEvent = UIInteractions.createPointerEvent('pointerdown', startPoint);

        rowDragDirective.onPointerDown(pointerDownEvent);
        rowDragDirective.onPointerMove(pointerMoveEvent);
        verifyRowDragStartEvent(dragGrid, rowToDrag, rowDragDirective, 2);
        rowDragDirective.onPointerMove(pointerMoveToDropEvent);
        rowDragDirective.onPointerUp(pointerUpEvent);
        fixture.detectChanges();
        verifyRowDragEndEvent(dragGrid, rowToDrag, rowDragDirective, false, 2);

        // third level row
        dragIndicatorElement = dragIndicatorElements[3].nativeElement;
        rowToDrag = dragGrid.getRowByIndex(2);
        rowDragDirective = dragRows[2].injector.get(IgxRowDragDirective);
        startPoint = UIInteractions.getPointFromElement(dragIndicatorElement);
        pointerDownEvent = UIInteractions.createPointerEvent('pointerdown', startPoint);

        rowDragDirective.onPointerDown(pointerDownEvent);
        rowDragDirective.onPointerMove(pointerMoveEvent);
        verifyRowDragStartEvent(dragGrid, rowToDrag, rowDragDirective, 3);
        rowDragDirective.onPointerMove(pointerMoveToDropEvent);
        rowDragDirective.onPointerUp(pointerUpEvent);
        fixture.detectChanges();
        verifyRowDragEndEvent(dragGrid, rowToDrag, rowDragDirective, false, 3);
    });
});
@Component({
    template: `
        <igx-grid #grid
            [width]='width'
            [height]='height'
            primaryKey="ID"
            [data]="data"
            [autoGenerate]="true" (onColumnInit)="columnsCreated($event)" (onGroupingDone)="onGroupingDoneHandler($event)"
            [rowEditable]="true" [rowDraggable]="enableRowDraggable"
            >
        </igx-grid>
        <div #dropArea class="droppable-area" igxDrop (dropped)="onRowDrop($event)"
        [ngStyle]="{width:'100px', height:'100px', backgroundColor:'red'}">
        </div>
        <div #nonDroppableArea class="non-droppable-area"
        [ngStyle]="{width:'100px', height:'100px', backgroundColor:'yellow'}">
        </div>
    `
})
export class IgxGridRowDraggableComponent extends DataParent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public instance: IgxGridComponent;

    @ViewChild('dropArea', { read: IgxDropDirective, static: true })
    public dropArea: IgxDropDirective;

    public width = '800px';
    public height = null;

    public enableSorting = false;
    public enableFiltering = false;
    public enableResizing = false;
    public enableEditing = true;
    public enableGrouping = true;
    public enableRowEditing = true;
    public enableRowDraggable = true;
    public currentSortExpressions;

    public columnsCreated(column: IgxColumnComponent) {
        column.sortable = this.enableSorting;
        column.filterable = this.enableFiltering;
        column.resizable = this.enableResizing;
        column.editable = this.enableEditing;
        column.groupable = this.enableGrouping;
    }
    public onGroupingDoneHandler(sortExpr) {
        this.currentSortExpressions = sortExpr;
    }
    public onRowDrop(args) {
        args.cancel = true;
    }
}

@Component({
    template: `
        <igx-grid #grid
            [width]='width'
            [height]='height'
            primaryKey="ID"
            [data]="data"
            [autoGenerate]="true" (onColumnInit)="columnsCreated($event)" (onGroupingDone)="onGroupingDoneHandler($event)"
            [rowEditable]="true" [rowDraggable]="enableRowDraggable"
            >
            <ng-template let-data igxRowDragGhost>
                <div class="dragGhost">
                    <igx-icon></igx-icon>
                        Moving a row!
                </div>
            </ng-template>
        </igx-grid>
        <div #dropArea class="droppable-area" igxDrop (dropped)="onRowDrop($event)"
        [ngStyle]="{width:'100px', height:'100px', backgroundColor:'red'}">
        </div>
        <div #nonDroppableArea class="non-droppable-area"
        [ngStyle]="{width:'100px', height:'100px', backgroundColor:'yellow'}">
        </div>
    `
})
export class IgxGridRowCustomGhostDraggableComponent extends DataParent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public instance: IgxGridComponent;

    @ViewChild('dropArea', { read: IgxDropDirective, static: true })
    public dropArea: IgxDropDirective;

    public width = '800px';
    public height = null;

    public enableSorting = false;
    public enableFiltering = false;
    public enableResizing = false;
    public enableEditing = true;
    public enableGrouping = true;
    public enableRowEditing = true;
    public enableRowDraggable = true;
    public currentSortExpressions;

    public columnsCreated(column: IgxColumnComponent) {
        column.sortable = this.enableSorting;
        column.filterable = this.enableFiltering;
        column.resizable = this.enableResizing;
        column.editable = this.enableEditing;
        column.groupable = this.enableGrouping;
    }
    public onGroupingDoneHandler(sortExpr) {
        this.currentSortExpressions = sortExpr;
    }
    public onRowDrop(args) {
        args.cancel = true;
    }
}

@Component({
    template: `
        <igx-grid #dragGrid
            [width]="'800px'"
            [height]="'300px'"
            [data]="data"
            primaryKey="ID"
            [autoGenerate]="true" (onGroupingDone)="onGroupingDoneHandler($event)"
            [rowEditable]="true" [rowDraggable]="true"
            >
        </igx-grid>
        <div class="droppable-area" igxDrop (dropped)="onRowDrop($event)">
        <igx-grid #dropGrid [data]="newData" [primaryKey]="'ID'"
            [width]="'800px'" [height]="'300px'">
            <igx-column [field]="'Downloads'"></igx-column>
            <igx-column [field]="'ID'"></igx-column>
            <igx-column [field]="'ProductName'"></igx-column>
            <igx-column [field]="'ReleaseDate'"></igx-column>
            <igx-column [field]="'Released'"></igx-column>
        </igx-grid></div>
    `
})
export class IgxGridFeaturesRowDragComponent extends DataParent {
    @ViewChild('dragGrid', { read: IgxGridComponent, static: true })
    public dragGrid: IgxGridComponent;
    @ViewChild('dropGrid', { read: IgxGridComponent, static: true })
    public dropGrid: IgxGridComponent;
    newData = [];
    public currentSortExpressions;

    public onGroupingDoneHandler(sortExpr) {
        this.currentSortExpressions = sortExpr;
    }
    public onRowDrop(args) {
        args.cancel = true;
        this.dropGrid.addRow(args.dragData.rowData);
    }
}

@Component({
    template: `
    <igx-hierarchical-grid #hierarchicalDragGrid [data]="data"
     [autoGenerate]="true" [height]="'500px'" [width]="'1500px'"
      primaryKey="ID" [expandChildren]='true' [rowDraggable]="true">
        <igx-row-island [key]="'childData'" [expandChildren]='true' [autoGenerate]="true" [rowDraggable]="true" #rowIsland>
            <igx-row-island [key]="'childData2'" [autoGenerate]="true" [rowDraggable]="true" #rowIsland2 >
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>
    <div class="droppable-area" igxDrop (dropped)="onRowDrop($event)">
        <igx-hierarchical-grid #hierarchicalDropGrid [data]="newData" [primaryKey]="'ID'"
            [width]="'1500px'" [height]="'500px'">
            <igx-column [field]="'ID'"></igx-column>
            <igx-column [field]="'ChildLevels'"></igx-column>
            <igx-column [field]="'ProductName'"></igx-column>
            <igx-column [field]="'Col1'"></igx-column>
            <igx-column [field]="'Col2'"></igx-column>
            <igx-column [field]="'Col3'"></igx-column>
        </igx-hierarchical-grid>
        </div>`
})
export class IgxHierarchicalGridTestComponent {
    @ViewChild('hierarchicalDragGrid', { read: IgxHierarchicalGridComponent, static: true }) public hDragGrid: IgxHierarchicalGridComponent;
    @ViewChild('hierarchicalDropGrid', { read: IgxHierarchicalGridComponent, static: true }) public hDropGrid: IgxHierarchicalGridComponent;
    @ViewChild('rowIsland', { read: IgxRowIslandComponent, static: true }) public rowIsland: IgxRowIslandComponent;
    @ViewChild('rowIsland2', { read: IgxRowIslandComponent, static: true }) public rowIsland2: IgxRowIslandComponent;

    public data;
    newData = [];

    constructor() {
        this.data = SampleTestData.generateHGridData(2, 3);
    }
    public onRowDrop(args) {
        args.cancel = true;
        this.hDropGrid.addRow(args.dragData.rowData);
    }
}

@Component({
    template: `
    <igx-hierarchical-grid #hierarchicalDragGrid [data]="data"
     [autoGenerate]="true" [height]="'500px'" [width]="'1500px'"
      primaryKey="ID" [expandChildren]='true' [rowDraggable]="true">
        <igx-row-island [key]="'childData'" [expandChildren]='true' [autoGenerate]="true" [rowDraggable]="true" #rowIsland>
            <igx-row-island [key]="'childData2'" [autoGenerate]="true" [rowDraggable]="true" #rowIsland2 >
            </igx-row-island>
            <ng-template let-data igxRowDragGhost>
            <div>
                Moving {{data.ProductName}}!
            </div>
        </ng-template>
        </igx-row-island>
        <ng-template let-data igxRowDragGhost>
            <div>
                Moving {{data.ProductName}}!
            </div>
        </ng-template>
    </igx-hierarchical-grid>`
})
export class IgxHierarchicalGridCustomGhostTestComponent {
    @ViewChild('hierarchicalDragGrid', { read: IgxHierarchicalGridComponent, static: true }) public hDragGrid: IgxHierarchicalGridComponent;
    @ViewChild('rowIsland', { read: IgxRowIslandComponent, static: true }) public rowIsland: IgxRowIslandComponent;
    @ViewChild('rowIsland2', { read: IgxRowIslandComponent, static: true }) public rowIsland2: IgxRowIslandComponent;

    public data;
    newData = [];

    constructor() {
        this.data = SampleTestData.generateHGridData(2, 3);
    }
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" primaryKey="employeeID" foreignKey="PID" width="900px" height="500px" [rowDraggable]="true">
        <igx-column [field]="'employeeID'" dataType="number"></igx-column>
        <igx-column [field]="'firstName'"></igx-column>
        <igx-column [field]="'lastName'"></igx-column>
        <igx-column [field]="'Salary'" dataType="number" ></igx-column>
    </igx-tree-grid>
    <div class="droppable-area" igxDrop (dropped)="onRowDrop($event)">
    <igx-grid #dropGrid [data]="newData" [primaryKey]="'employeeID'"
        [width]="'900px'" [height]="'300px'">
        <igx-column [field]="'employeeID'" dataType="number"></igx-column>
        <igx-column [field]="'firstName'"></igx-column>
        <igx-column [field]="'lastName'"></igx-column>
        <igx-column [field]="'Salary'" dataType="number" ></igx-column>
    </igx-grid></div>
    `
})
export class IgxTreeGridTestComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    @ViewChild(IgxGridComponent, { static: true }) public dropGrid: IgxGridComponent;
    public data = SampleTestData.employeeScrollingData();
    newData = [];

    public onRowDrop(args) {
        args.cancel = true;
        this.dropGrid.addRow(args.dragData.rowData);
    }
}

/**
 * Move pointer to the provided point and calls pointerdown event over provided element
 *
 * @param element Element to fire event on
 * @param startPoint Point on which to move the pointer to
 * @param fixture Test's ComponentFixture
 * @returns Promise with reference to the generated event
 */
const pointerDown = async (element: Element, startPoint: Point, fixture: ComponentFixture<any>): Promise<PointerEvent> => {
    const pointerEvent = UIInteractions.simulatePointerEvent('pointerdown', element, startPoint.x, startPoint.y);
    await wait(DEBOUNCE_TIME);
    fixture.detectChanges();
    return pointerEvent;
};

/**
 * Move pointer to the provided point and calls pointermove event over provided element
 *
 * @param element Element to fire event on
 * @param startPoint Point on which to move the pointer to
 * @param fixture Test's ComponentFixture
 * @returns Promise with reference to the generated event
 */
const pointerMove = async (element: Element, startPoint: Point, fixture: ComponentFixture<any>): Promise<PointerEvent> => {
    const pointerEvent = UIInteractions.simulatePointerEvent('pointermove', element, startPoint.x, startPoint.y);
    await wait(DEBOUNCE_TIME);
    fixture.detectChanges();
    return pointerEvent;
};

/**
 * Move pointer to the provided point and calls pointerup event over provided element
 *
 * @param element Element to fire event on
 * @param startPoint Point on which to move the pointer to
 * @param fixture Test's ComponentFixture
 * @returns Promise with reference to the generated event
 */
const pointerUp = async (element: Element, startPoint: Point, fixture: ComponentFixture<any>): Promise<PointerEvent> => {
    const pointerEvent = UIInteractions.simulatePointerEvent('pointerup', element, startPoint.x, startPoint.y);
    await wait(DEBOUNCE_TIME);
    fixture.detectChanges();
    return pointerEvent;
};

/**
 * Verifies weather the onRowDragStart event has been emitted with the correct arguments
 *
 * @param grid IgxGrid from which a row is being dragged
 * @param dragRow Grid row which is being dragged
 * @param dragDirective IgxRowDragDirective of the dragged row
 * @param timesCalled The number of times the onRowDragStart event has been emitted. Defaults to 1.
 * @param cancel Indicates weather the onRowDragStart event is cancelled. Default value is false.
 */
const verifyRowDragStartEvent =(
    grid: IgxGridBaseDirective,
    dragRow: IgxRowDirective<any>,
    dragDirective: IgxRowDragDirective,
    timesCalled: number = 1,
    cancel = false) => {
    expect(grid.onRowDragStart.emit).toHaveBeenCalledTimes(timesCalled);
    expect(grid.onRowDragStart.emit).toHaveBeenCalledWith({
        dragData: dragRow,
        dragDirective,
        cancel,
        owner: grid
    });
};

/**
 * Verifies weather the onRowDragEnd event has been emitted with the correct arguments
 *
 * @param grid IgxGrid from which a row is being dragged
 * @param dragRow Grid row which is being dragged
 * @param dragDirective IgxRowDragDirective of the dragged row
 * @param timesCalled The number of times the onRowDragEnd event has been emitted. Defaults to 1.
 */
const verifyRowDragEndEvent = (
    grid: IgxGridBaseDirective,
    dragRow: IgxRowDirective<any>,
    dragDirective: IgxRowDragDirective,
    animations: boolean,
    timesCalled: number = 1) => {
    expect(grid.onRowDragEnd.emit).toHaveBeenCalledTimes(timesCalled);
    expect(grid.onRowDragEnd.emit).toHaveBeenCalledWith({
        dragDirective,
        dragData: dragRow,
        animation: animations,
        owner: grid
    });
};
