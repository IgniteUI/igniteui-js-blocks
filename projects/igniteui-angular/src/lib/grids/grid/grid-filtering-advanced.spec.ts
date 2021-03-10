import { waitForAsync, fakeAsync, TestBed, tick, flush, ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule } from './public_api';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import {
    IgxNumberFilteringOperand,
    IgxStringFilteringOperand
} from '../../data-operations/filtering-condition';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { FilteringLogic } from '../../data-operations/filtering-expression.interface';
import {
    IgxGridAdvancedFilteringColumnGroupComponent,
    IgxGridAdvancedFilteringComponent,
    IgxGridExternalAdvancedFilteringComponent,
    IgxGridAdvancedFilteringBindingComponent
} from '../../test-utils/grid-samples.spec';
import { ControlsFunction } from '../../test-utils/controls-functions.spec';
import { FormattedValuesFilteringStrategy } from '../../data-operations/filtering-strategy';
import { IgxHierGridExternalAdvancedFilteringComponent } from '../../test-utils/hierarchical-grid-components.spec';
import { IgxHierarchicalGridModule, IgxHierarchicalGridComponent } from '../hierarchical-grid/public_api';

const ADVANCED_FILTERING_OPERATOR_LINE_AND_CSS_CLASS = 'igx-filter-tree__line--and';
const ADVANCED_FILTERING_OPERATOR_LINE_OR_CSS_CLASS = 'igx-filter-tree__line--or';
const ADVANCED_FILTERING_OPERATOR_LINE_SELECTED_CSS_CLASS = 'igx-filter-tree__line--selected';
const ADVANCED_FILTERING_TOOLBAR_BUTTON_FILTERED_CSS_CLASS = 'igx-grid-toolbar__adv-filter--filtered';
const ADVANCED_FILTERING_EXPRESSION_ITEM_CLASS = 'igx-filter-tree__expression-item';
const CHIP_SELECT_CLASS = '.igx-chip__select';
const CHIP_SELECT_HIDDEN_CLASS = '.igx-chip__select--hidden';

