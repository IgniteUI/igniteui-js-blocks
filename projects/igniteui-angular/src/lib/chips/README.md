# igxChip Component

The **igxChip** is a compact visual component that displays information in an obround. A chip can be templated, deleted and selected. Multiple chips can be reordered and visually connected to each other. Chips reside in a container called chips area which is responsible for managing the interactions between the chips.

#### Initializing Chips

The `IgxChipComponent` is the main class for a chip element and the `IgxChipsAreaComponent` is the main class for the chip area. The chip area is used for handling more complex scenarios that require interaction between chips (dragging, selection, navigation, etc.). The `IgxChipComponent` has an `id` input so that the different chips can be easily distinguished. If `id` is not provided it will be automatically generated.

Example of using `igxChip` with `igxChipArea`:

```html
<igx-chips-area>
    <igx-chip *ngFor="let chip of chipList" [id]="chip.id">
        {{chip.text}}
    </igx-chip>
</igx-chips-area>
```

### Features

#### Selection

Selection can be enabled by setting an input called `selectable`. The selecting is done either by clicking on the chip itself or by using the `Tab` key to focus the chip and then pressing the `Space` key. If a chip is already selected it can be deselected by pressing the `Space` key again while the chip is focused or by clicking on it.

An event `onSelection` is fired when the selection state of the `igxChip` changes. It provides the new `selected` value so you can get the new state and the original event in `originalEvent` that triggered this selection change. If this is not done through user interaction but instead is done by setting the `selected` property programmatically the `originalEvent` argument has value `null`.

Also by default an icon is shown indicating that the chip is being selected. It is fully customizable and can be done through the `selectIcon` input. It accepts values of type `TemplateRef` and overrides the default icon while retaining the same functionality.

Example of customizing the select icon:

```html
<igx-chips-area #chipsArea>
    <igx-chip *ngFor="let chip of chipList" [selectable]="'true'" [selectIcon]="selectTemplate">
        {{chip.text}}
    </igx-chip>
</igx-chips-area>
<ng-template #selectTemplate>
    <igx-icon>done_outline</igx-icon>
</ng-template>
```

#### Removing

Removing can be enabled by setting the `removable` input to `true`. When enabled a remove button is rendered at the end of the chip. When the end-users performs any interaction like clicking on the remove button or pressing the `Delete` key while the chip is focused the `remove` event is emitted.

By default the chip does not remove itself from the template when the user wants to delete a chip. This needs to be handled manually using the `remove` event.

If you need to customize the remove icon use the `removeIcon` input. It takes a value of type `TemplateRef` and renders it instead of the default remove icon. This means that you can customize the remove button in any way while all the handling of it is still handled by the chip itself.

Example of handling chip removing and custom remove icon:
```html
<igx-chips-area #chipsArea>
    <igx-chip *ngFor="let chip of chipList" [id]="chip.id" [removable]="true" [removeIcon]="removeTemplate" (remove)="chipRemoved($event)">
        {{chip.text}}
    </igx-chip>
</igx-chips-area>
<ng-template #removeTemplate>
    <igx-icon>delete</igx-icon>
</ng-template>
```

```ts
public chipRemoved(event) {
    this.chipList = this.chipList.filter((item) => {
        return item.id !== event.owner.id;
    });
    this.cdr.detectChanges();
}
```

#### Moving/Dragging

The chip can be dragged by the end-user in order to change its position. The moving/dragging is disabled by default, but can be enabled by setting an input `draggable`. The actual moving of the chip in the template has to be handled manually by the developer.

```html
<igx-chips-area #chipArea (onReorder)="chipsOrderChanged($event)">
    <igx-chip *ngFor="let chip of chipList" [draggable]="'true'">
        {{chip.text}}
    </igx-chip>
</igx-chips-area>
```

```ts
public ngOnInit() {
    chipArea.forEach((chip) => {
        chip.draggable = true;
    });
}

public chipsOrderChanged(event) {
    const newChipList = [];
    for (const chip of event.chipsArray) {
        const chipItem = this.chipList.filter((item) => {
            return item.id === chip.id;
        })[0];
        newChipList.push(chipItem);
    }
    this.chipList = newChipList;
}

```

#### Chip Templates

The `IgxChipComponent`'s main structure consists of chip content, `select icon`, `remove button`, `prefix` and `suffix`. All of those elements are templatable.

The content of the chip is taken by the content defined inside the chip template except elements that define the `prefix`or `suffix` of the chip. You can define any type of content you need.

