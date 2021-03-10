
import { TestBed, fakeAsync, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxTreeGridModule, IgxTreeGridComponent } from './public_api';
import { IgxTreeGridEditActionsComponent } from '../../test-utils/tree-grid-components.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxActionStripModule, IgxActionStripComponent } from '../../action-strip/public_api';
import { IgxTreeGridRowComponent } from './tree-grid-row.component';



describe('IgxTreeGrid - Add Row UI #tGrid', () => {
    configureTestSuite();
    let fix;
    let treeGrid: IgxTreeGridComponent;
    let actionStrip: IgxActionStripComponent;
    const endTransition = () => {
        // transition end needs to be simulated
        const animationElem = fix.nativeElement.querySelector('.igx-grid__tr--inner');
        const endEvent = new AnimationEvent('animationend');
        animationElem.dispatchEvent(endEvent);
  };
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTreeGridEditActionsComponent
            ],
            imports: [IgxTreeGridModule, NoopAnimationsModule, IgxActionStripModule]
        })
            .compileComponents();
    }));

    describe(' Basic', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxTreeGridEditActionsComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
            actionStrip = fix.componentInstance.actionStrip;
        }));

        it('should show action strip "add row" button only for root level rows.', () => {
            actionStrip.show(treeGrid.rowList.first);
            fix.detectChanges();

            const editActions = fix.debugElement.queryAll(By.css(`igx-grid-action-button`));
            expect(editActions.length).toBe(4);

            expect(editActions[1].componentInstance.iconName).toBe('add-row');
            expect(editActions[2].componentInstance.iconName).toBe('add-child');
        });

        it('should show action strip "add child" button for all rows.', () => {
            actionStrip.show(treeGrid.rowList.toArray()[1]);
            fix.detectChanges();

            const editActions = fix.debugElement.queryAll(By.css(`igx-grid-action-button`));
            expect(editActions.length).toBe(3);
            expect(editActions[1].componentInstance.iconName).toBe('add-child');
        });

        it('should allow adding child to row via the UI.', () => {
            const row = treeGrid.rowList.toArray()[1];
            actionStrip.show(row);
            fix.detectChanges();

            expect(treeGrid.rowList.length).toBe(8);

            const editActions = fix.debugElement.queryAll(By.css(`igx-grid-action-button`));
            expect(editActions[1].componentInstance.iconName).toBe('add-child');
            const addChildBtn = editActions[1].componentInstance;
            addChildBtn.actionClick.emit();
            fix.detectChanges();
            endTransition();

            const addRow = treeGrid.getRowByIndex(2);
            expect(addRow.addRow).toBeTrue();

            treeGrid.endEdit(true);
            fix.detectChanges();

            expect(treeGrid.rowList.length).toBe(9);
            const addedRow = treeGrid.getRowByIndex(4);
            expect(addedRow.rowData.Name).toBe(undefined);

        });

        it('should be able to enter add row mode through the exposed API method - beginAddChild', () => {
            const row = treeGrid.rowList.toArray()[1] as IgxTreeGridRowComponent;
            row.beginAddChild();
            fix.detectChanges();
            const addRow = treeGrid.getRowByIndex(2);
            expect(addRow.addRow).toBeTrue();
        });

        it('should allow adding sibling to child row via the API.', () => {
            const row = treeGrid.rowList.toArray()[2] as IgxTreeGridRowComponent;
            // adds row as sibling
            row.beginAddRow();
            fix.detectChanges();
            endTransition();

            treeGrid.endEdit(true);
            fix.detectChanges();

            // check row is added as sibling
            expect(treeGrid.rowList.length).toBe(9);
            const addedRow = treeGrid.rowList.toArray()[4] as IgxTreeGridRowComponent;
            expect(addedRow.rowData.Name).toBe(undefined);
            // should have same parent record.
            expect(addedRow.treeRow.parent).toBe(row.treeRow.parent);
        });

        it('should allow adding row to empty grid', () => {
            treeGrid.data = [];
            fix.detectChanges();

            expect(treeGrid.rowList.length).toBe(0);

            // begin add row for empty grid
            treeGrid.beginAddRowByIndex(null, -1);
            fix.detectChanges();
            endTransition();

            treeGrid.endEdit(true);
            fix.detectChanges();

            expect(treeGrid.rowList.length).toBe(1);
        });
    });
});