describe('IgxGrid - Advanced Filtering #grid - ', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxGridAdvancedFilteringColumnGroupComponent,
                IgxGridAdvancedFilteringComponent,
                IgxGridExternalAdvancedFilteringComponent,
                IgxGridAdvancedFilteringBindingComponent,
                IgxHierGridExternalAdvancedFilteringComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxGridModule,
                IgxHierarchicalGridModule]
        }).compileComponents();
    }));

    describe('General tests - ', () => {
        let fix: ComponentFixture<IgxGridAdvancedFilteringComponent>;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridAdvancedFilteringComponent);
            grid = fix.componentInstance.grid;
            fix.detectChanges();
        }));

        it('Should show/hide Advanced Filtering button in toolbar based on respective input.', fakeAsync(() => {
            // Verify Advanced Filtering button in toolbar is visible.
            let advFilterButton = GridFunctions.getAdvancedFilteringButton(fix);
            expect(advFilterButton !== null && advFilterButton !== undefined).toBe(true, 'Adv.Filter button is not visible.');

            grid.allowAdvancedFiltering = false;
            fix.detectChanges();

            // Verify Advanced Filtering button in toolbar is not visible.
            advFilterButton = GridFunctions.getAdvancedFilteringButton(fix);
            expect(advFilterButton !== null && advFilterButton !== undefined).toBe(false, 'Adv.Filter button is visible.');

            grid.allowAdvancedFiltering = true;
            fix.detectChanges();

            // Verify Advanced Filtering button in toolbar is visible.
            advFilterButton = GridFunctions.getAdvancedFilteringButton(fix);
            expect(advFilterButton !== null && advFilterButton !== undefined).toBe(true, 'Adv.Filter button is not visible.');
        }));

        it('Should correctly initialize the Advanced Filtering dialog.', fakeAsync(() => {
            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Verify AF dialog is opened.
            expect(GridFunctions.getAdvancedFilteringComponent(fix)).not.toBeNull();

            // Verify there are not filters present and that the default text is shown.
            expect(grid.advancedFilteringExpressionsTree).toBeUndefined();
            expect(GridFunctions.getAdvancedFilteringTreeRootGroup(fix)).toBeNull();
            expect(GridFunctions.getAdvancedFilteringEmptyPrompt(fix)).not.toBeNull();

            // Close Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringCancelButton(fix);
            tick(200);
            fix.detectChanges();

            // Verify AF dialog is closed.
            expect(GridFunctions.getAdvancedFilteringComponent(fix)).toBeNull();
        }));

        it('Should open/close Advanced Filtering dialog through API.', fakeAsync(() => {
            // Open dialog through API.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Verify AF dialog is opened.
            expect(GridFunctions.getAdvancedFilteringComponent(fix)).not.toBeNull();

            // Close dialog through API.
            grid.closeAdvancedFilteringDialog(false);
            tick(100);
            fix.detectChanges();

            // Verify AF dialog is closed.
            expect(GridFunctions.getAdvancedFilteringComponent(fix)).toBeNull();
        }));

        it('Should close Advanced Filtering dialog through API by respecting \'applyChanges\' argument.', fakeAsync(() => {
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Click the initial 'Add And Group' button.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Populate edit inputs.
            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            selectOperatorInEditModeExpression(fix, 2); // Select 'Starts With' operator.
            let input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'ign', fix); // Type filter value.

            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Close dialog through API.
            grid.closeAdvancedFilteringDialog(true);
            tick(100);
            fix.detectChanges();

            // Verify AF dialog is closed.
            expect(GridFunctions.getAdvancedFilteringComponent(fix)).toBeNull();
            // Verify the filter changes are applied.
            expect(grid.filteredData.length).toEqual(2);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('Ignite UI for Angular');

            // Open the dialog again.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Double-click the existing chip to enter edit mode.
            GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [0], true);
            tick(50);
            fix.detectChanges();
            // Edit the filter value.
            input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'some non-existing value', fix); // Type filter value.
            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Close dialog through API.
            grid.closeAdvancedFilteringDialog(false);
            tick(100);
            fix.detectChanges();

            // Verify AF dialog is closed.
            expect(GridFunctions.getAdvancedFilteringComponent(fix)).toBeNull();
            // Verify the filter changes are NOT applied.
            expect(grid.filteredData.length).toEqual(2);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('Ignite UI for Angular');
        }));

        it('Should show/hide initial adding buttons depending on the existence of groups.', fakeAsync(() => {
            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Verify that the initial buttons are visible.
            expect(GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix).length).toBe(2);

            // Click the initial 'Add And Group' button.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Verify that the initial buttons are not visible.
            expect(GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix).length).toBe(0);

            // Discard the new group and verify that the initial buttons are visible.
            GridFunctions.clickAdvancedFilteringExpressionCloseButton(fix);
            expect(GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix).length).toBe(2);

            // Click the initial 'Add Or Group' button.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 1);
            tick(100);
            fix.detectChanges();

            // Verify that the initial buttons are not visible.
            expect(GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix).length).toBe(0);
        }));

        it('Should correctly initialize a newly added \'And\' group.', fakeAsync(() => {
            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Click the initial 'Add And Group' button.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Verify there is a new root group, which is empty.
            const group = GridFunctions.getAdvancedFilteringTreeRootGroup(fix);
            expect(group).not.toBeNull('There is no root group.');
            expect(GridFunctions.getAdvancedFilteringTreeChildItems(group).length).toBe(0, 'The group has children.');

            // Verify the operator line of the root group is an 'And' line.
            verifyOperatorLine(GridFunctions.getAdvancedFilteringTreeRootGroupOperatorLine(fix), 'and');

            // Verify the enabled/disabled state of each input of the expression in edit mode.
            verifyEditModeExpressionInputStates(fix, true, false, false, false);

            // Verify the edit inputs are empty.
            verifyEditModeExpressionInputValues(fix, '', '', '');

            // Verify adding buttons are disabled.
            const buttons = GridFunctions.getAdvancedFilteringTreeRootGroupButtons(fix, 0);
            for (const button of buttons) {
                ControlsFunction.verifyButtonIsDisabled(button);
            }
        }));

        it('Should correctly initialize a newly added \'Or\' group.', fakeAsync(() => {
            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Click the initial 'Add Or Group' button.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 1);
            tick(100);
            fix.detectChanges();

            // Verify there is a new root group, which is empty.
            const group = GridFunctions.getAdvancedFilteringTreeRootGroup(fix);
            expect(group).not.toBeNull('There is no root group.');
            expect(GridFunctions.getAdvancedFilteringTreeChildItems(group).length).toBe(0, 'The group has children.');

            // Verify the operator line of the root group is an 'Or' line.
            verifyOperatorLine(GridFunctions.getAdvancedFilteringTreeRootGroupOperatorLine(fix), 'or');

            // Verify the enabled/disabled state of each input of the expression in edit mode.
            verifyEditModeExpressionInputStates(fix, true, false, false, false);

            // Verify the edit inputs are empty.
            verifyEditModeExpressionInputValues(fix, '', '', '');

            // Verify adding buttons are disabled.
            const buttons = GridFunctions.getAdvancedFilteringTreeRootGroupButtons(fix, 0);
            for (const button of buttons) {
                ControlsFunction.verifyButtonIsDisabled(button);
            }
        }));

        it('Should add a new group through initial adding button and filter by it.', fakeAsync(() => {
            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Click the initial 'Add And Group' button.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Verify the enabled/disabled state of each input of the expression in edit mode.
            verifyEditModeExpressionInputStates(fix, true, false, false, false);

            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            verifyEditModeExpressionInputStates(fix, true, true, false, false);

            selectOperatorInEditModeExpression(fix, 2); // Select 'Starts With' operator.
            verifyEditModeExpressionInputStates(fix, true, true, true, false);

            const input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'ign', fix); // Type filter value.
            verifyEditModeExpressionInputStates(fix, true, true, true, true);

            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Verify the new expression has been added to the group.
            const group = GridFunctions.getAdvancedFilteringTreeRootGroup(fix);
            expect(GridFunctions.getAdvancedFilteringTreeChildExpressions(group).length).toBe(1, 'Incorrect children count.');

            // Apply the filters.
            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            fix.detectChanges();

            // Verify the filter results.
            expect(grid.filteredData.length).toEqual(2);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('Ignite UI for Angular');
        }));

        it('Should update the Advanced Filtering button in toolbar when (filtering)/(clear filtering).',
        fakeAsync(() => {
            // Verify that the advanced filtering button indicates there are no filters.
            let advFilterBtn = GridFunctions.getAdvancedFilteringButton(fix);
            expect(advFilterBtn.classList.contains(ADVANCED_FILTERING_TOOLBAR_BUTTON_FILTERED_CSS_CLASS))
                .toBe(false, 'Button indicates there is active filtering.');

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Click the initial 'Add And Group' button.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Populate edit inputs.
            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.
            const input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'angular', fix); // Type filter value.
            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Apply the filters.
            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            fix.detectChanges();

            // Verify that the advanced filtering button indicates there are filters.
            advFilterBtn = GridFunctions.getAdvancedFilteringButton(fix);
            expect(advFilterBtn.classList.contains(ADVANCED_FILTERING_TOOLBAR_BUTTON_FILTERED_CSS_CLASS))
                .toBe(true, 'Button indicates there is no active filtering.');

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Clear the filters.
            GridFunctions.clickAdvancedFilteringClearFilterButton(fix);
            fix.detectChanges();

            // Close the dialog.
            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            fix.detectChanges();

            // Verify that the advanced filtering button indicates there are no filters.
            advFilterBtn = GridFunctions.getAdvancedFilteringButton(fix);
            expect(advFilterBtn.classList.contains(ADVANCED_FILTERING_TOOLBAR_BUTTON_FILTERED_CSS_CLASS))
                .toBe(false, 'Button indicates there is active filtering.');
        }));

        it('Should correctly display header name in select dropdown and in chip expression.', fakeAsync(() => {
            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Click the initial 'Add And Group' button.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Open column dropdown and verify header name is displayed for first item
            GridFunctions.clickAdvancedFilteringColumnSelect(fix);
            fix.detectChanges();
            const dropdownItems = GridFunctions.getAdvancedFilteringSelectDropdownItems(fix);
            expect(dropdownItems[0].innerText).toBe('HeaderID');

            selectColumnInEditModeExpression(fix, 0); // Select 'HeaderID' column
            selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.
            const input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'a', fix); // Type filter value.

            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Verify header name in chip text
            verifyExpressionChipContent(fix, [0], 'HeaderID', 'Contains', 'a');

            // Apply the filters.
            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            fix.detectChanges();

            // Close Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringCancelButton(fix);
            tick(100);
            fix.detectChanges();

            // Open Advanced Filtering dialog again.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Verify header name in chip text
            verifyExpressionChipContent(fix, [0], 'HeaderID', 'Contains', 'a');
        }));

        it('Should correctly filter by a \'string\' column through UI.', fakeAsync(() => {
            // Test prerequisites
            grid.height = '800px';
            fix.detectChanges();
            tick(50);

            // Verify no filters are present.
            expect(grid.filteredData).toBeNull();
            expect(grid.rowList.length).toBe(8);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('NetAdvantage');

            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Click the initial 'Add And Group' button.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            selectOperatorInEditModeExpression(fix, 2); // Select 'Starts With' operator.
            const input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'ign', fix); // Type filter value.

            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Apply the filters.
            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            fix.detectChanges();

            // Verify the filter results.
            expect(grid.filteredData.length).toEqual(2);
            expect(grid.rowList.length).toBe(2);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('Ignite UI for Angular');
        }));

        it('Should correctly filter by a \'Greater Than\' with \'number\' column through UI.', fakeAsync(() => {
            // Test prerequisites
            grid.height = '800px';
            fix.detectChanges();
            tick(50);

            // Verify no filters are present.
            expect(grid.filteredData).toBeNull();
            expect(grid.rowList.length).toBe(8);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('NetAdvantage');

            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Click the initial 'Add And Group' button.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            selectColumnInEditModeExpression(fix, 2); // Select 'Downloads' column.
            selectOperatorInEditModeExpression(fix, 2); // Select 'Greater Than' operator.
            const input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, '20', fix); // Type filter value.

            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Apply the filters.
            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            fix.detectChanges();

            // Verify the filter results.
            expect(grid.filteredData.length).toEqual(5);
            expect(grid.rowList.length).toBe(5);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('NetAdvantage');
        }));

        it('Should correctly filter by a \'Equals\' with \'number\' column through UI.', fakeAsync(() => {
            // Test prerequisites
            grid.height = '800px';
            fix.detectChanges();
            tick(50);

            // Verify no filters are present.
            expect(grid.filteredData).toBeNull();
            expect(grid.rowList.length).toBe(8);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('NetAdvantage');

            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Click the initial 'Add And Group' button.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            selectColumnInEditModeExpression(fix, 2); // Select 'Downloads' column.
            selectOperatorInEditModeExpression(fix, 0); // Select 'Equals' operator.
            const input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, '127', fix); // Type filter value.

            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Apply the filters.
            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            fix.detectChanges();

            // Verify the filter results.
            expect(grid.filteredData.length).toEqual(1);
            expect(grid.rowList.length).toBe(1);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('NetAdvantage');
        }));

        it('Should correctly filter by a \'boolean\' column through UI.', fakeAsync(() => {
            // Test prerequisites
            grid.height = '800px';
            fix.detectChanges();
            tick(50);

            // Verify no filters are present.
            expect(grid.filteredData).toBeNull();
            expect(grid.rowList.length).toBe(8);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('NetAdvantage');

            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Click the initial 'Add And Group' button.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            selectColumnInEditModeExpression(fix, 3); // Select 'Released' column.
            selectOperatorInEditModeExpression(fix, 1); // Select 'True' operator.
            verifyEditModeExpressionInputStates(fix, true, true, false, true); // Third input should be disabled for unary operators.

            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Apply the filters.
            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            fix.detectChanges();

            // Verify the filter results.
            expect(grid.filteredData.length).toEqual(3);
            expect(grid.rowList.length).toBe(3);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('NetAdvantage');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe(null);
        }));

        it('Should correctly filter by a \'date\' column through UI with unary operator.', fakeAsync(() => {
            // Test prerequisites
            grid.height = '800px';
            fix.detectChanges();
            tick(50);

            // Verify no filters are present.
            expect(grid.filteredData).toBeNull();
            expect(grid.rowList.length).toBe(8);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('NetAdvantage');

            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Click the initial 'Add And Group' button.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            selectColumnInEditModeExpression(fix, 4); // Select 'ReleaseDate' column.
            selectOperatorInEditModeExpression(fix, 9); // Select 'This Year' operator.
            verifyEditModeExpressionInputStates(fix, true, true, false, true); // Third input should be disabled for unary operators.
            const input = GridFunctions.getAdvancedFilteringValueInput(fix, true);
            input.click();
            fix.detectChanges();

            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Apply the filters.
            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            fix.detectChanges();

            // Verify the filter results.
            const expectedData = fix.componentInstance.data.filter(r =>
                r.ReleaseDate && r.ReleaseDate.getFullYear() === (new Date()).getFullYear());
            expect(grid.filteredData.length).toEqual(expectedData.length);
            expect(grid.rowList.length).toBe(expectedData.length);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe(expectedData[0].ProductName);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe(expectedData[1].ProductName);
        }));

        it('Should correctly filter by a \'date\' column through UI with value from calendar.', fakeAsync(() => {
            // Test prerequisites
            grid.height = '800px';
            fix.detectChanges();
            tick(50);

            // Verify no filters are present.
            expect(grid.filteredData).toBeNull();
            expect(grid.rowList.length).toBe(8);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('NetAdvantage');

            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Click the initial 'Add And Group' button.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            selectColumnInEditModeExpression(fix, 4); // Select 'ReleaseDate' column.
            selectOperatorInEditModeExpression(fix, 0); // Select 'Equals' operator.
            verifyEditModeExpressionInputStates(fix, true, true, true, false);
            const input = GridFunctions.getAdvancedFilteringValueInput(fix, true);
            input.click();
            fix.detectChanges();

            // Click on 'today' item in calendar.
            const calendar = GridFunctions.getAdvancedFilteringCalendar(fix);
            const todayItem = calendar.querySelector('.igx-calendar__date--current');
            todayItem.click();
            tick(100);
            fix.detectChanges();

            verifyEditModeExpressionInputStates(fix, true, true, true, true);

            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Apply the filters.
            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            fix.detectChanges();

            // Verify the filter results.
            expect(grid.filteredData.length).toEqual(1);
            expect(grid.rowList.length).toBe(1);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 0).value.toString()).toBe('8');
        }));

        it('Should emit the onFilteringDone event when applying filters.', fakeAsync(() => {
            spyOn(grid.onFilteringDone, 'emit');

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Click the initial 'Add And Group' button.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Populate edit inputs.
            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            selectOperatorInEditModeExpression(fix, 2); // Select 'Starts With' operator.
            const input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'ign', fix); // Type filter value.

            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Apply the filters.
            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            tick(100);
            fix.detectChanges();

            expect(grid.onFilteringDone.emit).toHaveBeenCalledWith(grid.advancedFilteringExpressionsTree);
        }));

        it('Applying/Clearing filter through the API should correctly update the UI.', fakeAsync(() => {
            // Test prerequisites
            grid.height = '800px';
            fix.detectChanges();
            tick(50);

            // Verify the initial state of the grid and that no filters are present.
            expect(grid.filteredData).toBeNull();
            expect(grid.rowList.length).toBe(8);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('NetAdvantage');

            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.And);
            tree.filteringOperands.push({
                fieldName: 'Downloads', searchVal: 100, condition: IgxNumberFilteringOperand.instance().condition('greaterThan')
            });
            const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            tree.filteringOperands.push(orTree);
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Verify the state of the grid after filtering.
            expect(grid.filteredData.length).toBe(2);
            expect(grid.rowList.length).toBe(2);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('Some other item with Script');

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Verfiy there is a root group with 'And' operator line and 2 children.
            const rootGroup = GridFunctions.getAdvancedFilteringTreeRootGroup(fix);
            expect(rootGroup).not.toBeNull();
            verifyOperatorLine(GridFunctions.getAdvancedFilteringTreeRootGroupOperatorLine(fix), 'and');
            expect(GridFunctions.getAdvancedFilteringTreeChildItems(rootGroup).length).toBe(2);

            // Verify the contnet of the first child (expression) of the root group.
            verifyExpressionChipContent(fix, [0], 'Downloads', 'Greater Than', '100');

            // Verify the content of the second child (group) of the root group.
            const group = GridFunctions.getAdvancedFilteringTreeItem(fix, [1]);
            expect(GridFunctions.getAdvancedFilteringTreeChildItems(group, false).length).toBe(2);
            verifyExpressionChipContent(fix, [1, 0], 'ProductName', 'Contains', 'angular');
            verifyExpressionChipContent(fix, [1, 1], 'ProductName', 'Contains', 'script');
            // Verify the operator line of the child group.
            verifyOperatorLine(GridFunctions.getAdvancedFilteringTreeGroupOperatorLine(fix, [1]), 'or');

            // Close Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringCancelButton(fix);
            tick(100);
            fix.detectChanges();

            // Clear filters through API.
            grid.advancedFilteringExpressionsTree = null;
            fix.detectChanges();

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Verify there are not filters present and that the default text is shown.
            expect(grid.advancedFilteringExpressionsTree).toBeNull();
            expect(GridFunctions.getAdvancedFilteringTreeRootGroup(fix)).toBeNull();
            expect(GridFunctions.getAdvancedFilteringEmptyPrompt(fix)).not.toBeNull();
        }));

        it('Applying/Clearing filter through the UI should correctly update the API.', fakeAsync(() => {
            // Test prerequisites
            grid.height = '800px';
            fix.detectChanges();
            tick(50);

            // Verify the initial state of the grid and that no filters are present.
            expect(grid.advancedFilteringExpressionsTree).toBeUndefined();
            expect(grid.filteredData).toBeNull();
            expect(grid.rowList.length).toBe(8);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('NetAdvantage');

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Add a root 'and' group.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Populate edit inputs.
            selectColumnInEditModeExpression(fix, 2); // Select 'Downloads' column.
            selectOperatorInEditModeExpression(fix, 2); // Select 'Greater Than' operator.
            let input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, '100', fix); // Type filter value.
            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Add a child 'or' group.
            const addOrGroupBtn = GridFunctions.getAdvancedFilteringTreeRootGroupButtons(fix, 0)[2];
            addOrGroupBtn.click();
            tick(100);
            fix.detectChanges();

            // Populate edit inputs.
            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.
            input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'angular', fix); // Type filter value.
            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Add new expression to the child group.
            const addExpressionBtn = GridFunctions.getAdvancedFilteringTreeGroupButtons(fix, [1], 0)[0];
            addExpressionBtn.click();
            tick(100);
            fix.detectChanges();

            // Populate edit inputs.
            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.
            input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'script', fix); // Type filter value.
            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Apply the filters.
            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            tick(100);
            fix.detectChanges();

            // Verify the state of the grid after the filtering.
            expect(grid.advancedFilteringExpressionsTree !== null && grid.advancedFilteringExpressionsTree !== undefined).toBe(true);
            expect(grid.filteredData.length).toBe(2);
            expect(grid.rowList.length).toBe(2);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('Some other item with Script');

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            tick(100);
            fix.detectChanges();

            // Clear the filters.
            GridFunctions.clickAdvancedFilteringClearFilterButton(fix);
            tick(100);
            fix.detectChanges();

            // Verify that no filters are present.
            expect(grid.advancedFilteringExpressionsTree).toBeNull();
            expect(grid.filteredData).toBeNull();
            expect(grid.rowList.length).toBe(8);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('NetAdvantage');
        }));

        it('Should discard the newly added group when clicking the \'close\' button of its initial condition.', fakeAsync(() => {
            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Click the initial 'Add And Group' button.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Verify there is a new group and the initial buttons are not visible.
            expect(GridFunctions.getAdvancedFilteringTreeRootGroup(fix)).not.toBeNull();
            expect(GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix).length).toBe(0);

            // Populate edit inputs
            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            selectOperatorInEditModeExpression(fix, 2); // Select 'Starts With' operator.
            const input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'ign', fix); // Type filter value.

            // Discard the populated expression, so the whole new group gets discarded.
            GridFunctions.clickAdvancedFilteringExpressionCloseButton(fix);
            fix.detectChanges();

            // Verify there are no groups in the dialog and the initial buttons are visible.
            expect(GridFunctions.getAdvancedFilteringTreeRootGroup(fix)).toBeNull();
            expect(GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix).length).toBe(2);
        }));

        it('Column dropdown should contain only filterable columns.', fakeAsync(() => {
            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Make the 'Downloads', 'Released' and 'ReleaseDate' columns non-filterable.
            grid.getColumnByName('Downloads').filterable = false;
            grid.getColumnByName('Released').filterable = false;
            grid.getColumnByName('ReleaseDate').filterable = false;
            grid.cdr.detectChanges();
            tick(100);

            // Click the initial 'Add and Group' button.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Open column dropdown and verify that only filterable columns are present.
            GridFunctions.clickAdvancedFilteringColumnSelect(fix);
            fix.detectChanges();
            const dropdownItems = GridFunctions.getAdvancedFilteringSelectDropdownItems(fix);
            expect(dropdownItems.length).toBe(3);
            expect(dropdownItems[0].innerText).toBe('HeaderID');
            expect(dropdownItems[1].innerText).toBe('ProductName');
            expect(dropdownItems[2].innerText).toBe('Another Field');
        }));

        it('Operator dropdown should contain operators based on the column\'s datatype (\'string\' or \'number\').', fakeAsync(() => {
            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Add a new group.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Select 'string' type column ('ProductName').
            selectColumnInEditModeExpression(fix, 1);
            // Open the operator dropdown and verify they are 'string' specific.
            GridFunctions.clickAdvancedFilteringOperatorSelect(fix);
            fix.detectChanges();
            let dropdownValues: string[] = GridFunctions.getAdvancedFilteringSelectDropdownItems(fix).map((x: any) => x.innerText);
            let expectedValues = ['Contains', 'Does Not Contain', 'Starts With', 'Ends With', 'Equals',
                                  'Does Not Equal', 'Empty', 'Not Empty', 'Null', 'Not Null'];
            expect(dropdownValues).toEqual(expectedValues);

            // Close current dropdown by a random select.
            GridFunctions.clickAdvancedFilteringSelectDropdownItem(fix, 0);
            tick();
            fix.detectChanges();

            // Select 'number' type column ('Downloads').
            selectColumnInEditModeExpression(fix, 2);
            // Open the operator dropdown and verify they are 'number' specific.
            GridFunctions.clickAdvancedFilteringOperatorSelect(fix);
            fix.detectChanges();
            dropdownValues = GridFunctions.getAdvancedFilteringSelectDropdownItems(fix).map((x: any) => x.innerText);
            expectedValues = ['Equals', 'Does Not Equal', 'Greater Than', 'Less Than', 'Greater Than Or Equal To',
                              'Less Than Or Equal To', 'Empty', 'Not Empty', 'Null', 'Not Null'];
            expect(dropdownValues).toEqual(expectedValues);
        }));

        it('Operator dropdown should contain operators based on the column\'s datatype (\'date\' or \'boolean\').', fakeAsync(() => {
            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Add a new group.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Select 'date' type column ('ReleaseDate').
            selectColumnInEditModeExpression(fix, 4);
            // Open the operator dropdown and verify they are 'date' specific.
            GridFunctions.clickAdvancedFilteringOperatorSelect(fix);
            fix.detectChanges();
            let dropdownValues: string[] = GridFunctions.getAdvancedFilteringSelectDropdownItems(fix).map((x: any) => x.innerText);
            let expectedValues = ['Equals', 'Does Not Equal', 'Before', 'After', 'Today', 'Yesterday',
                                  'This Month', 'Last Month', 'Next Month', 'This Year', 'Last Year',
                                  'Next Year', 'Empty', 'Not Empty', 'Null', 'Not Null'];
            expect(dropdownValues).toEqual(expectedValues);

            // Close current dropdown by a random select.
            GridFunctions.clickAdvancedFilteringSelectDropdownItem(fix, 0);
            tick();
            fix.detectChanges();

            // Select 'boolean' type column ('Released').
            selectColumnInEditModeExpression(fix, 3);
            // Open the operator dropdown and verify they are 'boolean' specific.
            GridFunctions.clickAdvancedFilteringOperatorSelect(fix);
            fix.detectChanges();
            dropdownValues = GridFunctions.getAdvancedFilteringSelectDropdownItems(fix).map((x: any) => x.innerText);
            expectedValues = ['All', 'True', 'False', 'Empty', 'Not Empty', 'Null', 'Not Null'];
            expect(dropdownValues).toEqual(expectedValues);
        }));

        it('Should not commit and close currently edited condition when the \'close\' button is clicked.', fakeAsync(() => {
            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.And);
            tree.filteringOperands.push({
                fieldName: 'Downloads', searchVal: 100, condition: IgxNumberFilteringOperand.instance().condition('greaterThan')
            });
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            verifyExpressionChipContent(fix, [0], 'Downloads', 'Greater Than', '100');

            // Edit the first expression in the inner 'or' group.
            GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [0], true); // Double-click the chip
            tick(200);
            fix.detectChanges();
            const input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, '500', fix); // Type filter value.

            // Verify the edit mode container is visible.
            expect(GridFunctions.getAdvancedFilteringEditModeContainer(fix)).not.toBeNull();

            // Close the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCloseButton(fix);
            fix.detectChanges();

            // Verify the edit mode container is no longer visible.
            expect(GridFunctions.getAdvancedFilteringEditModeContainer(fix)).toBeNull();

            verifyExpressionChipContent(fix, [0], 'Downloads', 'Greater Than', '100');
        }));

        it('Should scroll the adding buttons into view when the add icon of a chip is clicked.', fakeAsync(() => {
            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.Or);
            for (let index = 0; index < 30; index++) {
                tree.filteringOperands.push({
                    fieldName: 'Downloads', searchVal: index, condition: IgxNumberFilteringOperand.instance().condition('equals')
                });
            }
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Scroll to the top.
            const exprContainer = GridFunctions.getAdvancedFilteringExpressionsContainer(fix);
            tick(50);
            exprContainer.scrollTop = 0;

            // Hover the last visible expression chip
            const expressionItem = fix.nativeElement.querySelectorAll(`.${ADVANCED_FILTERING_EXPRESSION_ITEM_CLASS}`)[9];
            expressionItem.dispatchEvent(new MouseEvent('mouseenter'));
            tick();

            // Click the add icon to display the adding buttons.
            GridFunctions.clickAdvancedFilteringTreeExpressionChipAddIcon(fix, [9]);
            tick(50);

            // Verify the adding buttons are in view.
            const addingButtons = GridFunctions.getAdvancedFilteringTreeRootGroupButtons(fix, 0);
            for (const addingButton of addingButtons) {
                verifyElementIsInExpressionsContainerView(fix, addingButton);
            }
        }));

        it('Should scroll the newly added expression into view when the respective add button is clicked.', fakeAsync(() => {
            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.Or);
            for (let index = 0; index < 30; index++) {
                tree.filteringOperands.push({
                    fieldName: 'Downloads', searchVal: index, condition: IgxNumberFilteringOperand.instance().condition('equals')
                });
            }
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Scroll to the top.
            const exprContainer = GridFunctions.getAdvancedFilteringExpressionsContainer(fix);
            tick(50);
            exprContainer.scrollTop = 0;

            // Hover the previous to last visible expression chip.
            const expressionItem = fix.nativeElement.querySelectorAll(`.${ADVANCED_FILTERING_EXPRESSION_ITEM_CLASS}`)[8];
            expressionItem.dispatchEvent(new MouseEvent('mouseenter'));
            tick();

            // Click the add icon to display the adding buttons.
            GridFunctions.clickAdvancedFilteringTreeExpressionChipAddIcon(fix, [8]);
            tick(50);

            // Click the 'add condition' button.
            const addCondButton = GridFunctions.getAdvancedFilteringTreeRootGroupButtons(fix, 0)[0];
            addCondButton.click();
            fix.detectChanges();

            // Verify the edit mode container (the one with the editing inputs) is in view.
            verifyElementIsInExpressionsContainerView(fix, GridFunctions.getAdvancedFilteringEditModeContainer(fix));
        }));

        it('Should scroll to the expression when entering its edit mode.', fakeAsync(() => {
            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.Or);
            for (let index = 0; index < 30; index++) {
                tree.filteringOperands.push({
                    fieldName: 'Downloads', searchVal: index, condition: IgxNumberFilteringOperand.instance().condition('equals')
                });
            }
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Scroll to the top.
            const exprContainer = GridFunctions.getAdvancedFilteringExpressionsContainer(fix);
            tick(50);
            exprContainer.scrollTop = 0;

            // Hover the last visible expression chip
            const expressionItem = fix.nativeElement.querySelectorAll(`.${ADVANCED_FILTERING_EXPRESSION_ITEM_CLASS}`)[9];
            expressionItem.dispatchEvent(new MouseEvent('mouseenter'));
            tick();

            // Click the edit icon to enter edit mode of the expression.
            GridFunctions.clickAdvancedFilteringTreeExpressionChipEditIcon(fix, [9]);
            tick(50);

            // Verify the edit mode container (the one with the editing inputs) is in view.
            verifyElementIsInExpressionsContainerView(fix, GridFunctions.getAdvancedFilteringEditModeContainer(fix));
        }));

        it('Should keep the context menu in view when scrolling the expressions container.', fakeAsync(() => {
            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.Or);
            for (let index = 0; index < 20; index++) {
                tree.filteringOperands.push({
                    fieldName: 'Downloads', searchVal: index, condition: IgxNumberFilteringOperand.instance().condition('equals')
                });
            }
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Scroll to the top.
            const exprContainer = GridFunctions.getAdvancedFilteringExpressionsContainer(fix);
            tick(50);
            exprContainer.scrollTop = 0;

            // Select the first two chips.
            GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [0]);
            GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [1]);
            tick(200);

            // Simulate end of chip selection animation
            const chipSelectHidden = fix.nativeElement.querySelector(CHIP_SELECT_HIDDEN_CLASS);
            const transitionEvent = new TransitionEvent('transitionend', {
                propertyName: 'width'
            });
            chipSelectHidden.dispatchEvent(transitionEvent);

            // Scroll to the bottom.
            exprContainer.scrollTop = exprContainer.scrollHeight;

            // Verify that the context menu is correctly repositioned and in view.
            const contextMenu = GridFunctions.getAdvancedFilteringContextMenu(fix);
            verifyElementIsInExpressionsContainerView(fix, contextMenu);
        }));

        it('Should clear all conditions and groups when the \'clear filter\' button is clicked.', fakeAsync(() => {
            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.And);
            tree.filteringOperands.push({
                fieldName: 'Downloads', searchVal: 100, condition: IgxNumberFilteringOperand.instance().condition('greaterThan')
            });
            const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            tree.filteringOperands.push(orTree);
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Verify there are filters in the dialog.
            expect(GridFunctions.getAdvancedFilteringTreeRootGroup(fix)).not.toBeNull();
            expect(GridFunctions.getAdvancedFilteringEmptyPrompt(fix)).toBeNull();

            // Clear the filters.
            GridFunctions.clickAdvancedFilteringClearFilterButton(fix);
            tick(100);
            fix.detectChanges();

            // Verify there are no filters in the dialog.
            expect(GridFunctions.getAdvancedFilteringTreeRootGroup(fix)).toBeNull();
            expect(GridFunctions.getAdvancedFilteringEmptyPrompt(fix)).not.toBeNull();
        }));

        it('Should keep edited conditions and groups inside AF dialog when applying and opening it again.',
        fakeAsync(() => {
            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.And);
            tree.filteringOperands.push({
                fieldName: 'Downloads', searchVal: 100, condition: IgxNumberFilteringOperand.instance().condition('greaterThan')
            });
            const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            tree.filteringOperands.push(orTree);
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Verify the current filter state.
            expect(grid.filteredData.length).toBe(2);
            expect(grid.rowList.length).toBe(2);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('Some other item with Script');

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Verify the content of the first expression in the inner 'or' group.
            verifyExpressionChipContent(fix, [1, 0], 'ProductName', 'Contains', 'angular');

            // Edit the first expression in the inner 'or' group.
            GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [1, 0], true); // Double-click the chip
            tick(200);
            fix.detectChanges();
            const input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'a', fix); // Type filter value.

            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Apply the filters.
            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            tick(100);
            fix.detectChanges();

            // Verify the new current filter state.
            expect(grid.filteredData.length).toBe(3);
            expect(grid.rowList.length).toBe(3);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('NetAdvantage');

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Verify the content of the first expression in the inner 'or' group.
            verifyExpressionChipContent(fix, [1, 0], 'ProductName', 'Contains', 'a');
        }));

        it('Should not keep changes over edited conditions and groups inside AF dialog when canceling and opening it again.',
        fakeAsync(() => {
            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.And);
            tree.filteringOperands.push({
                fieldName: 'Downloads', searchVal: 100, condition: IgxNumberFilteringOperand.instance().condition('greaterThan')
            });
            const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            tree.filteringOperands.push(orTree);
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Verify the current filter state.
            expect(grid.filteredData.length).toBe(2);
            expect(grid.rowList.length).toBe(2);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('Some other item with Script');

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Verify the content of the first expression in the inner 'or' group.
            verifyExpressionChipContent(fix, [1, 0], 'ProductName', 'Contains', 'angular');

            // Edit the first expression in the inner 'or' group.
            GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [1, 0], true); // Double-click the chip
            tick(200);
            fix.detectChanges();
            const input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'a', fix); // Type filter value.

            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Cancel the filters.
            GridFunctions.clickAdvancedFilteringCancelButton(fix);
            tick(100);
            fix.detectChanges();

            // Verify the new filter state remains unchanged.
            expect(grid.filteredData.length).toBe(2);
            expect(grid.rowList.length).toBe(2);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('Some other item with Script');

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Verify the content of the first expression in the inner 'or' group.
            verifyExpressionChipContent(fix, [1, 0], 'ProductName', 'Contains', 'angular');
        }));

        it('Should not close the AF dialog when clicking outside of it.', fakeAsync(() => {
            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Verify that the Advanced Filtering dialog is opened.
            expect(GridFunctions.getAdvancedFilteringComponent(fix)).not.toBeNull('Advanced Filtering dialog is not opened.');

            grid.nativeElement.click();
            tick(200);
            fix.detectChanges();

            // Verify that the Advanced Filtering dialog remains opened.
            expect(GridFunctions.getAdvancedFilteringComponent(fix)).not.toBeNull('Advanced Filtering dialog is not opened.');
        }));

        it('Should display the adding buttons and the cancel button when trying to add a new condition/group to existing group.',
        fakeAsync(() => {
            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.And);
            const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            tree.filteringOperands.push(orTree);
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Select a chip from the child group.
            GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [0, 0]);
            tick(200);
            fix.detectChanges();
            // Click the add icon to display the adding buttons.
            GridFunctions.clickAdvancedFilteringTreeExpressionChipAddIcon(fix, [0, 0]);
            fix.detectChanges();

            // Verify the adding buttons and cancel button are visible and enabled.
            const buttons = GridFunctions.getAdvancedFilteringTreeGroupButtons(fix, [0], 0);
            expect(buttons.length).toBe(4);
            for (const button of buttons) {
                ControlsFunction.verifyButtonIsDisabled(button, false);
            }

            // Click the cancel button to hide the buttons.
            const cancelButton = buttons[3];
            cancelButton.click();
            fix.detectChanges();

            // Verify the adding buttons and cancel button are no longer visible.
            const group = GridFunctions.getAdvancedFilteringTreeItem(fix, [0]);
            const childrenContainer = group.querySelector('.igx-filter-tree__expression');
            const buttonsContainers = childrenContainer.querySelectorAll(':scope > .igx-filter-tree__buttons');
            expect(buttonsContainers.length).toBe(0, 'Adding buttons are visible.');
        }));

        it('Should add a new condition to existing group by using add buttons.', fakeAsync(() => {
            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.And);
            const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            tree.filteringOperands.push(orTree);
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Verify group's children count before adding a new child.
            let group = GridFunctions.getAdvancedFilteringTreeItem(fix, [0]);
            let groupDirectChildren = GridFunctions.getAdvancedFilteringTreeChildItems(group);
            expect(groupDirectChildren.length).toBe(2, 'incorrect direct children count of inner group');

            //  Select chip from group and click the add button.
            GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [0, 0]);
            tick(200);
            fix.detectChanges();
            GridFunctions.clickAdvancedFilteringTreeExpressionChipAddIcon(fix, [0, 0]);
            fix.detectChanges();

            // Add new 'expression'.
            const buttons = GridFunctions.getAdvancedFilteringTreeGroupButtons(fix, [0], 0);
            buttons[0].click();
            fix.detectChanges();

            // Populate edit inputs.
            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.
            const input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'some value', fix); // Type filter value.
            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Verify group's children count before adding a new child.
            group = GridFunctions.getAdvancedFilteringTreeItem(fix, [0]);
            groupDirectChildren = GridFunctions.getAdvancedFilteringTreeChildItems(group);
            expect(groupDirectChildren.length).toBe(3, 'incorrect direct children count of inner group');
        }));

        it('Should add a new group to existing group by using add buttons.', fakeAsync(() => {
            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.And);
            const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            tree.filteringOperands.push(orTree);
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Verify group's children count before adding a new child.
            let group = GridFunctions.getAdvancedFilteringTreeItem(fix, [0]);
            expect(GridFunctions.getAdvancedFilteringTreeChildItems(group, true).length).toBe(2,
                'incorrect direct children count of group with path [0]');
            expect(GridFunctions.getAdvancedFilteringTreeChildItems(group, false).length).toBe(2,
                'incorrect all children count of group with path [0]');

            //  Select chip from group and click the add button.
            GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [0, 0]);
            tick(200);
            fix.detectChanges();
            GridFunctions.clickAdvancedFilteringTreeExpressionChipAddIcon(fix, [0, 0]);
            fix.detectChanges();

            // Add new 'and group'.
            let buttons = GridFunctions.getAdvancedFilteringTreeGroupButtons(fix, [0], 0);
            buttons[1].click();
            fix.detectChanges();

            // Populate edit inputs.
            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.
            let input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'some value', fix); // Type filter value.
            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Add new 'expression' to the newly added group.
            buttons = GridFunctions.getAdvancedFilteringTreeGroupButtons(fix, [0, 1], 0);
            buttons[0].click();
            fix.detectChanges();

            // Populate edit inputs.
            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.
            input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'another value', fix); // Type filter value.
            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // End the newly added group.
            buttons = GridFunctions.getAdvancedFilteringTreeGroupButtons(fix, [0, 1], 0);
            buttons[3].click();
            fix.detectChanges();

            // Verify group's children count before adding a new child.
            group = GridFunctions.getAdvancedFilteringTreeItem(fix, [0]);
            expect(GridFunctions.getAdvancedFilteringTreeChildItems(group, true).length).toBe(3,
                'incorrect direct children count of group with path [0]');
            expect(GridFunctions.getAdvancedFilteringTreeChildItems(group, false).length).toBe(5,
                'incorrect all children count of group with path [0]');
        }));

        it('Should remove a condition from an existing group by using delete icon of respective chip.', fakeAsync(() => {
            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.And);
            tree.filteringOperands.push({
                fieldName: 'Downloads', searchVal: 100, condition: IgxNumberFilteringOperand.instance().condition('greaterThan')
            });
            const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            tree.filteringOperands.push(orTree);
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Verify tree layout before deleting chips.
            let rootGroup = GridFunctions.getAdvancedFilteringTreeRootGroup(fix);
            expect(GridFunctions.getAdvancedFilteringTreeChildItems(rootGroup, true).length).toBe(2);
            expect(GridFunctions.getAdvancedFilteringTreeChildItems(rootGroup, false).length).toBe(4);

            // Delete a chip and verify layout.
            GridFunctions.clickAdvancedFilteringTreeExpressionChipRemoveIcon(fix, [0]);
            tick(100);
            fix.detectChanges();

            rootGroup = GridFunctions.getAdvancedFilteringTreeRootGroup(fix);
            expect(GridFunctions.getAdvancedFilteringTreeChildItems(rootGroup, true).length).toBe(1);
            expect(GridFunctions.getAdvancedFilteringTreeChildItems(rootGroup, false).length).toBe(3);

            // Delete a chip and verify layout.
            GridFunctions.clickAdvancedFilteringTreeExpressionChipRemoveIcon(fix, [0, 1]);
            tick(100);
            flush();
            fix.detectChanges();
            rootGroup = GridFunctions.getAdvancedFilteringTreeRootGroup(fix);
            expect(GridFunctions.getAdvancedFilteringTreeChildItems(rootGroup, true).length).toBe(1);
            expect(GridFunctions.getAdvancedFilteringTreeChildItems(rootGroup, false).length).toBe(2);

            // Verify remaining chip's content.
            verifyExpressionChipContent(fix, [0, 0], 'ProductName', 'Contains', 'angular');
        }));

        it('Should select/deselect a condition when its respective chip is clicked.', fakeAsync(() => {
            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.Or);
            tree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            tree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Verify first chip is not selected.
            verifyExpressionChipSelection(fix, [0], false);

            // Click first chip and verify it is selected.
            GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [0]);
            tick(200);
            fix.detectChanges();
            verifyExpressionChipSelection(fix, [0], true);

            // Click first chip again and verify it is not selected.
            GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [0]);
            tick(200);
            fix.detectChanges();
            verifyExpressionChipSelection(fix, [0], false);
        }));

        it('Should display edit and add buttons when hovering a chip.', fakeAsync(() => {
            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.Or);
            tree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            tree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Verify actions container is not visible. (This container contains the 'edit' and the 'add' buttons.)
            expect(GridFunctions.getAdvancedFilteringTreeExpressionActionsContainer(fix, [0]))
                .toBeNull('actions container is visible');

            // Hover the first chip and verify actions container is visible.
            UIInteractions.hoverElement(GridFunctions.getAdvancedFilteringTreeItem(fix, [0]));
            tick(50);
            fix.detectChanges();
            expect(GridFunctions.getAdvancedFilteringTreeExpressionActionsContainer(fix, [0]))
                .not.toBeNull('actions container is not visible');

            // Unhover the first chip and verify actions container is not visible.
            UIInteractions.unhoverElement(GridFunctions.getAdvancedFilteringTreeItem(fix, [0]));
            tick(50);
            fix.detectChanges();
            expect(GridFunctions.getAdvancedFilteringTreeExpressionActionsContainer(fix, [0]))
                .toBeNull('actions container is visible');
        }));

        it('Should select/deselect all child conditions and groups when clicking a group\'s operator line.', fakeAsync(() => {
            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.And);
            tree.filteringOperands.push({
                fieldName: 'Downloads', searchVal: 100, condition: IgxNumberFilteringOperand.instance().condition('greaterThan')
            });
            const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            const andTree = new FilteringExpressionsTree(FilteringLogic.Or);
            andTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'a', condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            andTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 's', condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            orTree.filteringOperands.push(andTree);
            tree.filteringOperands.push(orTree);
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Click root group's operator line and verify that the root group and all of its children become selected.
            let rootOperatorLine = GridFunctions.getAdvancedFilteringTreeRootGroupOperatorLine(fix);
            rootOperatorLine.click();
            tick(200);
            fix.detectChanges();
            verifyChildrenSelection(GridFunctions.getAdvancedFilteringExpressionsContainer(fix), true);

            // Click root group's operator line again and verify that the root group and all of its children become unselected.
            rootOperatorLine = GridFunctions.getAdvancedFilteringTreeRootGroupOperatorLine(fix);
            rootOperatorLine.click();
            tick(200);
            fix.detectChanges();
            verifyChildrenSelection(GridFunctions.getAdvancedFilteringExpressionsContainer(fix), false);

            // Click an inner group's operator line and verify its children become selected.
            GridFunctions.clickAdvancedFilteringTreeGroupOperatorLine(fix, [1]);
            tick(200);
            fix.detectChanges();
            verifyChildrenSelection(GridFunctions.getAdvancedFilteringTreeItem(fix, [1]), true);

            // Click an inner group's operator line again and verify its children become unselected.
            GridFunctions.clickAdvancedFilteringTreeGroupOperatorLine(fix, [1]);
            tick(200);
            fix.detectChanges();
            verifyChildrenSelection(GridFunctions.getAdvancedFilteringTreeItem(fix, [1]), false);
        }));

        it('Should open the operator dropdown below its respective input-group.', fakeAsync(() => {
            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Add root group.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Add a new expression
            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.
            const input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'script', fix); // Type filter value.
            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Add another expression to root group.
            const btn = GridFunctions.getAdvancedFilteringTreeRootGroupButtons(fix, 0)[0];
            btn.click();
            tick(100);
            fix.detectChanges();

            // Populate column input.
            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.

            // Open the dropdown.
            GridFunctions.clickAdvancedFilteringOperatorSelect(fix);
            tick(50);
            fix.detectChanges();
            expect(GridFunctions.getAdvancedFilteringSelectDropdown(fix)).not.toBeNull('dropdown is not opened');

            // Close the dropdown.
            GridFunctions.clickAdvancedFilteringOperatorSelect(fix);
            tick(50);
            fix.detectChanges();
            expect(GridFunctions.getAdvancedFilteringSelectDropdown(fix)).toBeNull('dropdown is opened');

            // Open the operator dropdown again.
            GridFunctions.clickAdvancedFilteringOperatorSelect(fix);
            tick(50);
            fix.detectChanges();

            // Verify the operator dropdown is positioned below its respective input-group.
            const dropdown: HTMLElement = GridFunctions.getAdvancedFilteringSelectDropdown(fix);
            expect(GridFunctions.getAdvancedFilteringSelectDropdown(fix)).not.toBeNull('dropdown is not opened');

            const dropdownRect = dropdown.getBoundingClientRect();
            const inputGroup: HTMLElement = GridFunctions.getAdvancedFilteringOperatorSelect(fix).querySelector('igx-input-group');
            const inputGroupRect = inputGroup.getBoundingClientRect();
            const delta = 2;
            expect(Math.abs(dropdownRect.top - inputGroupRect.bottom) < delta).toBe(true,
                'incorrect vertical position of operator dropdown');
            expect(Math.abs(dropdownRect.left - inputGroupRect.left) < delta).toBe(true,
                'incorrect horizontal position of operator dropdown');
        }));

        it('Should filter by cells formatted data when using FormattedValuesFilteringStrategy', fakeAsync(() => {
            const formattedStrategy = new FormattedValuesFilteringStrategy(['Downloads']);
            grid.filterStrategy = formattedStrategy;
            const downloadsFormatter = (val: number): number => {
                if (!val || val > 0 && val < 100) {
                    return 1;
                } else if (val >= 100 && val < 500) {
                    return 2;
                } else {
                    return 3;
                }
            };
            grid.columns[2].formatter = downloadsFormatter;
            fix.detectChanges();

            grid.openAdvancedFilteringDialog();
            tick(200);
            fix.detectChanges();

            // Add root group.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Add a new expression
            selectColumnInEditModeExpression(fix, 2); // Select 'ProductName' column.
            selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.
            const input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, '1', fix); // Type filter value.

            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            tick(100);
            fix.detectChanges();
            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            tick(100);
            fix.detectChanges();

            const rows = GridFunctions.getRows(fix);
            expect(rows.length).toEqual(3, 'Wrong filtered rows count');
        }));

        describe('Context Menu - ', () => {
            it('Should discard added group when clicking its operator line without having a single expression.', fakeAsync(() => {
                // Open Advanced Filtering dialog.
                grid.openAdvancedFilteringDialog();
                fix.detectChanges();

                // Add initial 'and' group.
                GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
                tick(100);
                fix.detectChanges();

                // Click operator line.
                const rootOperatorLine = GridFunctions.getAdvancedFilteringTreeRootGroupOperatorLine(fix);
                rootOperatorLine.click();
                tick(200);
                fix.detectChanges();

                // Verify group is discarded and the context menu was not opened.
                expect(GridFunctions.getAdvancedFilteringTreeRootGroup(fix)).toBeNull('Group is not discarded.');
                verifyContextMenuVisibility(fix, false);
            }));

            it('Selecting multiple conditions should display the (create group)/(delete filters) context menu.', fakeAsync(() => {
                // Apply advanced filter through API.
                const tree = new FilteringExpressionsTree(FilteringLogic.And);
                tree.filteringOperands.push({
                    fieldName: 'Downloads', searchVal: 100, condition: IgxNumberFilteringOperand.instance().condition('greaterThan')
                });
                const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
                orTree.filteringOperands.push({
                    fieldName: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                    ignoreCase: true
                });
                orTree.filteringOperands.push({
                    fieldName: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
                    ignoreCase: true
                });
                tree.filteringOperands.push(orTree);
                grid.advancedFilteringExpressionsTree = tree;
                fix.detectChanges();

                // Open Advanced Filtering dialog.
                grid.openAdvancedFilteringDialog();
                fix.detectChanges();

                // Verify context menu is not visible.
                verifyContextMenuVisibility(fix, false);

                // Select two chips.
                GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [0]);
                GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [1, 1]);
                tick(200);

                 // Simulate end of chip selection animation
                 const chipSelectHidden = fix.nativeElement.querySelector(CHIP_SELECT_HIDDEN_CLASS);
                 const transitionEvent = new TransitionEvent('transitionend', {
                     propertyName: 'width'
                 });
                 chipSelectHidden.dispatchEvent(transitionEvent);

                // Verify context menu is visible.
                verifyContextMenuVisibility(fix, true);
                verifyContextMenuType(fix, false);

                // Unselect one of the two selected chips.
                GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [0]);
                tick(200);

                // Simulate end of chip selection animation
                const chipSelect = fix.nativeElement.querySelector(CHIP_SELECT_CLASS);
                chipSelect.dispatchEvent(transitionEvent);

                // Verify context menu is no longer visible.
                verifyContextMenuVisibility(fix, false);
            }));

            it('Should create an \'and\' group from multiple selected conditions when respective context menu button is clicked.',
            fakeAsync(() => {
                // Apply advanced filter through API.
                const tree = new FilteringExpressionsTree(FilteringLogic.And);
                tree.filteringOperands.push({
                    fieldName: 'Downloads', searchVal: 100, condition: IgxNumberFilteringOperand.instance().condition('greaterThan')
                });
                const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
                orTree.filteringOperands.push({
                    fieldName: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                    ignoreCase: true
                });
                orTree.filteringOperands.push({
                    fieldName: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
                    ignoreCase: true
                });
                tree.filteringOperands.push(orTree);
                grid.advancedFilteringExpressionsTree = tree;
                fix.detectChanges();

                // Open Advanced Filtering dialog.
                grid.openAdvancedFilteringDialog();
                fix.detectChanges();

                // Verify tree layout before the creation of a new group with context menu.
                let rootGroup = GridFunctions.getAdvancedFilteringTreeRootGroup(fix); // group
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(rootGroup, true).length).toBe(2);
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(rootGroup, false).length).toBe(4);

                let firstItem = GridFunctions.getAdvancedFilteringTreeItem(fix, [0]); // expression
                expect(firstItem.classList.contains(ADVANCED_FILTERING_EXPRESSION_ITEM_CLASS)).toBe(true);

                let secondItem = GridFunctions.getAdvancedFilteringTreeItem(fix, [1]); // group
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(secondItem, true).length).toBe(2);
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(secondItem, false).length).toBe(2);

                // Select two chips.
                GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [0]);
                GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [1, 1]);
                tick(200);

                // Click "Create And Group" in context menu.
                const buttons = GridFunctions.getAdvancedFilteringContextMenuButtons(fix);
                buttons[1].click();
                tick(100);
                fix.detectChanges();

                // Verify tree layout after the creation of a new group with context menu.
                rootGroup = GridFunctions.getAdvancedFilteringTreeRootGroup(fix); // group
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(rootGroup, true).length).toBe(2);
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(rootGroup, false).length).toBe(5);

                firstItem = GridFunctions.getAdvancedFilteringTreeItem(fix, [0]); // the new group
                verifyOperatorLine(GridFunctions.getAdvancedFilteringTreeGroupOperatorLine(fix, [0]), 'and');
                expect(firstItem.classList.contains(ADVANCED_FILTERING_EXPRESSION_ITEM_CLASS)).toBe(false);
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(firstItem, true).length).toBe(2);
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(firstItem, false).length).toBe(2);

                secondItem = GridFunctions.getAdvancedFilteringTreeItem(fix, [1]); // group
                verifyOperatorLine(GridFunctions.getAdvancedFilteringTreeGroupOperatorLine(fix, [1]), 'or');
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(secondItem, true).length).toBe(1);
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(secondItem, false).length).toBe(1);
            }));

            it('Should create an \'or\' group from multiple selected conditions when respective context menu button is clicked.',
            fakeAsync(() => {
                // Apply advanced filter through API.
                const tree = new FilteringExpressionsTree(FilteringLogic.And);
                tree.filteringOperands.push({
                    fieldName: 'Downloads', searchVal: 100, condition: IgxNumberFilteringOperand.instance().condition('greaterThan')
                });
                const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
                orTree.filteringOperands.push({
                    fieldName: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                    ignoreCase: true
                });
                orTree.filteringOperands.push({
                    fieldName: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
                    ignoreCase: true
                });
                tree.filteringOperands.push(orTree);
                grid.advancedFilteringExpressionsTree = tree;
                fix.detectChanges();

                // Open Advanced Filtering dialog.
                grid.openAdvancedFilteringDialog();
                fix.detectChanges();

                // Verify tree layout before the creation of a new group with context menu.
                let rootGroup = GridFunctions.getAdvancedFilteringTreeRootGroup(fix); // group
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(rootGroup, true).length).toBe(2);
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(rootGroup, false).length).toBe(4);

                let firstItem = GridFunctions.getAdvancedFilteringTreeItem(fix, [0]); // expression
                expect(firstItem.classList.contains(ADVANCED_FILTERING_EXPRESSION_ITEM_CLASS)).toBe(true);

                let secondItem = GridFunctions.getAdvancedFilteringTreeItem(fix, [1]); // group
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(secondItem, true).length).toBe(2);
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(secondItem, false).length).toBe(2);

                // Select two chips.
                GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [0]);
                GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [1, 1]);
                tick(200);

                // Click "Create Or Group" in context menu.
                const buttons = GridFunctions.getAdvancedFilteringContextMenuButtons(fix);
                buttons[2].click();
                tick(100);
                fix.detectChanges();

                // Verify tree layout after the creation of a new group with context menu.
                rootGroup = GridFunctions.getAdvancedFilteringTreeRootGroup(fix); // group
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(rootGroup, true).length).toBe(2);
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(rootGroup, false).length).toBe(5);

                firstItem = GridFunctions.getAdvancedFilteringTreeItem(fix, [0]); // the new group
                verifyOperatorLine(GridFunctions.getAdvancedFilteringTreeGroupOperatorLine(fix, [0]), 'or');
                expect(firstItem.classList.contains(ADVANCED_FILTERING_EXPRESSION_ITEM_CLASS)).toBe(false);
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(firstItem, true).length).toBe(2);
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(firstItem, false).length).toBe(2);

                secondItem = GridFunctions.getAdvancedFilteringTreeItem(fix, [1]); // group
                verifyOperatorLine(GridFunctions.getAdvancedFilteringTreeGroupOperatorLine(fix, [1]), 'or');
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(secondItem, true).length).toBe(1);
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(secondItem, false).length).toBe(1);
            }));

            it('Should delete all selected conditions when the \'delete filters\' option from context menu is clicked.',
            fakeAsync(() => {
                // Apply advanced filter through API.
                const tree = new FilteringExpressionsTree(FilteringLogic.And);
                tree.filteringOperands.push({
                    fieldName: 'Downloads', searchVal: 100, condition: IgxNumberFilteringOperand.instance().condition('greaterThan')
                });
                const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
                orTree.filteringOperands.push({
                    fieldName: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                    ignoreCase: true
                });
                orTree.filteringOperands.push({
                    fieldName: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
                    ignoreCase: true
                });
                tree.filteringOperands.push(orTree);
                grid.advancedFilteringExpressionsTree = tree;
                fix.detectChanges();

                // Open Advanced Filtering dialog.
                grid.openAdvancedFilteringDialog();
                fix.detectChanges();

                // Verify tree layout before the creation of a new group with context menu.
                let rootGroup = GridFunctions.getAdvancedFilteringTreeRootGroup(fix); // group
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(rootGroup, true).length).toBe(2);
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(rootGroup, false).length).toBe(4);

                let firstItem = GridFunctions.getAdvancedFilteringTreeItem(fix, [0]); // expression
                expect(firstItem.classList.contains(ADVANCED_FILTERING_EXPRESSION_ITEM_CLASS)).toBe(true);

                const secondItem = GridFunctions.getAdvancedFilteringTreeItem(fix, [1]); // group
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(secondItem, true).length).toBe(2);
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(secondItem, false).length).toBe(2);

                // Select two chips.
                GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [0]);
                GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [1, 1]);
                tick(200);

                // Click "Delete Filters" in context menu.
                const buttons = GridFunctions.getAdvancedFilteringContextMenuButtons(fix);
                buttons[3].click();
                tick(100);
                fix.detectChanges();

                // Verify tree layout after deleting some expressions with the context menu.
                rootGroup = GridFunctions.getAdvancedFilteringTreeRootGroup(fix); // group
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(rootGroup, true).length).toBe(1);
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(rootGroup, false).length).toBe(2);

                firstItem = GridFunctions.getAdvancedFilteringTreeItem(fix, [0]); // group
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(firstItem, true).length).toBe(1);
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(firstItem, false).length).toBe(1);
                verifyExpressionChipContent(fix, [0, 0], 'ProductName', 'Contains', 'angular');
            }));

            it('Should show/hide group\'s context menu when clicking its operator line.', fakeAsync(() => {
                // Apply advanced filter through API.
                const tree = new FilteringExpressionsTree(FilteringLogic.And);
                tree.filteringOperands.push({
                    fieldName: 'Downloads', searchVal: 100, condition: IgxNumberFilteringOperand.instance().condition('greaterThan')
                });
                const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
                orTree.filteringOperands.push({
                    fieldName: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                    ignoreCase: true
                });
                orTree.filteringOperands.push({
                    fieldName: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
                    ignoreCase: true
                });
                tree.filteringOperands.push(orTree);
                grid.advancedFilteringExpressionsTree = tree;
                fix.detectChanges();

                // Open Advanced Filtering dialog.
                grid.openAdvancedFilteringDialog();
                fix.detectChanges();

                // Verify context menu is not visible.
                verifyContextMenuVisibility(fix, false);

                // Click the innner group's operator line.
                const operatorLine = GridFunctions.getAdvancedFilteringTreeGroupOperatorLine(fix, [1]);
                operatorLine.click();

                // Simulate end of chip selection animation
                const chipSelectHidden = fix.nativeElement.querySelector(CHIP_SELECT_HIDDEN_CLASS);
                const transitionEvent = new TransitionEvent('transitionend', {
                    propertyName: 'width'
                });
                chipSelectHidden.dispatchEvent(transitionEvent);

                // Verify context menu is visible.
                verifyContextMenuVisibility(fix, true);
                verifyContextMenuType(fix, true);

                // Click the innner group's operator line again.
                operatorLine.click();
                tick();

                // Verify context menu is no longer visible.
                verifyContextMenuVisibility(fix, false);
            }));

            it('Should change the group\'s operator when using its context menu buttons.', fakeAsync(() => {
                // Apply advanced filter through API.
                const tree = new FilteringExpressionsTree(FilteringLogic.And);
                tree.filteringOperands.push({
                    fieldName: 'Downloads', searchVal: 100, condition: IgxNumberFilteringOperand.instance().condition('greaterThan')
                });
                const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
                orTree.filteringOperands.push({
                    fieldName: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                    ignoreCase: true
                });
                orTree.filteringOperands.push({
                    fieldName: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
                    ignoreCase: true
                });
                tree.filteringOperands.push(orTree);
                grid.advancedFilteringExpressionsTree = tree;
                fix.detectChanges();

                // Open Advanced Filtering dialog.
                grid.openAdvancedFilteringDialog();
                fix.detectChanges();

                // Verify current operator of inner group.
                let operatorLine = GridFunctions.getAdvancedFilteringTreeGroupOperatorLine(fix, [1]);
                verifyOperatorLine(operatorLine, 'or');

                // Click the innner group's operator line.
                operatorLine.click();
                tick(400);
                fix.detectChanges();

                // Click the 'and' button of the button group in the context menu.
                const buttonGroup = GridFunctions.getAdvancedFilteringContextMenuButtonGroup(fix);
                const andOperatorButton: any = Array.from(buttonGroup.querySelectorAll('.igx-button-group__item'))
                                                    .find((b: any) => b.textContent.toLowerCase() === 'and');
                andOperatorButton.click();
                fix.detectChanges();

                // Verify new operator of inner group.
                operatorLine = GridFunctions.getAdvancedFilteringTreeGroupOperatorLine(fix, [1]);
                verifyOperatorLine(operatorLine, 'and');

                // Click the 'or' button of the button group in the context menu.
                const orOperatorButton: any = Array.from(buttonGroup.querySelectorAll('.igx-button-group__item'))
                                                   .find((b: any) => b.textContent.toLowerCase() === 'or');
                orOperatorButton.click();
                fix.detectChanges();

                // Verify new operator of inner group.
                operatorLine = GridFunctions.getAdvancedFilteringTreeGroupOperatorLine(fix, [1]);
                verifyOperatorLine(operatorLine, 'or');
            }));

            it('Should ungroup the group\'s children and append them to next parent group when click \'ungroup\' from context menu.',
            fakeAsync(() => {
                // Apply advanced filter through API.
                const tree = new FilteringExpressionsTree(FilteringLogic.And);
                tree.filteringOperands.push({
                    fieldName: 'Downloads', searchVal: 100, condition: IgxNumberFilteringOperand.instance().condition('greaterThan')
                });
                const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
                orTree.filteringOperands.push({
                    fieldName: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                    ignoreCase: true
                });
                orTree.filteringOperands.push({
                    fieldName: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
                    ignoreCase: true
                });
                tree.filteringOperands.push(orTree);
                grid.advancedFilteringExpressionsTree = tree;
                fix.detectChanges();

                // Open Advanced Filtering dialog.
                grid.openAdvancedFilteringDialog();
                fix.detectChanges();

                // Verify tree layout before the the ungrouping with context menu.
                let rootGroup = GridFunctions.getAdvancedFilteringTreeRootGroup(fix); // group
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(rootGroup, true).length).toBe(2);
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(rootGroup, false).length).toBe(4);

                let firstItem = GridFunctions.getAdvancedFilteringTreeItem(fix, [0]); // expression
                expect(firstItem.classList.contains(ADVANCED_FILTERING_EXPRESSION_ITEM_CLASS)).toBe(true);

                const secondItem = GridFunctions.getAdvancedFilteringTreeItem(fix, [1]); // group
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(secondItem, true).length).toBe(2);
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(secondItem, false).length).toBe(2);

                // Click the innner group's operator line.
                const operatorLine = GridFunctions.getAdvancedFilteringTreeGroupOperatorLine(fix, [1]);
                operatorLine.click();
                tick(400);
                fix.detectChanges();

                // Click "Ungroup" in context menu.
                const buttons = GridFunctions.getAdvancedFilteringContextMenuButtons(fix);
                buttons[3].click();
                tick(100);
                fix.detectChanges();

                // Verify tree layout after ungrouping a group with the context menu.
                rootGroup = GridFunctions.getAdvancedFilteringTreeRootGroup(fix); // group
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(rootGroup, true).length).toBe(3);
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(rootGroup, false).length).toBe(3);
                // Verify three expression in the root group are what remains.
                for (let index = 0; index < 3; index++) {
                    firstItem = GridFunctions.getAdvancedFilteringTreeItem(fix, [index]); // expression
                    expect(firstItem.classList.contains(ADVANCED_FILTERING_EXPRESSION_ITEM_CLASS)).toBe(true);
                }
            }));

            it('Ungroup button of the root group\'s context menu should be disabled.',
            fakeAsync(() => {
                // Apply advanced filter through API.
                const tree = new FilteringExpressionsTree(FilteringLogic.And);
                tree.filteringOperands.push({
                    fieldName: 'Downloads', searchVal: 100, condition: IgxNumberFilteringOperand.instance().condition('greaterThan')
                });
                grid.advancedFilteringExpressionsTree = tree;
                fix.detectChanges();

                // Open Advanced Filtering dialog.
                grid.openAdvancedFilteringDialog();
                fix.detectChanges();

                // Click root group's operator line.
                const rootOperatorLine = GridFunctions.getAdvancedFilteringTreeRootGroupOperatorLine(fix);
                rootOperatorLine.click();
                tick(200);
                fix.detectChanges();

                // Verify the ungroup button is disabled.
                const ungroupButton = GridFunctions.getAdvancedFilteringContextMenuButtons(fix)[3];
                ControlsFunction.verifyButtonIsDisabled(ungroupButton);
            }));

            it('Should delete the group from the tree when click \'delete\' from context menu.',
            fakeAsync(() => {
                // Apply advanced filter through API.
                const tree = new FilteringExpressionsTree(FilteringLogic.And);
                tree.filteringOperands.push({
                    fieldName: 'Downloads', searchVal: 100, condition: IgxNumberFilteringOperand.instance().condition('greaterThan')
                });
                const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
                orTree.filteringOperands.push({
                    fieldName: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                    ignoreCase: true
                });
                orTree.filteringOperands.push({
                    fieldName: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
                    ignoreCase: true
                });
                tree.filteringOperands.push(orTree);
                grid.advancedFilteringExpressionsTree = tree;
                fix.detectChanges();

                // Open Advanced Filtering dialog.
                grid.openAdvancedFilteringDialog();
                fix.detectChanges();

                // Verify tree layout before deleting a group through context menu.
                let rootGroup = GridFunctions.getAdvancedFilteringTreeRootGroup(fix); // group
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(rootGroup, true).length).toBe(2);
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(rootGroup, false).length).toBe(4);

                let firstItem = GridFunctions.getAdvancedFilteringTreeItem(fix, [0]); // expression
                expect(firstItem.classList.contains(ADVANCED_FILTERING_EXPRESSION_ITEM_CLASS)).toBe(true);

                const secondItem = GridFunctions.getAdvancedFilteringTreeItem(fix, [1]); // group
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(secondItem, true).length).toBe(2);
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(secondItem, false).length).toBe(2);

                // Click the innner group's operator line.
                const operatorLine = GridFunctions.getAdvancedFilteringTreeGroupOperatorLine(fix, [1]);
                operatorLine.click();
                tick(400);
                fix.detectChanges();

                // Click "Delete" in context menu.
                const buttons = GridFunctions.getAdvancedFilteringContextMenuButtons(fix);
                buttons[4].click();
                tick(100);
                fix.detectChanges();

                // Verify tree layout after deleting a group through context menu.
                rootGroup = GridFunctions.getAdvancedFilteringTreeRootGroup(fix); // group
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(rootGroup, true).length).toBe(1);
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(rootGroup, false).length).toBe(1);

                firstItem = GridFunctions.getAdvancedFilteringTreeItem(fix, [0]); // expression
                expect(firstItem.classList.contains(ADVANCED_FILTERING_EXPRESSION_ITEM_CLASS)).toBe(true);
            }));

            it('Should close the context menu when clicking its close button.' , fakeAsync(() => {
                // Apply advanced filter through API.
                const tree = new FilteringExpressionsTree(FilteringLogic.Or);
                tree.filteringOperands.push({
                    fieldName: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                    ignoreCase: true
                });
                tree.filteringOperands.push({
                    fieldName: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
                    ignoreCase: true
                });
                grid.advancedFilteringExpressionsTree = tree;
                fix.detectChanges();

                // Open Advanced Filtering dialog.
                grid.openAdvancedFilteringDialog();
                fix.detectChanges();

                // Click root operator line to open the context menu.
                const rootOperatorLine = GridFunctions.getAdvancedFilteringTreeRootGroupOperatorLine(fix);
                rootOperatorLine.click();

                // Simulate end of chip selection animation
                const chipSelectHidden = fix.nativeElement.querySelector(CHIP_SELECT_HIDDEN_CLASS);
                const transitionEvent = new TransitionEvent('transitionend', {
                    propertyName: 'width'
                });
                chipSelectHidden.dispatchEvent(transitionEvent);

                // Verify context menu is opened.
                verifyContextMenuVisibility(fix, true);

                // Click close button of context menu.
                const buttons = GridFunctions.getAdvancedFilteringContextMenuButtons(fix);
                buttons[0].click();
                tick();

                // Verify context menu is closed.
                verifyContextMenuVisibility(fix, false);
            }));
        });

        describe('Keyboard Navigation/Interaction - ', () => {
            it('Should close the context menu when pressing \'Escape\' on it.' , fakeAsync(() => {
                // Apply advanced filter through API.
                const tree = new FilteringExpressionsTree(FilteringLogic.Or);
                tree.filteringOperands.push({
                    fieldName: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                    ignoreCase: true
                });
                tree.filteringOperands.push({
                    fieldName: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
                    ignoreCase: true
                });
                grid.advancedFilteringExpressionsTree = tree;
                fix.detectChanges();

                // Open Advanced Filtering dialog.
                grid.openAdvancedFilteringDialog();
                fix.detectChanges();

                // Click root operator line to open the context menu.
                const rootOperatorLine = GridFunctions.getAdvancedFilteringTreeRootGroupOperatorLine(fix);
                rootOperatorLine.click();

                // Simulate end of chip selection animation
                const chipSelectHidden = fix.nativeElement.querySelector(CHIP_SELECT_HIDDEN_CLASS);
                const transitionEvent = new TransitionEvent('transitionend', {
                    propertyName: 'width'
                });
                chipSelectHidden.dispatchEvent(transitionEvent);

                // Verify context menu is opened.
                verifyContextMenuVisibility(fix, true);

                // Press 'Escape' on the context menu.
                UIInteractions.triggerKeyDownEvtUponElem('Escape', GridFunctions.getAdvancedFilteringContextMenu(fix));
                tick();

                // Verify context menu is closed.
                verifyContextMenuVisibility(fix, false);
            }));

            it('Should select/deselect a condition when pressing \'Enter\' on its respective chip.' , fakeAsync(() => {
                // Apply advanced filter through API.
                const tree = new FilteringExpressionsTree(FilteringLogic.Or);
                tree.filteringOperands.push({
                    fieldName: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                    ignoreCase: true
                });
                tree.filteringOperands.push({
                    fieldName: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
                    ignoreCase: true
                });
                grid.advancedFilteringExpressionsTree = tree;
                fix.detectChanges();

                // Open Advanced Filtering dialog.
                grid.openAdvancedFilteringDialog();
                fix.detectChanges();

                // Verify first chip is not selected.
                verifyExpressionChipSelection(fix, [1], false);

                // Press 'Enter' on the second chip and verify it is selected.
                UIInteractions.triggerKeyDownEvtUponElem('Enter', GridFunctions.getAdvancedFilteringTreeExpressionChip(fix, [1]));
                tick(200);
                fix.detectChanges();
                verifyExpressionChipSelection(fix, [1], true);

                // Press 'Enter' on the second chip again and verify it is not selected.
                UIInteractions.triggerKeyDownEvtUponElem('Enter', GridFunctions.getAdvancedFilteringTreeExpressionChip(fix, [1]));
                tick(200);
                fix.detectChanges();
                verifyExpressionChipSelection(fix, [1], false);
            }));

            it('Should remove a chip in when pressing \'Enter\' on its \'remove\' icon.' , fakeAsync(() => {
                // Apply advanced filter through API.
                const tree = new FilteringExpressionsTree(FilteringLogic.Or);
                tree.filteringOperands.push({
                    fieldName: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                    ignoreCase: true
                });
                tree.filteringOperands.push({
                    fieldName: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
                    ignoreCase: true
                });
                grid.advancedFilteringExpressionsTree = tree;
                fix.detectChanges();

                // Open Advanced Filtering dialog.
                grid.openAdvancedFilteringDialog();
                fix.detectChanges();

                // Verify the there are two chip expressions.
                let rootGroup = GridFunctions.getAdvancedFilteringTreeRootGroup(fix);
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(rootGroup, false).length).toBe(2);
                expect(GridFunctions.getAdvancedFilteringTreeChildExpressions(rootGroup, true).length).toBe(2);

                // Press 'Enter' on the remove icon of the second chip.
                const chip = GridFunctions.getAdvancedFilteringTreeExpressionChip(fix, [1]);
                const removeIcon = ControlsFunction.getChipRemoveButton(chip);
                UIInteractions.triggerKeyDownEvtUponElem('Enter', removeIcon);
                  tick(200);
                fix.detectChanges();

                // Verify the there is only one chip expression.
                rootGroup = GridFunctions.getAdvancedFilteringTreeRootGroup(fix);
                expect(GridFunctions.getAdvancedFilteringTreeChildItems(rootGroup, false).length).toBe(1);
                expect(GridFunctions.getAdvancedFilteringTreeChildExpressions(rootGroup, true).length).toBe(1);
            }));

            it('Should select/deselect all child conditions and groups when pressing \'Enter\' on  a group\'s operator line.',
            fakeAsync(() => {
                // Apply advanced filter through API.
                const tree = new FilteringExpressionsTree(FilteringLogic.And);
                tree.filteringOperands.push({
                    fieldName: 'Downloads', searchVal: 100, condition: IgxNumberFilteringOperand.instance().condition('greaterThan')
                });
                const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
                orTree.filteringOperands.push({
                    fieldName: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                    ignoreCase: true
                });
                orTree.filteringOperands.push({
                    fieldName: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
                    ignoreCase: true
                });
                tree.filteringOperands.push(orTree);
                grid.advancedFilteringExpressionsTree = tree;
                fix.detectChanges();

                // Open Advanced Filtering dialog.
                grid.openAdvancedFilteringDialog();
                fix.detectChanges();

                // Press 'Enter' on the root group's operator line
                let rootOperatorLine = GridFunctions.getAdvancedFilteringTreeRootGroupOperatorLine(fix);
                const keyboardEvent = new KeyboardEvent('keydown', { key: 'Enter' });
                rootOperatorLine.dispatchEvent(keyboardEvent);
                tick();

                // Simulate end of chip selection animation
                const chipSelect = fix.nativeElement.querySelector(CHIP_SELECT_CLASS);
                const transitionEvent = new TransitionEvent('transitionend', {
                    propertyName: 'width'
                });
                chipSelect.dispatchEvent(transitionEvent);

                // Verify items are selected and context menu is opened
                verifyChildrenSelection(GridFunctions.getAdvancedFilteringExpressionsContainer(fix), true);
                verifyContextMenuVisibility(fix, true);

                // Press 'Enter' on the root group's operator line again
                rootOperatorLine = GridFunctions.getAdvancedFilteringTreeRootGroupOperatorLine(fix);
                rootOperatorLine.dispatchEvent(keyboardEvent);
                tick();

                // Verify items are not selected and context menu is closed
                verifyChildrenSelection(GridFunctions.getAdvancedFilteringExpressionsContainer(fix), false);
                verifyContextMenuVisibility(fix, false);
            }));
        });

    });

    describe('Localization - ', () => {
        it('Should correctly change resource strings for Advanced Filtering dialog.', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxGridAdvancedFilteringComponent);
            const grid: IgxGridComponent = fix.componentInstance.grid;
            grid.resourceStrings = Object.assign({}, grid.resourceStrings, {
                igx_grid_filter_operator_and: 'My and',
                igx_grid_filter_operator_or: 'My or',
                igx_grid_advanced_filter_title: 'My advanced filter',
                igx_grid_advanced_filter_and_group: 'My and group',
                igx_grid_advanced_filter_or_group: 'My or group',
                igx_grid_advanced_filter_end_group: 'My end group',
                igx_grid_advanced_filter_create_and_group: 'My create and group',
                igx_grid_advanced_filter_create_or_group: 'My create or group',
                igx_grid_advanced_filter_and_label: 'My and',
                igx_grid_advanced_filter_or_label: 'My or',
                igx_grid_advanced_filter_add_condition: 'My condition',
                igx_grid_advanced_filter_ungroup: 'My ungroup',
                igx_grid_advanced_filter_delete: 'My delete',
                igx_grid_advanced_filter_delete_filters: 'My delete filters',
                igx_grid_advanced_filter_initial_text: 'My initial text'
            });
            fix.detectChanges();

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            expect(GridFunctions.getAdvancedFilteringHeaderText(fix)).toBe('My advanced filter');
            expect(GridFunctions.getAdvancedFilteringHeaderLegendItemAnd(fix).innerText).toBe('My and');
            expect(GridFunctions.getAdvancedFilteringHeaderLegendItemOr(fix).innerText).toBe('My or');
            expect(GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix)[0].querySelector('span').innerText)
                .toBe('My and group');
            expect(GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix)[1].querySelector('span').innerText)
                .toBe('My or group');
            expect(GridFunctions.getAdvancedFilteringEmptyPrompt(fix).innerText).toBe('My initial text');

            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            expect(GridFunctions.getAdvancedFilteringTreeRootGroupButtons(fix, 0)[0].querySelector('span').innerText)
                .toBe('My condition');
            expect(GridFunctions.getAdvancedFilteringTreeRootGroupButtons(fix, 0)[1].querySelector('span').innerText)
                .toBe('My and group');
            expect(GridFunctions.getAdvancedFilteringTreeRootGroupButtons(fix, 0)[2].querySelector('span').innerText)
                .toBe('My or group');

            // Populate edit inputs.
            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.

            let input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'angular', fix); // Type filter value.
            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            const rootOperatorLine = GridFunctions.getAdvancedFilteringTreeRootGroupOperatorLine(fix);
            rootOperatorLine.click();
            fix.detectChanges();

            const buttonGroupItems = GridFunctions.sortNativeElementsHorizontally(
                Array.from(GridFunctions.getAdvancedFilteringContextMenuButtonGroup(fix)
                                        .querySelectorAll('.igx-button-group__item-content')));
            expect(buttonGroupItems[0].textContent).toBe('My and');
            expect(buttonGroupItems[1].textContent).toBe('My or');
            expect(GridFunctions.getAdvancedFilteringContextMenuButtons(fix)[3].querySelector('span').innerText)
                .toBe('My ungroup');
            expect(GridFunctions.getAdvancedFilteringContextMenuButtons(fix)[4].querySelector('span').innerText)
                .toBe('My delete');

            // Close context menu.
            GridFunctions.clickAdvancedFilteringContextMenuCloseButton(fix);
            fix.detectChanges();

            // Add another expression to root group.
            let btn = GridFunctions.getAdvancedFilteringTreeRootGroupButtons(fix, 0)[0];
            btn.click();
            fix.detectChanges();

            // Populate edit inputs.
            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.

            input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'script', fix); // Type filter value.
            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Select two chips.
            GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [0]);
            GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [1]);
            tick(200);

            // Simulate end of chip selection animation
            const chipSelectHidden = fix.nativeElement.querySelector(CHIP_SELECT_CLASS);
            const transitionEvent = new TransitionEvent('transitionend', {
                propertyName: 'width'
            });
            chipSelectHidden.dispatchEvent(transitionEvent);

            expect(GridFunctions.getAdvancedFilteringContextMenuButtons(fix)[1].innerText).toBe('My create and group');
            expect(GridFunctions.getAdvancedFilteringContextMenuButtons(fix)[2].innerText).toBe('My create or group');
            expect(GridFunctions.getAdvancedFilteringContextMenuButtons(fix)[3].innerText).toBe('My delete filters');

            // Close context menu.
            GridFunctions.clickAdvancedFilteringContextMenuCloseButton(fix);
            tick(100);
            fix.detectChanges();

            // Add an 'or' group to root group.
            btn = GridFunctions.getAdvancedFilteringTreeRootGroupButtons(fix, 0)[2];
            btn.click();
            tick(100);
            fix.detectChanges();

            const endGroupButton = GridFunctions.getAdvancedFilteringTreeGroupButtons(fix, [2], 0)[3];
            expect(endGroupButton.querySelector('span').innerText).toBe('My end group');
        }));
    });

    describe('Column groups - ', () => {
        let fix; let grid: IgxGridComponent;
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridAdvancedFilteringColumnGroupComponent);
            grid = fix.componentInstance.grid;
            fix.detectChanges();
        }));

        it('Should not display column groups in advanced filtering dialog.', fakeAsync(() => {
            // Open dialog through API.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Click the initial 'Add And Group' button.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Open column dropdown and verify that there are no column groups present.
            GridFunctions.clickAdvancedFilteringColumnSelect(fix);
            fix.detectChanges();
            const dropdownValues = GridFunctions.getAdvancedFilteringSelectDropdownItems(fix).map((x: any) => x.innerText);
            const expectedValues = ['ID', 'ProductName', 'Downloads', 'Released', 'ReleaseDate', 'Another Field'];
            expect(expectedValues).toEqual(dropdownValues);
        }));
    });

    describe('External - ', () => {
        let fix; let grid: IgxGridComponent;
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridExternalAdvancedFilteringComponent);
            grid = fix.componentInstance.grid;
            fix.detectChanges();
        }));

        it('Should allow hosting Advanced Filtering dialog outside of the grid.', fakeAsync(() => {
            // Add a root 'and' group.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Populate edit inputs.
            selectColumnInEditModeExpression(fix, 2); // Select 'Downloads' column.
            selectOperatorInEditModeExpression(fix, 2); // Select 'Greater Than' operator.
            let input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, '100', fix); // Type filter value.
            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Add new expression to the root group.
            const addExpressionBtn = GridFunctions.getAdvancedFilteringTreeRootGroupButtons(fix, 0)[0];
            addExpressionBtn.click();
            tick(100);
            fix.detectChanges();

            // Populate edit inputs.
            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.
            input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'ignite', fix); // Type filter value.
            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Apply the filters.
            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            tick(100);
            fix.detectChanges();

            // Verify the state of the grid after the filtering.
            expect(grid.advancedFilteringExpressionsTree).toBeTruthy();
            expect(grid.filteredData.length).toBe(1);
            expect(grid.rowList.length).toBe(1);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
        }));

        it('Should allow hosting Advanced Filtering dialog outside of the hierarchical grid without any console errors.', fakeAsync(() => {
            fix = TestBed.createComponent(IgxHierGridExternalAdvancedFilteringComponent);
            const hgrid: IgxHierarchicalGridComponent = fix.componentInstance.hgrid;
            fix.detectChanges();
            spyOn(console, 'error');

            const advFilterDialog = fix.nativeElement.querySelector('.igx-advanced-filter');
            const applyFilterButton: any = Array.from(advFilterDialog.querySelectorAll('button'))
                .find((b: any) => b.innerText.toLowerCase() === 'apply');

            applyFilterButton.click();
            tick(100);
            fix.detectChanges();

            UIInteractions.simulatePointerEvent('pointerenter',
                hgrid.nativeElement.querySelectorAll('igx-hierarchical-grid-cell')[0], 5, 5);
            fix.detectChanges();

            expect(console.error).not.toHaveBeenCalled();
        }));

    });

    describe('Expression tree bindings - ', () => {
        let fix; let grid: IgxGridComponent;
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridAdvancedFilteringBindingComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it('should correctly filter with \'advancedFilteringExpressionsTree\' binding', fakeAsync(() => {
            // Verify initially filtered in Advanced Filtering - 'Downloads > 200'
            expect(grid.filteredData.length).toEqual(3);
            expect(grid.rowList.length).toBe(3);

            // Verify filtering expressions tree binding state
            expect(grid.advancedFilteringExpressionsTree).toBe(fix.componentInstance.filterTree);

            // Clear filter
            grid.advancedFilteringExpressionsTree = null;
            fix.detectChanges();

            // Verify filtering expressions tree binding state
            expect(grid.advancedFilteringExpressionsTree).toBe(fix.componentInstance.filterTree);

            // Verify no filtered data
            expect(grid.filteredData).toBe(null);
            expect(grid.rowList.length).toBe(8);
        }));
    });
});

