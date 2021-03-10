import { Component, ViewChild, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { IgxIconModule } from '../icon/public_api';
import { IgxChipsModule } from './chips.module';
import { IgxPrefixModule } from '../directives/prefix/prefix.directive';
import { IgxSuffixModule } from '../directives/suffix/suffix.directive';
import { IgxChipComponent } from './chip.component';
import { IgxChipsAreaComponent } from './chips-area.component';
import { configureTestSuite } from '../test-utils/configure-suite';
import { wait, UIInteractions } from '../test-utils/ui-interactions.spec';

@Component({
    template: `
        <igx-chips-area #chipsArea class="customClass">
            <igx-chip #chipElem *ngFor="let chip of chipList"
            [id]="chip.id" [draggable]="chip.draggable" [removable]="chip.removable" [selectable]="chip.selectable">
                <igx-icon igxPrefix>drag_indicator</igx-icon>
                <span #label [class]="'igx-chip__text'">{{chip.text}}</span>
            </igx-chip>
        </igx-chips-area>
    `
})
class TestChipComponent {
    @ViewChild('chipsArea', { read: IgxChipsAreaComponent, static: true  })
    public chipsArea: IgxChipsAreaComponent;

    @ViewChildren('chipElem', { read: IgxChipComponent})
    public chips: QueryList<IgxChipComponent>;

    public chipList = [
        { id: 'Country', text: 'Country', removable: false, selectable: false, draggable: false },
        { id: 'City', text: 'City', removable: true, selectable: true, draggable: true }
    ];

    constructor(public cdr: ChangeDetectorRef) {}
}

@Component({
    template: `
        <igx-chips-area #chipsArea>
            <igx-chip #chipElem [id]="1" [draggable]="true" [removable]="true" [selectable]="true" [selected]="true">
                <span #label [class]="'igx-chip__text'">first chip</span>
            </igx-chip>
            <igx-chip #chipElem [id]="2" [draggable]="false" [selectable]="false" [selected]="true">
                <span #label [class]="'igx-chip__text'">second chip</span>
            </igx-chip>
            <igx-chip #chipElem [id]="3" [draggable]="true" [removable]="true" [selectable]="true" [selected]="false">
                <span #label [class]="'igx-chip__text'">third chip</span>
            </igx-chip>
        </igx-chips-area>
    `
})
class TestChipSelectComponent extends TestChipComponent {
}

@Component({
    template:
    `
        <igx-chips-area #chipsArea (reorder)="chipsOrderChanged($event)">
            <igx-chip #chipElem *ngFor="let chip of chipList" [id]="chip.id" [draggable]="true"
                [removable]="true" [selectable]="true" (remove)="chipRemoved($event)">
                <igx-icon igxPrefix>drag_indicator</igx-icon>
                <span #label [class]="'igx-chip__text'">{{chip.text}}</span>
            </igx-chip>
        </igx-chips-area>
    `
})
class TestChipReorderComponent {
    @ViewChild('chipsArea', { read: IgxChipsAreaComponent, static: true  })
    public chipsArea: IgxChipsAreaComponent;

    @ViewChildren('chipElem', { read: IgxChipComponent})
    public chips: QueryList<IgxChipComponent>;

    public chipList = [
        { id: 'Country', text: 'Country' },
        { id: 'City', text: 'City' },
        { id: 'Town', text: 'Town' },
        { id: 'FirstName', text: 'First Name' },
    ];

    constructor(public cdr: ChangeDetectorRef) {}

    public chipsOrderChanged(event) {
        const newChipList = [];
        for (const chip of event.chipsArray) {
            newChipList.push(this.chipList.find((item) => item.id === chip.id));
        }
        this.chipList = newChipList;
    }

    public chipRemoved(event) {
        this.chipList = this.chipList.filter((item) => item.id !== event.owner.id);
        this.chipsArea.cdr.detectChanges();
    }
}


describe('IgxChipsArea ', () => {
    configureTestSuite();
    const CHIP_REMOVE_BUTTON = 'igx-chip__remove';
    const CHIP_SELECT_ICON = 'igx-chip__select';
    const CHIP_SELECT_ICON_HIDDEN = 'igx-chip__select--hidden';
    const TEST_CHIP_AREA_CLASS = 'igx-chip-area customClass';

    let fix;
    let chipArea: IgxChipsAreaComponent;
    let chipAreaElement;

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                TestChipComponent,
                TestChipReorderComponent,
                TestChipSelectComponent
            ],
            imports: [FormsModule, IgxIconModule, IgxChipsModule, IgxPrefixModule, IgxSuffixModule]
        }).compileComponents();
    }));

    describe('Basic', () => {
        beforeEach(() => {
            fix = TestBed.createComponent(TestChipComponent);
            fix.detectChanges();
            chipAreaElement = fix.debugElement.query(By.directive(IgxChipsAreaComponent));
        });

        it('should add chips when adding data items ', () => {
            expect(chipAreaElement.nativeElement.className).toEqual(TEST_CHIP_AREA_CLASS);
            expect(chipAreaElement.nativeElement.children.length).toEqual(2);

            fix.componentInstance.chipList.push({ id: 'Town', text: 'Town', removable: true, selectable: true, draggable: true });

            fix.detectChanges();

            expect(chipAreaElement.nativeElement.children.length).toEqual(3);
        });

        it('should remove chips when removing data items ', () => {
            expect(chipAreaElement.nativeElement.children.length).toEqual(2);

            fix.componentInstance.chipList.pop();
            fix.detectChanges();

            expect(chipAreaElement.nativeElement.children.length).toEqual(1);
        });

        it('should change data in chips when data item is changed', () => {
            expect(chipAreaElement.nativeElement.children[0].innerHTML).toContain('Country');

            fix.componentInstance.chipList[0].text = 'New text';
            fix.detectChanges();

            expect(chipAreaElement.nativeElement.children[0].innerHTML).toContain('New text');
        });
    });


    describe('Selection', () => {
        const spaceKeyEvent = new KeyboardEvent('keydown', { key: ' ' });

        it('should be able to select chip using input property', () => {
            fix = TestBed.createComponent(TestChipSelectComponent);
            fix.detectChanges();

            const firstChipComp = fix.componentInstance.chips.toArray()[0];
            const secondChipComp = fix.componentInstance.chips.toArray()[1];
            const thirdChipComp = fix.componentInstance.chips.toArray()[2];

            expect(firstChipComp.selected).toBe(true);
            expect(secondChipComp.selected).toBe(true);
            expect(thirdChipComp.selected).toBe(false);
        });

        it('should emit selectionChange for the chipArea event when there are initially selected chips through their inputs', () => {
            fix = TestBed.createComponent(TestChipSelectComponent);
            chipArea = fix.componentInstance.chipsArea;

            spyOn(chipArea.selectionChange, 'emit');

            fix.detectChanges();

            const chipComponents = fix.componentInstance.chips.toArray();
            expect(chipArea.selectionChange.emit).toHaveBeenCalledWith({
                originalEvent: null,
                owner: chipArea,
                newSelection: [chipComponents[0], chipComponents[1]]
            });
        });

        it('should focus on chip correctly', () => {
            fix = TestBed.createComponent(TestChipSelectComponent);
            fix.detectChanges();

            const firstChipComp = fix.componentInstance.chips.toArray()[0];
            const secondChipComp = fix.componentInstance.chips.toArray()[1];

            firstChipComp.elementRef.nativeElement.focus();
            expect(document.activeElement).toBe(firstChipComp.elementRef.nativeElement);

            secondChipComp.elementRef.nativeElement.focus();
            expect(document.activeElement).toBe(secondChipComp.elementRef.nativeElement);
        });

        it('should focus on previous and next chips after arrows are pressed', () => {
            fix = TestBed.createComponent(TestChipSelectComponent);
            fix.detectChanges();

            const firstChipComp = fix.componentInstance.chips.toArray()[0];
            const secondChipComp = fix.componentInstance.chips.toArray()[1];

            firstChipComp.elementRef.nativeElement.focus();
            fix.detectChanges();

            expect(document.activeElement).toBe(firstChipComp.elementRef.nativeElement);

            const rightKey = new KeyboardEvent('keydown', { key: 'ArrowRight' });
            firstChipComp.onChipKeyDown(rightKey);
            fix.detectChanges();

            expect(document.activeElement).toBe(secondChipComp.elementRef.nativeElement);

            const leftKey = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
            secondChipComp.onChipKeyDown(leftKey);
            fix.detectChanges();

            expect(document.activeElement).toBe(firstChipComp.elementRef.nativeElement);
        });

        it('should fire selectionChange event', () => {
            fix = TestBed.createComponent(TestChipComponent);
            fix.detectChanges();
            fix.componentInstance.cdr.detectChanges();

            const secondChipComp: IgxChipComponent = fix.componentInstance.chips.toArray()[1];
            const chipAreaComp: IgxChipsAreaComponent = fix.debugElement.query(By.directive(IgxChipsAreaComponent)).componentInstance;
            spyOn(chipAreaComp.selectionChange, 'emit');

            secondChipComp.onChipKeyDown(spaceKeyEvent);
            fix.detectChanges();

            expect(chipAreaComp.selectionChange.emit).toHaveBeenCalledWith({
                originalEvent: spaceKeyEvent,
                owner: chipAreaComp,
                newSelection: [secondChipComp]
            });

            let chipsSelectionStates = fix.componentInstance.chips.toArray().filter(c => c.selected);
            expect(chipsSelectionStates.length).toEqual(1);
            expect(secondChipComp.selected).toBeTruthy();

            secondChipComp.onChipKeyDown(spaceKeyEvent);
            fix.detectChanges();

            expect(chipAreaComp.selectionChange.emit).toHaveBeenCalledWith({
                originalEvent: spaceKeyEvent,
                owner: chipAreaComp,
                newSelection: []
            });

            chipsSelectionStates = fix.componentInstance.chips.toArray().filter(c => c.selected);
            expect(chipsSelectionStates.length).toEqual(0);
            expect(secondChipComp.selected).not.toBeTruthy();
        });

        it('should be able to have multiple chips selected', () => {
            fix = TestBed.createComponent(TestChipComponent);
            fix.detectChanges();

            const chipAreaComponent = fix.componentInstance;

            chipAreaComponent.chipList.push({ id: 'Town', text: 'Town', removable: true, selectable: true, draggable: true });
            fix.detectChanges();

            spyOn(chipAreaComponent.chipsArea.selectionChange, `emit`);
            chipAreaComponent.chipsArea.chipsList.toArray()[1].selected = true;
            fix.detectChanges();
            chipAreaComponent.chipsArea.chipsList.toArray()[2].selected = true;
            fix.detectChanges();

            const secondChipComp = fix.componentInstance.chips.toArray()[1];
            const thirdChipComp = fix.componentInstance.chips.toArray()[2];
            expect(chipAreaComponent.chipsArea.selectionChange.emit).toHaveBeenCalledTimes(2);
            expect(chipAreaComponent.chipsArea.selectionChange.emit).toHaveBeenCalledWith({
                originalEvent: null,
                owner: chipAreaComponent.chipsArea,
                newSelection: [secondChipComp, thirdChipComp]
            });
        });

        it('should be able to select chip using input property', () => {
            fix = TestBed.createComponent(TestChipSelectComponent);
            fix.detectChanges();

            const firstChipComp = fix.componentInstance.chips.toArray()[0];
            const secondChipComp = fix.componentInstance.chips.toArray()[1];
            const thirdChipComp = fix.componentInstance.chips.toArray()[2];

            expect(firstChipComp.selected).toBe(true);
            expect(secondChipComp.selected).toBe(true);
            expect(thirdChipComp.selected).toBe(false);
        });

        it('should emit onSelection for the chipArea event when there are initially selected chips through their inputs', () => {
            fix = TestBed.createComponent(TestChipSelectComponent);
            chipArea = fix.componentInstance.chipsArea;

            spyOn(chipArea.selectionChange, 'emit');

            fix.detectChanges();

            const chipComponents = fix.componentInstance.chips.toArray();
            expect(chipArea.selectionChange.emit).toHaveBeenCalledWith({
                originalEvent: null,
                owner: chipArea,
                newSelection: [chipComponents[0], chipComponents[1]]
            });
        });

        it('should be able to select chip using api when selectable is set to false', () => {
            fix = TestBed.createComponent(TestChipComponent);
            fix.detectChanges();

            const selectedChip = fix.componentInstance.chipsArea.chipsList.toArray()[0];
            const unselectedChip = fix.componentInstance.chipsArea.chipsList.toArray()[1];
            selectedChip.selected = true;
            fix.detectChanges();

            const selectedChipIconContainer = selectedChip.elementRef.nativeElement.children[0].children[0];
            const unselectedChipIconContainer = unselectedChip.elementRef.nativeElement.children[0].children[0];
            expect(selectedChip.selected).toBe(true);
            expect(selectedChipIconContainer.children.length).toEqual(1);
            expect(selectedChipIconContainer.children[0].tagName).toEqual('IGX-ICON');
            // expect(selectedChip.elementRef.nativeElement.children[0].children[0].offsetWidth).not.toEqual(0);
            expect(selectedChip.elementRef.nativeElement.children[0].children[0].className).toEqual(CHIP_SELECT_ICON);
            expect(selectedChip.elementRef.nativeElement.children[0].children[0].className).not.toEqual(CHIP_SELECT_ICON_HIDDEN);
            expect(unselectedChipIconContainer.children.length).toEqual(1);
            expect(unselectedChipIconContainer.children[0].tagName).toEqual('IGX-ICON');
            expect(unselectedChip.elementRef.nativeElement.children[0].children[0].offsetWidth).toEqual(0);
        });

        it('should fire only onSelection event for chip area when selecting a chip using spacebar', () => {
            fix = TestBed.createComponent(TestChipComponent);
            fix.detectChanges();
            fix.componentInstance.cdr.detectChanges();

            chipArea = fix.componentInstance.chipsArea;
            const secondChip = fix.componentInstance.chips.toArray()[1];

            spyOn(chipArea.reorder, 'emit');
            spyOn(chipArea.selectionChange, 'emit');
            spyOn(chipArea.moveStart, 'emit');
            spyOn(chipArea.moveEnd, 'emit');


            secondChip.onChipKeyDown(spaceKeyEvent);
            fix.detectChanges();

            expect(chipArea.selectionChange.emit).toHaveBeenCalled();
            expect(chipArea.reorder.emit).not.toHaveBeenCalled();
            expect(chipArea.moveStart.emit).not.toHaveBeenCalled();
            expect(chipArea.moveEnd.emit).not.toHaveBeenCalled();
        });

        it('should select a chip by clicking on it and emit onSelection event', () => {
            fix = TestBed.createComponent(TestChipComponent);
            fix.detectChanges();

            chipArea = fix.componentInstance.chipsArea;
            const secondChip = fix.componentInstance.chips.toArray()[1];
            const pointerUpEvt = new PointerEvent('pointerup');

            spyOn(chipArea.selectionChange, 'emit');
            fix.detectChanges();

            secondChip.onChipDragClicked({
                originalEvent: pointerUpEvt,
                owner: secondChip.dragDirective,
                pageX: 0, pageY: 0, startX: 0, startY: 0
            });
            fix.detectChanges();

            expect(chipArea.selectionChange.emit).toHaveBeenCalled();
            expect(chipArea.selectionChange.emit).not.toHaveBeenCalledWith({
                originalEvent: pointerUpEvt,
                owner: chipArea,
                newSelection: [secondChip]
            });
        });

        it('should persist selected state when it is dragged and dropped', () => {
            fix = TestBed.createComponent(TestChipComponent);
            fix.detectChanges();

            chipAreaElement = fix.debugElement.query(By.directive(IgxChipsAreaComponent));
            const chipComponents = chipAreaElement.queryAll(By.directive(IgxChipComponent));
            const secondChip = chipComponents[1].componentInstance;

            secondChip.animateOnRelease = false;
            secondChip.onChipKeyDown(spaceKeyEvent);

            expect(secondChip.selected).toBeTruthy();
            UIInteractions.moveDragDirective(fix, secondChip.dragDirective, 200, 100);

            const firstChip = chipComponents[0].componentInstance;
            expect(firstChip.selected).not.toBeTruthy();
            expect(secondChip.selected).toBeTruthy();
        });
    });

    describe('Reorder', () => {
        const leftKeyEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft', shiftKey: true });
        const rightKeyEvent = new KeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true });
        const deleteKeyEvent = new KeyboardEvent('keydown', { key: 'Delete' });

        beforeEach(() => {
            fix = TestBed.createComponent(TestChipReorderComponent);
            fix.detectChanges();
            fix.componentInstance.cdr.detectChanges();
        });

        it('should reorder chips when shift + leftarrow and shift + rightarrow is pressed', () => {
            const chipComponents = fix.debugElement.queryAll(By.directive(IgxChipComponent));
            const firstChipAreaElem = chipComponents[0].componentInstance.elementRef.nativeElement;
            const secondChipAreaElem = chipComponents[1].componentInstance.elementRef.nativeElement;
            const firstChipLeft = firstChipAreaElem.getBoundingClientRect().left;
            const secondChipLeft = secondChipAreaElem.getBoundingClientRect().left;

            firstChipAreaElem.dispatchEvent(rightKeyEvent);
            fix.detectChanges();

            let newFirstChipLeft = firstChipAreaElem.getBoundingClientRect().left;
            let newSecondChipLeft = secondChipAreaElem.getBoundingClientRect().left;
            expect(firstChipLeft).toBeLessThan(newFirstChipLeft);
            expect(newSecondChipLeft).toBeLessThan(secondChipLeft);

            firstChipAreaElem.dispatchEvent(leftKeyEvent);
            fix.detectChanges();

            newFirstChipLeft = firstChipAreaElem.getBoundingClientRect().left;
            newSecondChipLeft = secondChipAreaElem.getBoundingClientRect().left;

            expect(firstChipLeft).toEqual(newFirstChipLeft);
            expect(newSecondChipLeft).toEqual(secondChipLeft);
        });

        it('should reorder chips and keeps focus when Shift + Left Arrow is pressed and Shift + Right Arrow is pressed twice',
            (async () => {
                chipArea = fix.componentInstance.chipsArea;
                const chipComponents = fix.debugElement.queryAll(By.directive(IgxChipComponent));
                const targetChip = chipComponents[2].componentInstance;
                const targetChipElem = targetChip.elementRef.nativeElement;

                targetChipElem.focus();
                fix.detectChanges();

                expect(document.activeElement).toBe(targetChipElem);
                expect(chipArea.chipsList.toArray()[2].id).toEqual('Town');
                expect(chipArea.chipsList.toArray()[3].id).toEqual('FirstName');

                targetChip.onChipKeyDown(rightKeyEvent);
                fix.detectChanges();

                expect(document.activeElement).toBe(targetChipElem);
                expect(chipArea.chipsList.toArray()[2].id).toEqual('FirstName');
                expect(chipArea.chipsList.toArray()[3].id).toEqual('Town');

                targetChip.onChipKeyDown(leftKeyEvent);
                fix.detectChanges();
                await wait();

                expect(document.activeElement).toBe(targetChipElem);
                expect(chipArea.chipsList.toArray()[2].id).toEqual('Town');
                expect(chipArea.chipsList.toArray()[3].id).toEqual('FirstName');

                targetChip.onChipKeyDown(leftKeyEvent);
                fix.detectChanges();
                await wait();

                expect(document.activeElement).toBe(targetChipElem);
                expect(chipArea.chipsList.toArray()[2].id).toEqual('City');
                expect(chipArea.chipsList.toArray()[3].id).toEqual('FirstName');
            })
        );

        it('should not reorder chips for shift + leftarrow when the chip is going out of bounds', () => {
            const chipComponents = fix.debugElement.queryAll(By.directive(IgxChipComponent));

            const firstChipAreaElem = chipComponents[0].componentInstance.chipArea.nativeElement;
            const firstChipLeft = firstChipAreaElem.getBoundingClientRect().left;
            firstChipAreaElem.dispatchEvent(leftKeyEvent);
            fix.detectChanges();

            const newFirstChipLeft = firstChipAreaElem.getBoundingClientRect().left;
            expect(firstChipLeft).toEqual(newFirstChipLeft);
        });

        it('should not reorder chips for shift + rightarrow when the chip is going out of bounds', () => {
            const chipComponents = fix.debugElement.queryAll(By.directive(IgxChipComponent));

            const lastChipAreaElem = chipComponents[chipComponents.length - 1].componentInstance.chipArea.nativeElement;
            const lastChipLeft = lastChipAreaElem.getBoundingClientRect().left;
            lastChipAreaElem.dispatchEvent(rightKeyEvent);
            fix.detectChanges();

            const newLastChipLeft = lastChipAreaElem.getBoundingClientRect().left;
            expect(newLastChipLeft).toEqual(lastChipLeft);
        });

        it('should delete chip when delete key is pressed and chip is removable', () => {
            let chipComponents = fix.debugElement.queryAll(By.directive(IgxChipComponent));

            expect(chipComponents.length).toEqual(4);

            const firstChipComp = chipComponents[0].componentInstance;
            firstChipComp.onChipKeyDown(deleteKeyEvent);
            fix.detectChanges();

            chipComponents = fix.debugElement.queryAll(By.directive(IgxChipComponent));
            expect(chipComponents.length).toEqual(3);
        });

        it('should delete chip when delete button is clicked', () => {
            let chipComponents = fix.debugElement.queryAll(By.directive(IgxChipComponent));
            expect(chipComponents.length).toEqual(4);

            const deleteButtonElement = fix.debugElement.queryAll(By.css('.' + CHIP_REMOVE_BUTTON))[0];
            deleteButtonElement.nativeElement.click();
            fix.detectChanges();

            chipComponents = fix.debugElement.queryAll(By.directive(IgxChipComponent));
            expect(chipComponents.length).toEqual(3);
        });

        it('should not fire any event of the chip area when attempting deleting of a chip', () => {
            chipArea = fix.componentInstance.chipsArea;
            const secondChip = fix.componentInstance.chips.toArray()[1];

            spyOn(chipArea.reorder, 'emit');
            spyOn(chipArea.selectionChange, 'emit');
            spyOn(chipArea.moveStart, 'emit');
            spyOn(chipArea.moveEnd, 'emit');
            spyOn(secondChip.remove, 'emit');

            secondChip.onChipKeyDown(deleteKeyEvent);
            fix.detectChanges();

            expect(secondChip.remove.emit).toHaveBeenCalled();
            expect(chipArea.reorder.emit).not.toHaveBeenCalled();
            expect(chipArea.selectionChange.emit).not.toHaveBeenCalled();
            expect(chipArea.moveStart.emit).not.toHaveBeenCalled();
            expect(chipArea.moveEnd.emit).not.toHaveBeenCalled();
        });
    });

    describe('Interaction', () => {
        it('should not be able to drag and drop when chip is not draggable', () => {
            fix = TestBed.createComponent(TestChipComponent);
            fix.detectChanges();

            chipAreaElement = fix.debugElement.query(By.directive(IgxChipsAreaComponent));
            const chipComponents = chipAreaElement.queryAll(By.directive(IgxChipComponent));
            const firstChip = chipComponents[0].componentInstance;

            UIInteractions.moveDragDirective(fix, firstChip.dragDirective, 50, 50, false);

            expect(firstChip.dragDirective.ghostElement).toBeUndefined();
        });

        it('should be able to drag when chip is draggable', () => {
            fix = TestBed.createComponent(TestChipComponent);
            fix.detectChanges();

            chipAreaElement = fix.debugElement.query(By.directive(IgxChipsAreaComponent));
            const chipComponents = chipAreaElement.queryAll(By.directive(IgxChipComponent));
            const secondChip = chipComponents[1].componentInstance;
            const secondChipElem = secondChip.chipArea.nativeElement;

            const startingTop = secondChipElem.getBoundingClientRect().top;
            const startingLeft = secondChipElem.getBoundingClientRect().left;

            const xDragDifference = 200;
            const yDragDifference = 100;
            UIInteractions.moveDragDirective(fix, secondChip.dragDirective, xDragDifference, yDragDifference, false);

            expect(secondChip.dragDirective.ghostElement).toBeTruthy();

            const afterDragTop = secondChip.dragDirective.ghostElement.getBoundingClientRect().top;
            const afterDragLeft = secondChip.dragDirective.ghostElement.getBoundingClientRect().left;
            expect(afterDragTop - startingTop).toEqual(yDragDifference);
            expect(afterDragLeft - startingLeft).toEqual(xDragDifference);
        });

        it('should fire correctly reorder event when element is dragged and dropped to the right', () => {
            fix = TestBed.createComponent(TestChipReorderComponent);
            fix.detectChanges();

            chipAreaElement = fix.debugElement.query(By.directive(IgxChipsAreaComponent));

            const chipComponents = chipAreaElement.queryAll(By.directive(IgxChipComponent));
            const firstChip = chipComponents[0].componentInstance;
            const secondChip = chipComponents[1].componentInstance;

            firstChip.animateOnRelease = false;
            secondChip.animateOnRelease = false;

            const firstChipElem = firstChip.chipArea.nativeElement;
            const secondChipElem = secondChip.chipArea.nativeElement;

            const firstChipLeft = firstChipElem.getBoundingClientRect().left;
            UIInteractions.moveDragDirective(fix, firstChip.dragDirective, 100, 0);

            const afterDropSecondChipLeft = secondChipElem.getBoundingClientRect().left;
            expect(afterDropSecondChipLeft).toEqual(firstChipLeft);

            const afterDropFirstChipLeft = firstChipElem.getBoundingClientRect().left;
            expect(afterDropFirstChipLeft).not.toEqual(firstChipLeft);
        });

        it('should fire correctly reorder event when element is dragged and dropped to the left', () => {
            fix = TestBed.createComponent(TestChipReorderComponent);
            fix.detectChanges();

            chipAreaElement = fix.debugElement.query(By.directive(IgxChipsAreaComponent));
            const chipComponents = chipAreaElement.queryAll(By.directive(IgxChipComponent));
            const firstChip = chipComponents[0].componentInstance;
            const secondChip = chipComponents[1].componentInstance;

            firstChip.animateOnRelease = false;
            secondChip.animateOnRelease = false;

            const firstChipElem = firstChip.chipArea.nativeElement;
            const secondChipElem = secondChip.chipArea.nativeElement;

            const firstChipLeft = firstChipElem.getBoundingClientRect().left;
            UIInteractions.moveDragDirective(fix, secondChip.dragDirective, -100, 0);

            const afterDropSecondChipLeft = secondChipElem.getBoundingClientRect().left;
            expect(afterDropSecondChipLeft).toEqual(firstChipLeft);

            const afterDropFirstChipLeft = firstChipElem.getBoundingClientRect().left;
            expect(afterDropFirstChipLeft).not.toEqual(firstChipLeft);
        });

        it('should fire chipClick event', () => {
            fix = TestBed.createComponent(TestChipComponent);
            fix.detectChanges();

            const firstChipComp: IgxChipComponent = fix.componentInstance.chips.toArray()[1];
            spyOn(firstChipComp.chipClick, 'emit');

            UIInteractions.clickDragDirective(fix, firstChipComp.dragDirective);

            expect(firstChipComp.chipClick.emit).toHaveBeenCalled();
        });
    });
});
