import { QueryList } from '@angular/core';
import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxListItemComponent } from './list-item.component';
import { IgxListPanState } from './list.common';
import {
    IgxListActionDirective,
    IgxListComponent,
    IgxListLineDirective,
    IgxListLineSubTitleDirective,
    IgxListLineTitleDirective,
    IgxListModule,
    IgxListThumbnailDirective
} from './list.component';

import {
    ListWithHeaderComponent,
    ListWithPanningComponent,
    EmptyListComponent,
    CustomEmptyListComponent,
    ListLoadingComponent,
    ListWithPanningTemplatesComponent,
    ListCustomLoadingComponent,
    ListWithIgxForAndScrollingComponent,
    TwoHeadersListComponent,
    TwoHeadersListNoPanningComponent,
    ListDirectivesComponent
} from '../test-utils/list-components.spec';
import { configureTestSuite } from '../test-utils/configure-suite';
import { DisplayDensity, IDensityChangedEventArgs } from '../core/density';
import { IgxForOfModule } from '../directives/for-of/for_of.directive';
import { IgxIconModule } from '../icon/public_api';
import { wait } from '../test-utils/ui-interactions.spec';
import { GridFunctions } from '../test-utils/grid-functions.spec';

const LIST_CSS_CLASS = 'igx-list';
const LIST_COMPACT_DENSITY_CSS_CLASS = 'igx-list--compact';
const LIST_COSY_DENSITY_CSS_CLASS = 'igx-list--cosy';