const selectColumnInEditModeExpression = (fix, dropdownItemIndex: number) => {
    GridFunctions.clickAdvancedFilteringColumnSelect(fix);
    fix.detectChanges();
    GridFunctions.clickAdvancedFilteringSelectDropdownItem(fix, dropdownItemIndex);
    tick();
    fix.detectChanges();
};

const selectOperatorInEditModeExpression = (fix, dropdownItemIndex: number) => {
    GridFunctions.clickAdvancedFilteringOperatorSelect(fix);
    fix.detectChanges();
    GridFunctions.clickAdvancedFilteringSelectDropdownItem(fix, dropdownItemIndex);
    tick();
    fix.detectChanges();
};

/**
 * Verifies the type of the operator line ('and' or 'or').
 * (NOTE: The 'operator' argument must be a string with a value that is either 'and' or 'or'.)
 */
const verifyOperatorLine = (operatorLine: HTMLElement, operator: string) => {
    expect(operator === 'and' || operator === 'or').toBe(true, 'operator must be \'and\' or \'or\'');

    if (operator === 'and') {
        expect(operatorLine.classList.contains(ADVANCED_FILTERING_OPERATOR_LINE_AND_CSS_CLASS)).toBe(true, 'incorrect operator line');
        expect(operatorLine.classList.contains(ADVANCED_FILTERING_OPERATOR_LINE_OR_CSS_CLASS)).toBe(false, 'incorrect operator line');
    } else {
        expect(operatorLine.classList.contains(ADVANCED_FILTERING_OPERATOR_LINE_AND_CSS_CLASS)).toBe(false, 'incorrect operator line');
        expect(operatorLine.classList.contains(ADVANCED_FILTERING_OPERATOR_LINE_OR_CSS_CLASS)).toBe(true, 'incorrect operator line');
    }
};