The `prefix` and `suffix` are also elements inside the actual chip area where they can be templated by your preference. The way they can be specified is by using the `IgxPrefix` and `IxgSuffix` directives respectively.

Example of using an icon for a `prefix`, text for content and a custom icon again for a `suffix`:

```html
<igx-chip *ngFor="let chip of chipList" [id]="chip.id">
    <igx-icon igxPrefix>drag_indicator</igx-icon>
    {{chip.text}}
    <igx-icon igxSuffix>close</igx-icon>
</igx-chip>
```

#### Keyboard Navigation

The chips can be focused using the `Tab` key or by clicking on them. Chips can be reordered using the keyboard navigation:

- Keyboard controls when the chip is focused:

  - <kbd>LEFT</kbd> - Moves the focus to the chip on the left.
  - <kbd>RIGHT</kbd> - Focuses the chip on the right.
  - <kbd>SPACE</kbd> - Toggles chip selection if it is selectable.
  - <kbd>DELETE</kbd> - Triggers the `remove` event for the `igxChip` so the chip deletion can be handled manually
  - <kbd>SHIFT</kbd> + <kbd>LEFT</kbd> - Triggers `onReorder` event for the `igxChipArea` when the currently focused chip should move position to the left.
  - <kbd>SHIFT</kbd> + <kbd>RIGHT</kbd> - Triggers `onReorder` event for the `igxChipArea` when the currently focused chip should move one position to the right

- Keyboard controls when the remove button is focused:

  - <kbd>SPACE</kbd> or <kbd>ENTER</kbd> Triggers the `remove` event so the chip deletion can be handled manually

# API

## IgxChipComponent

### Inputs
| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `id` | `string` | Unique identifier of the component. |
| `data` | `any` | Stores data related to the chip. |
| `draggable ` | `boolean` | Defines if the chip can be dragged in order to change its position. |
| `removable ` | `boolean` | Defines if the chip should render remove button and throw remove events. |
| `removeIcon ` | `TemplateRef` | Overrides the default remove icon when `removable` is set to `true`. |
| `selectable ` | `boolen` | Defines if the chip can be selected on click or through navigation. |
| `selectIcon ` | `TemplateRef` | Overrides the default select icon when `selectable` is set to `true`. |
| `selected` | `boolen` | Sets if the chip is selected. |
| `disabled` | `boolean` | Sets if the chip is disabled. |
| `displayDensity`| `DisplayDensity | string` | Sets the chip theme. Available options are `compact`, `cosy`, `comfortable`. |
| `color` | `string` | Sets the chip background color. |
| `hideBaseOnDrag` | `boolean` | Sets if the chip base should be hidden when the chip is dragged. |

### Outputs
| Name | Argument Type | Description |
|:--:|:---|:---|
| `moveStart` | `IBaseChipEventArgs` | Fired when the chip moving(dragging) starts. |
| `moveEnd` | `IBaseChipEventArgs` | Fired when the chip moving(dragging) ends. |
| `remove ` | `IBaseChipEventArgs` | Fired when the chip remove button is clicked. |
| `chipClick ` | `IChipClickEventArgs` | Fired when the chip is clicked instead of dragged. |
| `selectedChanging` | `IChipSelectEventArgs` | Fired when the chip is being selected/deselected. Cancellable |
| `selectedChange`   | | 
| `selectedChanging` | `IChipSelectEventArgs` | Fired when the chip is being selected/deselected. Cancellable |
| `keyDown ` | `IChipKeyDownEventArgs` | Fired when the chip keyboard navigation is being used. |
| `dragEnter ` | `IChipEnterDragAreaEventArgs` | Fired when another chip has entered the current chip area. |

## IgxChipsAreaComponent

### Inputs
| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `width` | `number` | Sets the width of the chips area. |
| `height ` | `number` | Sets the height of the chips area. |

### Outputs
| Name | Argument Type | Description |
|:--:|:---|:---|
| `reorder ` | `IChipsAreaReorderEventArgs` | Fired when the chips order should be changed(from dragging). Requires custom logic for actual reorder. |
| `selectionChange ` | `IChipsAreaSelectEventArgs` | Fired for all initially selected chips and when chip is being selected/deselected. |
| `moveStart  ` | `IBaseChipsAreaEventArgs` | Fired when any chip moving(dragging) starts. |
| `moveEnd ` | `IBaseChipsAreaEventArgs` | Fired when any chip moving(dragging) ends. |

### Properties
| Name   | Return Type | Description |
|:----------:|:------|:------|
| `chipsList` | `QueryList<IgxChipComponent>` | Returns the list of chips inside the chip area. |