describe('List', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                CustomEmptyListComponent,
                EmptyListComponent,
                ListCustomLoadingComponent,
                ListLoadingComponent,
                ListWithHeaderComponent,
                ListWithPanningComponent,
                TwoHeadersListComponent,
                TwoHeadersListNoPanningComponent,
                ListWithPanningTemplatesComponent,
                ListWithIgxForAndScrollingComponent,
                ListDirectivesComponent,
            ],
            imports: [IgxListModule, IgxForOfModule, IgxIconModule]
        }).compileComponents();
    }));

    it('should initialize igx-list with item and header', () => {
        const fixture = TestBed.createComponent(ListWithHeaderComponent);
        const list = fixture.componentInstance.list;
        const domList = fixture.debugElement.query(By.css('igx-list')).nativeElement;

        expect(list).toBeDefined();
        expect(list.id).toContain('igx-list-');
        expect(list instanceof IgxListComponent).toBeTruthy();
        expect(list.cssClass).toBeFalsy();
        expect(list.isListEmpty).toBeTruthy();
        expect(list.items instanceof Array).toBeTruthy();
        expect(list.items.length).toBe(0);
        expect(list.headers instanceof Array).toBeTruthy();
        expect(list.headers.length).toBe(0);

        fixture.detectChanges();
        expect(domList.id).toContain('igx-list-');
        expect(list.items instanceof Array).toBeTruthy();
        expect(list.cssClass).toBeTruthy();
        expect(list.isListEmpty).toBeFalsy();
        expect(list.items.length).toBe(3);
        expect(list.items[0] instanceof IgxListItemComponent).toBeTruthy();
        expect(list.headers instanceof Array).toBeTruthy();
        expect(list.headers.length).toBe(1);
        expect(list.headers[0] instanceof IgxListItemComponent).toBeTruthy();

        list.id = 'customList';
        fixture.detectChanges();

        expect(list.id).toBe('customList');
        expect(domList.id).toBe('customList');
    });

    it('should set/get properly layout properties: width, left, maxLeft, maxRight', () => {
        const fixture = TestBed.createComponent(ListWithHeaderComponent);
        const list = fixture.componentInstance.list;
        const testWidth = 400;
        const testLeft = 0;

        fixture.detectChanges();

        fixture.componentInstance.wrapper.nativeElement.style.width = testWidth + 'px';

        fixture.detectChanges();
        expect(list.items.length).toBe(3);
        const item = list.items[0];
        expect(item instanceof IgxListItemComponent).toBeTruthy();
        expect(item.width).toBe(testWidth);
        expect(item.maxLeft).toBe(-testWidth);
        expect(item.maxRight).toBe(testWidth);
        expect(item.element.offsetLeft).toBe(testLeft);
    });

    it('should calculate properly item index', () => {
        const fixture = TestBed.createComponent(ListWithHeaderComponent);
        const list = fixture.componentInstance.list;
        fixture.detectChanges();

        expect(list.children instanceof QueryList).toBeTruthy();
        expect(list.items instanceof Array).toBeTruthy();
        expect(list.headers instanceof Array).toBeTruthy();

        expect(list.children.length).toBe(4);
        expect(list.items.length).toBe(3);
        expect(list.headers.length).toBe(1);

        for (let i = 0; i < list.children.length; i++) {
            const item: IgxListItemComponent = list.children.find(((child) => (child.index === i)));
            expect(item.index).toBe(i);
        }
    });

    it('should pan right and pan left.', () => {
        let timesCalledLeftPan = 0;
        let timesCalledStateChanged = 0;
        let timesCalledRightPan = 0;

        const fixture = TestBed.createComponent(ListWithPanningComponent);
        const list: IgxListComponent = fixture.componentInstance.list;

        fixture.detectChanges();

        list.leftPan.subscribe(() => {
            timesCalledLeftPan++;
        });

        list.panStateChange.subscribe(() => {
            timesCalledStateChanged++;
        });

        list.rightPan.subscribe(() => {
            timesCalledRightPan++;
        });

        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));
        const listItems = list.items;

        /* Pan item right */
        panItem(itemNativeElements[0], 0.6);
        expect(listItems[0].panState).toBe(IgxListPanState.RIGHT);

        /* Pan item left */
        panItem(itemNativeElements[1], -0.6);
        expect(listItems[1].panState).toBe(IgxListPanState.LEFT);

        expect(timesCalledLeftPan).toBe(1);
        expect(timesCalledStateChanged).toBe(2);
        expect(timesCalledRightPan).toBe(1);

        list.leftPan.unsubscribe();
        list.panStateChange.unsubscribe();
        list.rightPan.unsubscribe();

        unsubscribeEvents(list);
    });

    it('should pan right only.', () => {
        let timesCalledLeftPan = 0;
        let timesCalledStateChanged = 0;
        let timesCalledRightPan = 0;

        const fixture = TestBed.createComponent(ListWithPanningComponent);
        fixture.componentInstance.allowLeftPanning = false;

        fixture.detectChanges();

        const list: IgxListComponent = fixture.componentInstance.list;

        list.leftPan.subscribe(() => {
            timesCalledLeftPan++;
        });

        list.panStateChange.subscribe(() => {
            timesCalledStateChanged++;
        });

        list.rightPan.subscribe(() => {
            timesCalledRightPan++;
        });

        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));
        const listItems = list.items;

        /* Pan item right */
        panItem(itemNativeElements[0], 0.6);
        expect(listItems[0].panState).toBe(IgxListPanState.RIGHT);

        /* Pan item left */
        panItem(itemNativeElements[1], -0.6);
        expect(listItems[1].panState).toBe(IgxListPanState.NONE);

        expect(timesCalledLeftPan).toBe(0);
        expect(timesCalledStateChanged).toBe(1);
        expect(timesCalledRightPan).toBe(1);

        unsubscribeEvents(list);
    });

    it('should pan left only.', () => {
        let timesCalledLeftPan = 0;
        let timesCalledStateChanged = 0;
        let timesCalledRightPan = 0;

        const fixture = TestBed.createComponent(ListWithPanningComponent);
        fixture.componentInstance.allowRightPanning = false;
        fixture.detectChanges();

        const list: IgxListComponent = fixture.componentInstance.list;

        list.leftPan.subscribe(() => {
            timesCalledLeftPan++;
        });

        list.panStateChange.subscribe(() => {
            timesCalledStateChanged++;
        });

        list.rightPan.subscribe(() => {
            timesCalledRightPan++;
        });

        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));
        const listItems = list.items;

        /* Pan item left */
        panItem(itemNativeElements[0], -0.6);
        expect(listItems[0].panState).toBe(IgxListPanState.LEFT);

        /* Pan item right */
        panItem(itemNativeElements[1], 0.6);
        expect(listItems[1].panState).toBe(IgxListPanState.NONE);

        expect(timesCalledLeftPan).toBe(1);
        expect(timesCalledStateChanged).toBe(1);
        expect(timesCalledRightPan).toBe(0);

        unsubscribeEvents(list);
    });

    it('Should have default no items template.', () => {
        const fixture = TestBed.createComponent(EmptyListComponent);
        const list = fixture.componentInstance.list;
        const listNoItemsMessage = 'There are no items in the list.';

        fixture.detectChanges();

        verifyItemsCount(list, 0);
        expect(list.cssClass).toBeFalsy();
        expect(list.isListEmpty).toBeTruthy();

        const noItemsMessage = fixture.debugElement.query(By.css('.igx-list__message'));
        expect(noItemsMessage.nativeElement.textContent.trim()).toBe(listNoItemsMessage);
    });

    it('Should have custom no items template.', () => {
        const fixture = TestBed.createComponent(CustomEmptyListComponent);
        const list = fixture.componentInstance.list;
        const listCustomNoItemsTemplateContent = 'Custom no items message.';

        fixture.detectChanges();

        verifyItemsCount(list, 0);
        expect(list.cssClass).toBeFalsy();
        expect(list.isListEmpty).toBeTruthy();

        const noItemsParagraphEl = fixture.debugElement.query(By.css('h3'));
        expect(noItemsParagraphEl.nativeElement.textContent.trim()).toBe(listCustomNoItemsTemplateContent);
    });

    it('Should have default loading template.', () => {
        const fixture = TestBed.createComponent(ListLoadingComponent);
        const list = fixture.componentInstance.list;
        const listLoadingItemsMessage = 'Loading data from the server...';

        fixture.detectChanges();

        verifyItemsCount(list, 0);
        expect(list.cssClass).toBeFalsy();
        expect(list.isListEmpty).toBeTruthy();

        const noItemsMessage = fixture.debugElement.query(By.css('.igx-list__message'));
        expect(noItemsMessage.nativeElement.textContent.trim()).toBe(listLoadingItemsMessage);
    });

    it('Should show loading template when isLoading=\'true\' even when there are children.', () => {
        const fixture = TestBed.createComponent(ListWithHeaderComponent);
        const list = fixture.componentInstance.list;
        list.isLoading = true;
        const listLoadingItemsMessage = 'Loading data from the server...';

        fixture.detectChanges();

        verifyItemsCount(list, 3);

        const noItemsMessage = fixture.debugElement.query(By.css('.igx-list__message'));
        expect(noItemsMessage.nativeElement.textContent.trim()).toBe(listLoadingItemsMessage);

        list.isLoading = false;
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('p'))).toBeFalsy();
    });

    it('Should have custom loading template.', () => {
        const fixture = TestBed.createComponent(ListCustomLoadingComponent);
        const list = fixture.componentInstance.list;
        const listLoadingItemsMessage = 'Loading data...';

        fixture.detectChanges();

        verifyItemsCount(list, 0);
        expect(list.cssClass).toBeFalsy();
        expect(list.isListEmpty).toBeTruthy();

        const noItemsParagraphEl = fixture.debugElement.query(By.css('h3'));
        expect(noItemsParagraphEl.nativeElement.textContent.trim()).toBe(listLoadingItemsMessage);
    });

    it('should fire ItemClicked on click.', (done) => {
        let fixture;
        let list: IgxListComponent;
        let listItem: IgxListItemComponent;
        let timesCalled = 0;

        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(ListWithHeaderComponent);
            list = fixture.componentInstance.list;

            fixture.detectChanges();
            return fixture.whenStable();
        }).then(() => {

            list.itemClicked.subscribe((value) => {
                timesCalled++;
                listItem = value.item;
            });

            return clickItem(list.items[0]);
        }).then(() => {
            expect(timesCalled).toBe(1);
            expect(listItem.index).toBe(1);
            expect(listItem.element.textContent.trim()).toBe('Item 1');

            // Click the same item again and verify click is fired again
            return clickItem(list.items[0]);
        }).then(() => {
            expect(timesCalled).toBe(2);
            expect(listItem.index).toBe(1);

            // Click the header and verify click is fired
            return clickItem(list.headers[0]);
        }).then(() => {
            expect(timesCalled).toBe(3);
            expect(listItem.index).toBe(0);
            expect(listItem.element.textContent.trim()).toBe('Header');
            unsubscribeEvents(list);
            done();
        });
    }, 5000);

    it('should emit ItemClicked with correct direction argument when swiping left', (done) => {
        const fixture = TestBed.createComponent(ListWithPanningTemplatesComponent);
        const list = fixture.componentInstance.list;

        list.itemClicked.subscribe((eventArgs) => {
            expect(eventArgs.direction).toBe(IgxListPanState.LEFT);
            unsubscribeEvents(list);
            done();
        });

        fixture.detectChanges();
        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));
        panItemWithClick(itemNativeElements[1], -0.3); // operating over the second list item because the first one is a header
    });

    it('should emit ItemClicked with correct direction argument when panning left', (done) => {
        const fixture = TestBed.createComponent(ListWithPanningTemplatesComponent);
        const list = fixture.componentInstance.list;

        list.itemClicked.subscribe((eventArgs) => {
            expect(eventArgs.direction).toBe(IgxListPanState.LEFT);
            unsubscribeEvents(list);
            done();
        });

        fixture.detectChanges();
        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));
        panItemWithClick(itemNativeElements[1], -0.8); // operating over the second list item because the first one is a header
    });

    it('should emit ItemClicked with correct direction argument when swiping right', (done) => {
        const fixture = TestBed.createComponent(ListWithPanningTemplatesComponent);
        const list = fixture.componentInstance.list;

        list.itemClicked.subscribe((eventArgs) => {
            expect(eventArgs.direction).toBe(IgxListPanState.RIGHT);
            unsubscribeEvents(list);
            done();
        });

        fixture.detectChanges();
        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));
        panItemWithClick(itemNativeElements[1], 0.3); // operating over the second list item because the first one is a header
    });

    it('should emit ItemClicked with correct direction argument when panning right', (done) => {
        const fixture = TestBed.createComponent(ListWithPanningTemplatesComponent);
        const list = fixture.componentInstance.list;

        list.itemClicked.subscribe((eventArgs) => {
            expect(eventArgs.direction).toBe(IgxListPanState.RIGHT);
            unsubscribeEvents(list);
            done();
        });

        fixture.detectChanges();
        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));
        panItemWithClick(itemNativeElements[1], 0.8); // operating over the second list item because the first one is a header
    });

    it('should display multiple headers properly.', () => {
        const fixture = TestBed.createComponent(TwoHeadersListComponent);
        const list = fixture.componentInstance.list;

        fixture.detectChanges();

        verifyItemsCount(list, 3);
        verifyHeadersCount(list, 2);

        const headerClasses = fixture.debugElement.queryAll(By.css('.igx-list__header'));
        expect(headerClasses.length).toBe(2);
    });

    it('should set items\' isHeader property properly.', () => {
        const fixture = TestBed.createComponent(TwoHeadersListComponent);
        const list = fixture.componentInstance.list;

        fixture.detectChanges();

        const childrenArray = list.children.toArray();
        expect(childrenArray[0].isHeader).toBe(true);
        expect(childrenArray[1].isHeader).toBe(false);
        expect(childrenArray[2].isHeader).toBe(true);
        expect(childrenArray[3].isHeader).toBeFalsy();
        expect(childrenArray[4].isHeader).toBeFalsy();
    });

    it('should set items\' role property properly.', () => {
        const fixture = TestBed.createComponent(TwoHeadersListComponent);
        const list = fixture.componentInstance.list;

        fixture.detectChanges();

        const childrenArray = list.children.toArray();
        expect(childrenArray[0].role).toBe('separator');
        expect(childrenArray[1].role).toBe('listitem');
        expect(childrenArray[2].role).toBe('separator');
        expect(childrenArray[3].role).toBe('listitem');
        expect(childrenArray[4].role).toBe('listitem');
    });

    it('should hide items when hidden is true.', () => {
        const fixture = TestBed.createComponent(TwoHeadersListComponent);
        const list = fixture.componentInstance.list;

        fixture.detectChanges();

        const hiddenItems = list.items.filter((item) => item.hidden === true);
        expect(hiddenItems.length).toBe(1);

        const hiddenTags = list.children.filter((item) => item.element.style.display === 'none');
        expect(hiddenTags.length).toBe(1);
    });

    it('should not pan when panning is not allowed.', (done) => {
        let fixture;
        let list: IgxListComponent;
        let item: IgxListItemComponent;
        let elementRefCollection;

        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(TwoHeadersListNoPanningComponent);
            list = fixture.componentInstance.list;

            fixture.detectChanges();
            return fixture.whenStable();
        }).then(() => {

            item = list.items[0] as IgxListItemComponent;

            spyOn(list.leftPan, 'emit');
            spyOn(list.rightPan, 'emit');
            spyOn(list.panStateChange, 'emit');

            elementRefCollection = fixture.debugElement.queryAll(By.css('igx-list-item'));
            return panItem(elementRefCollection[1], 0.8);
        }).then(() => {
            expect(item.panState).toBe(IgxListPanState.NONE);

            elementRefCollection = fixture.debugElement.queryAll(By.css('igx-list-item'));
            return panItem(elementRefCollection[1], -0.8);
        }).then(() => {
            expect(item.panState).toBe(IgxListPanState.NONE);
            expect(list.leftPan.emit).toHaveBeenCalledTimes(0);
            expect(list.rightPan.emit).toHaveBeenCalledTimes(0);
            expect(list.panStateChange.emit).toHaveBeenCalledTimes(0);
            done();
        });
    }, 5000);

    it('checking the panLeftTemplate is visible when left-panning a list item.', () => {
        const fixture = TestBed.createComponent(ListWithPanningTemplatesComponent);
        const list = fixture.componentInstance.list;
        fixture.detectChanges();

        const firstItem = list.items[0] as IgxListItemComponent;
        const leftPanTmpl = firstItem.leftPanningTemplateElement;
        const rightPanTmpl = firstItem.rightPanningTemplateElement;
        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));

        /* Click and drag item left */
        clickAndDrag(itemNativeElements[1], -0.3);
        expect(leftPanTmpl.nativeElement.style.visibility).toBe('visible');
        expect(rightPanTmpl.nativeElement.style.visibility).toBe('hidden');
    });

    it('checking the panRightTemplate is visible when right-panning a list item.', () => {
        const fixture = TestBed.createComponent(ListWithPanningTemplatesComponent);
        const list = fixture.componentInstance.list;
        fixture.detectChanges();

        const firstItem = list.items[0] as IgxListItemComponent;
        const leftPanTmpl = firstItem.leftPanningTemplateElement;
        const rightPanTmpl = firstItem.rightPanningTemplateElement;
        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));

        /* Click and drag item right */
        clickAndDrag(itemNativeElements[1], 0.3);
        expect(leftPanTmpl.nativeElement.style.visibility).toBe('hidden');
        expect(rightPanTmpl.nativeElement.style.visibility).toBe('visible');
    });

    it('checking the panLeftTemplate is not visible when releasing a list item.', fakeAsync(() => {
        const fixture = TestBed.createComponent(ListWithPanningTemplatesComponent);
        const list = fixture.componentInstance.list;
        fixture.detectChanges();

        const firstItem = list.items[0] as IgxListItemComponent;
        const leftPanTmpl = firstItem.leftPanningTemplateElement;
        const rightPanTmpl = firstItem.rightPanningTemplateElement;
        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));

        /* Pan item left */
        panItem(itemNativeElements[1], -0.3);
        tick(600);
        expect(leftPanTmpl.nativeElement.style.visibility).toBe('hidden');
        expect(rightPanTmpl.nativeElement.style.visibility).toBe('hidden');
    }));

    it('checking the panRightTemplate is not visible when releasing a list item.', fakeAsync(() => {
        const fixture = TestBed.createComponent(ListWithPanningTemplatesComponent);
        const list = fixture.componentInstance.list;
        fixture.detectChanges();

        const firstItem = list.items[0] as IgxListItemComponent;
        const leftPanTmpl = firstItem.leftPanningTemplateElement;
        const rightPanTmpl = firstItem.rightPanningTemplateElement;
        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));

        /* Pan item right */
        panItem(itemNativeElements[1], 0.3);
        tick(600);
        expect(leftPanTmpl.nativeElement.style.visibility).toBe('hidden');
        expect(rightPanTmpl.nativeElement.style.visibility).toBe('hidden');
    }));

    it('checking the header list item does not have panning and content containers.', () => {
        const fixture = TestBed.createComponent(ListWithPanningTemplatesComponent);
        const list = fixture.componentInstance.list;
        fixture.detectChanges();

        const headers = list.headers;
        for (const header of headers) {
            expect(header.leftPanningTemplateElement).toBeUndefined();
            expect(header.rightPanningTemplateElement).toBeUndefined();
            expect(header.contentElement).toBe(null);
        }
    });

    it('checking the list item is returning back in the list when canceling the pan left event', () => {
        const fixture = TestBed.createComponent(ListWithPanningTemplatesComponent);
        const list = fixture.componentInstance.list;
        fixture.detectChanges();

        list.leftPan.subscribe((args) => {
            args.keepItem = true;
        });

        const firstItem = list.items[0] as IgxListItemComponent;
        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));
        panItem(itemNativeElements[1], -0.6);
        expect(firstItem.panState).toBe(IgxListPanState.NONE);
    });

    it('checking the list item is returning back in the list when canceling the pan right event', () => {
        const fixture = TestBed.createComponent(ListWithPanningTemplatesComponent);
        const list = fixture.componentInstance.list;
        fixture.detectChanges();

        list.rightPan.subscribe((args) => {
            args.keepItem = true;
        });

        const firstItem = list.items[0] as IgxListItemComponent;
        const itemNativeElements = fixture.debugElement.queryAll(By.css('igx-list-item'));
        panItem(itemNativeElements[1], 0.6);
        expect(firstItem.panState).toBe(IgxListPanState.NONE);
    });

    it('display density is properly applied', () => {
        const fixture = TestBed.createComponent(TwoHeadersListComponent);
        fixture.detectChanges();

        const list = fixture.componentInstance.list as IgxListComponent;
        const domList = fixture.debugElement.query(By.css('igx-list'));
        verifyDisplayDensity(list, domList, DisplayDensity.comfortable);

        list.displayDensity = DisplayDensity.compact;
        fixture.detectChanges();
        verifyDisplayDensity(list, domList, DisplayDensity.compact);

        list.displayDensity = DisplayDensity.cosy;
        fixture.detectChanges();
        verifyDisplayDensity(list, domList, DisplayDensity.cosy);

        list.displayDensity = DisplayDensity.comfortable;
        fixture.detectChanges();
        verifyDisplayDensity(list, domList, DisplayDensity.comfortable);
    });

    it('should emit onDensityChanged with proper event arguments', () => {
        const fixture = TestBed.createComponent(TwoHeadersListComponent);
        fixture.detectChanges();

        let oldDensity: DisplayDensity;
        let newDensity: DisplayDensity;
        const list = fixture.componentInstance.list as IgxListComponent;

        list.onDensityChanged.subscribe((args: IDensityChangedEventArgs) => {
            oldDensity = args.oldDensity;
            newDensity = args.newDensity;
        });

        list.displayDensity = DisplayDensity.compact;
        expect(oldDensity).toBeUndefined();
        expect(newDensity).toBe(DisplayDensity.compact);

        list.displayDensity = DisplayDensity.cosy;
        expect(oldDensity).toBe(DisplayDensity.compact);
        expect(newDensity).toBe(DisplayDensity.cosy);

        list.displayDensity = DisplayDensity.comfortable;
        expect(oldDensity).toBe(DisplayDensity.cosy);
        expect(newDensity).toBe(DisplayDensity.comfortable);

        unsubscribeEvents(list);
    });

    it('should allow setting the index of list items', (async () => {
        const fixture = TestBed.createComponent(ListWithIgxForAndScrollingComponent);
        fixture.detectChanges();
        await wait(50);

        fixture.componentInstance.igxFor.scrollTo(8);
        await wait(50);
        fixture.detectChanges();

        const items = fixture.debugElement.queryAll(By.css('igx-list-item'));
        const len = items.length;
        expect(items[0].nativeElement.textContent).toContain('2');
        expect(fixture.componentInstance.forOfList.items[0].index).toEqual(1);
        expect(items[len - 1].nativeElement.textContent).toContain('10');
        expect(fixture.componentInstance.forOfList.items[len - 1].index).toEqual(9);
    }));

    it('should return items as they appear in the list with virtualization', (async () => {
        const fixture = TestBed.createComponent(ListWithIgxForAndScrollingComponent);
        fixture.detectChanges();
        await wait(50);

        fixture.componentInstance.igxFor.scrollTo(6);
        await wait(50);
        fixture.detectChanges();

        const dItems = GridFunctions.sortDebugElementsVertically(fixture.debugElement.queryAll(By.css('igx-list-item')));
        const pItems = fixture.componentInstance.forOfList.items;
        const len = dItems.length;
        for (let i = 0; i < len; i++) {
            expect(dItems[i].nativeElement).toEqual(pItems[i].element);
        }
    }));

    it('Initializes igxListThumbnail directive', () => {
        const fixture = TestBed.createComponent(ListDirectivesComponent);
        fixture.detectChanges();
        const thumbnail = fixture.debugElement.query(By.directive(IgxListThumbnailDirective));

        expect(thumbnail).toBeDefined();
        // Check if the directive removes the classes from the target element
        expect(thumbnail.nativeElement).toHaveClass('igx-icon');
        // Check if the directive wraps the target element and sets the correct class on the parent element
        expect(thumbnail.parent.nativeElement).toHaveClass('igx-list__item-thumbnail');
    });

    it('Initializes igxListLine directive', () => {
        const fixture = TestBed.createComponent(ListDirectivesComponent);
        fixture.detectChanges();
        const listLine = fixture.debugElement.query(By.directive(IgxListLineDirective));

        expect(listLine).toBeDefined();
        // Check if the directive removes the classes from the target element
        expect(listLine.nativeElement).toHaveClass('text-line');
        // Check if the directive wraps the target element and sets the correct class on the parent element
        expect(listLine.parent.nativeElement).toHaveClass('igx-list__item-lines');
    });

    it('Initializes igxListAction directive', () => {
        const fixture = TestBed.createComponent(ListDirectivesComponent);
        fixture.detectChanges();
        const listLine = fixture.debugElement.query(By.directive(IgxListActionDirective));

        expect(listLine).toBeDefined();
        // Check if the directive removes the classes from the target element
        expect(listLine.nativeElement).toHaveClass('action-icon');
        // Check if the directive wraps the target element and sets the correct class on the parent element
        expect(listLine.parent.nativeElement).toHaveClass('igx-list__item-actions');
    });

    it('Initializes igxListLineTitle directive', () => {
        const fixture = TestBed.createComponent(ListDirectivesComponent);
        fixture.detectChanges();
        const listLine = fixture.debugElement.query(By.directive(IgxListLineTitleDirective));

        expect(listLine).toBeDefined();
        // Check if the directive removes the custom classes from the target element
        expect(listLine.nativeElement).toHaveClass('custom');
        // Check if the directive add the correct class on the target element
        expect(listLine.nativeElement).toHaveClass('igx-list__item-line-title');
        // Check if the directive wraps the target element and sets the correct class on the parent element
        expect(listLine.parent.nativeElement).toHaveClass('igx-list__item-lines');
    });

    it('Initializes igxListLineSubTitle directive', () => {
        const fixture = TestBed.createComponent(ListDirectivesComponent);
        fixture.detectChanges();
        const listLine = fixture.debugElement.query(By.directive(IgxListLineSubTitleDirective));

        expect(listLine).toBeDefined();
        // Check if the directive removes the custom classes from the target element
        expect(listLine.nativeElement).toHaveClass('custom');
        // Check if the directive add the correct class on the target element
        expect(listLine.nativeElement).toHaveClass('igx-list__item-line-subtitle');
        // Check if the directive wraps the target element and sets the correct class on the parent element
        expect(listLine.parent.nativeElement).toHaveClass('igx-list__item-lines');
    });

    /* factorX - the coefficient used to calculate deltaX.
    Pan left by providing negative factorX;
    Pan right - positive factorX.  */
    const panItem = (elementRefObject, factorX) => {
        const itemWidth = elementRefObject.nativeElement.offsetWidth;

        elementRefObject.triggerEventHandler('panstart', {
            deltaX: factorX < 0 ? -10 : 10
        });
        elementRefObject.triggerEventHandler('panmove', {
            deltaX: factorX * itemWidth, duration: 200
        });
        elementRefObject.triggerEventHandler('panend', null);
        return new Promise<void>(resolve => {
            resolve();
        });
    };

    const panItemWithClick = (elementRefObject, factorX) => {
        panItem(elementRefObject, factorX);
        elementRefObject.triggerEventHandler('click', null);
    };

    const clickAndDrag = (itemNativeElement, factorX) => {
        const itemWidth = itemNativeElement.nativeElement.offsetWidth;

        itemNativeElement.triggerEventHandler('panstart', {
            deltaX: factorX < 0 ? -10 : 10
        });
        itemNativeElement.triggerEventHandler('panmove', {
            deltaX: factorX * itemWidth, duration: 200
        });
    };

    const clickItem = (currentItem: IgxListItemComponent) => Promise.resolve(currentItem.element.click());

    const verifyItemsCount = (list, expectedCount) => {
        expect(list.items instanceof Array).toBeTruthy();
        expect(list.items.length).toBe(expectedCount);
    };

    const verifyHeadersCount = (list, expectedCount) => {
        expect(list.headers instanceof Array).toBeTruthy();
        expect(list.headers.length).toBe(expectedCount);
    };

    const unsubscribeEvents = list => {
        list.leftPan.unsubscribe();
        list.panStateChange.unsubscribe();
        list.rightPan.unsubscribe();
        list.itemClicked.unsubscribe();
        list.onDensityChanged.unsubscribe();
    };

    /**
     * Verifies the display density of the IgxList by providing the IgxListComponent,
     * the list DebugElement and the expected DisplayDensity enumeration value.
     */
    const verifyDisplayDensity = (listComp, listDebugEl, expectedDisplayDensity: DisplayDensity) => {
        let expectedListDensityClass;

        switch (expectedDisplayDensity) {
            case DisplayDensity.compact: expectedListDensityClass = LIST_COMPACT_DENSITY_CSS_CLASS; break;
            case DisplayDensity.cosy: expectedListDensityClass = LIST_COSY_DENSITY_CSS_CLASS; break;
            default: expectedListDensityClass = LIST_CSS_CLASS; break;
        }

        // Verify list display density.
        expect(listDebugEl.nativeElement.classList[0]).toBe(expectedListDensityClass);
        expect(listComp.displayDensity).toBe(expectedDisplayDensity);
        switch (expectedDisplayDensity) {
            case DisplayDensity.compact: {
                expect(listComp.cssClass).toBe(false);
                expect(listComp.cssClassCompact).toBe(true);
                expect(listComp.cssClassCosy).toBe(false);
            } break;
            case DisplayDensity.cosy: {
                expect(listComp.cssClass).toBe(false);
                expect(listComp.cssClassCompact).toBe(false);
                expect(listComp.cssClassCosy).toBe(true);
            } break;
            default: {
                expect(listComp.cssClass).toBe(true);
                expect(listComp.cssClassCompact).toBe(false);
                expect(listComp.cssClassCosy).toBe(false);
            } break;
        }
    };
});