const verifyOperatorLineSelection = (operatorLine: HTMLElement, shouldBeSelected: boolean) => {
    expect(operatorLine.classList.contains(ADVANCED_FILTERING_OPERATOR_LINE_SELECTED_CSS_CLASS))
        .toBe(shouldBeSelected, 'incorrect selection state of the operator line');
};

const verifyExpressionChipContent = (fix, path: number[], columnText: string, operatorText: string, valueText: string) => {
    const chip = GridFunctions.getAdvancedFilteringTreeExpressionChip(fix, path);
    const chipSpans = GridFunctions.sortNativeElementsHorizontally(Array.from(chip.querySelectorAll('span')));
    const columnSpan = chipSpans[0];
    const operatorSpan = chipSpans[1];
    const valueSpan = chipSpans[2];
    expect(columnSpan.innerText.toLowerCase().trim()).toBe(columnText.toLowerCase(), 'incorrect chip column');
    expect(operatorSpan.innerText.toLowerCase().trim()).toBe(operatorText.toLowerCase(), 'incorrect chip operator');
    expect(valueSpan.innerText.toLowerCase().trim()).toBe(valueText.toLowerCase(), 'incorrect chip filter value');
};

const verifyExpressionChipSelection = (fix, path: number[], shouldBeSelected: boolean) => {
    const chip = GridFunctions.getAdvancedFilteringTreeExpressionChip(fix, path);
    verifyExpressionChipSelectionByChip(chip, shouldBeSelected);
};

const verifyExpressionChipSelectionByChip = (chip: HTMLElement, shouldBeSelected: boolean) => {
    const chipItem = chip.querySelector('.igx-chip__item');
    if (shouldBeSelected) {
        expect(chipItem.classList.contains('igx-chip__item--selected')).toBe(true, 'chip is not selected');
        expect(chipItem.querySelector(CHIP_SELECT_CLASS)).not.toBeNull();
        expect(chipItem.querySelector(CHIP_SELECT_HIDDEN_CLASS)).toBeNull();
    } else {
        expect(chipItem.classList.contains('igx-chip__item--selected')).toBe(false, 'chip is selected');
        expect(chipItem.querySelector(CHIP_SELECT_CLASS)).toBeNull();
        expect(chipItem.querySelector(CHIP_SELECT_HIDDEN_CLASS)).not.toBeNull();
    }
};

/**
 * Verifies that all children (operator lines and expression chips) of the provided 'parent' are selected.
 */
const verifyChildrenSelection = (parent: HTMLElement, shouldBeSelected: boolean) => {
    const allOperatorLines: any[] = Array.from(parent.querySelectorAll('.igx-filter-tree__line'));
    const allExpressionChips: any[] = Array.from(parent.querySelectorAll(`.${ADVANCED_FILTERING_EXPRESSION_ITEM_CLASS}`));
    for (const operatorLine of allOperatorLines) {
        verifyOperatorLineSelection(operatorLine, shouldBeSelected);
    }
    for (const expressionChip of allExpressionChips) {
        verifyExpressionChipSelectionByChip(expressionChip, shouldBeSelected);
    }
};

const verifyEditModeExpressionInputStates = (fix,
                                             columnSelectEnabled: boolean,
                                             operatorSelectEnabled: boolean,
                                             valueInputEnabled: boolean,
                                             commitButtonEnabled: boolean) => {
    // Verify the column select state.
    const columnInputGroup = GridFunctions.getAdvancedFilteringColumnSelect(fix).querySelector('igx-input-group');
    expect(!columnInputGroup.classList.contains('igx-input-group--disabled')).toBe(columnSelectEnabled,
        'incorrect column select state');

    // Verify the operator select state.
    const operatorInputGroup = GridFunctions.getAdvancedFilteringOperatorSelect(fix).querySelector('igx-input-group');
    expect(!operatorInputGroup.classList.contains('igx-input-group--disabled')).toBe(operatorSelectEnabled,
        'incorrect operator select state');

    // Verify the value input state.
    const editModeContainer = GridFunctions.getAdvancedFilteringEditModeContainer(fix);
    const valueInputGroup = GridFunctions.sortNativeElementsHorizontally(
        Array.from(editModeContainer.querySelectorAll('igx-input-group')))[2];
    expect(!valueInputGroup.classList.contains('igx-input-group--disabled')).toBe(valueInputEnabled,
        'incorrect value input state');

    // Verify commit expression button state
    const commitButton = GridFunctions.getAdvancedFilteringExpressionCommitButton(fix);
    ControlsFunction.verifyButtonIsDisabled(commitButton, !commitButtonEnabled);


    // Verify close expression button is enabled.
    const closeButton = GridFunctions.getAdvancedFilteringExpressionCloseButton(fix);
    ControlsFunction.verifyButtonIsDisabled(closeButton, false);
};

const verifyEditModeExpressionInputValues = (fix,
                                             columnText: string,
                                             operatorText: string,
                                             valueText: string) => {
    const columnInput = GridFunctions.getAdvancedFilteringColumnSelect(fix).querySelector('input');
    const operatorInput = GridFunctions.getAdvancedFilteringColumnSelect(fix).querySelector('input');
    const editModeContainer = GridFunctions.getAdvancedFilteringEditModeContainer(fix);
    const valueInput = GridFunctions.sortNativeElementsHorizontally(Array.from(editModeContainer.querySelectorAll('input')))[2];
    expect(columnInput.value).toBe(columnText);
    expect(operatorInput.value).toBe(operatorText);
    expect(valueInput.value).toBe(valueText);
};

const verifyElementIsInExpressionsContainerView = (fix, element: HTMLElement) => {
    const elementRect = element.getBoundingClientRect();
    const exprContainer: HTMLElement = GridFunctions.getAdvancedFilteringExpressionsContainer(fix);
    const exprContainerRect = exprContainer.getBoundingClientRect();
    expect(elementRect.top >= exprContainerRect.top).toBe(true, 'top is not in view');
    expect(elementRect.bottom <= exprContainerRect.bottom).toBe(true, 'bottom is not in view');
    expect(elementRect.left >= exprContainerRect.left).toBe(true, 'left is not in view');
    expect(elementRect.right <= exprContainerRect.right).toBe(true, 'right is not in view');
};

const verifyContextMenuVisibility = (fix, shouldBeVisible: boolean) => {
    const contextMenu: HTMLElement = GridFunctions.getAdvancedFilteringContextMenu(fix);
    const contextMenuRect = contextMenu.getBoundingClientRect();
    expect(contextMenu.classList.contains('igx-toggle--hidden')).toBe(!shouldBeVisible, 'incorrect context menu visibility');
    expect(contextMenuRect.width === 0 && contextMenuRect.height === 0).toBe(!shouldBeVisible, 'incorrect context menu dimensions');
};

/**
 * Verifies the type of the context menu (menu for specific group or menu for combining expressions).
 * If contextual group is expected, the context menu should contain buttons for operator change, ungroup and delete.
 * If contextual group is not expected, the context menu should contain buttons for creating new group by combining expressions.
 */
const verifyContextMenuType = (fix, shouldBeContextualGroup: boolean) => {
    const contextMenuButtons =  GridFunctions.getAdvancedFilteringContextMenuButtons(fix);
    expect(GridFunctions.getAdvancedFilteringContextMenuButtonGroup(fix) !== null).toBe(shouldBeContextualGroup);

    if (shouldBeContextualGroup) {
        expect(contextMenuButtons.length).toBe(5, 'incorrect buttons count in context menu');
        expect(contextMenuButtons[0].innerText.toLowerCase()).toBe('close');
        expect(contextMenuButtons[3].querySelector('span').innerText.toLowerCase()).toBe('ungroup');
        expect(contextMenuButtons[4].querySelector('span').innerText.toLowerCase()).toBe('delete');
    } else {
        expect(contextMenuButtons.length).toBe(4, 'incorrect buttons count in context menu');
        expect(contextMenuButtons[0].innerText.toLowerCase()).toBe('close');
        expect(contextMenuButtons[1].innerText.toLowerCase().trim()).toBe('create "and" group');
        expect(contextMenuButtons[2].innerText.toLowerCase().trim()).toBe('create "or" group');
        expect(contextMenuButtons[3].innerText.toLowerCase().trim()).toBe('delete filters');
    }
};
