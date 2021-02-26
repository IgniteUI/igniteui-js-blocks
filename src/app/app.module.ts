import { TreeGridAddRowSampleComponent } from './tree-grid-add-row/tree-grid-add-row.sample';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import {
    IgxIconModule, IgxGridModule, IgxExcelExporterService, IgxCsvExporterService, IgxOverlayService,
    IgxDragDropModule, IgxDividerModule, IgxTreeGridModule,  IgxHierarchicalGridModule, IgxInputGroupModule,
    IgxIconService, DisplayDensityToken, DisplayDensity,
    IgxDateTimeEditorModule, IgxDateRangePickerModule, IgxButtonModule, IgxActionStripModule, GridBaseAPIService
} from 'igniteui-angular';
import { SharedModule } from './shared/shared.module';

import { routing } from './routing';
import { ActionStripSampleComponent } from './action-strip/action-strip.sample';
import { AppComponent } from './app.component';
import { AvatartSampleComponent } from './avatar/avatar.sample';
import { PageHeaderComponent } from './pageHeading/pageHeading.component';
import { BadgeSampleComponent } from './badge/badge.sample';
import { ButtonSampleComponent } from './button/button.sample';
import { CalendarSampleComponent } from './calendar/calendar.sample';
import { CardSampleComponent } from './card/card.sample';
import { CarouselSampleComponent } from './carousel/carousel.sample';
import { ChipsSampleComponent } from './chips/chips.sample';
import { DatePickerSampleComponent } from './date-picker/date-picker.sample';
import { DialogSampleComponent } from './dialog/dialog.sample';
import { DragDropSampleComponent } from './drag-drop/drag-drop.sample';
import { MaskSampleComponent, DisplayFormatPipe, InputFormatPipe } from './mask/mask.sample';
import { IconSampleComponent } from './icon/icon.sample';
import { InputSampleComponent } from './input/input.sample';
import { InputGroupSampleComponent } from './input-group/input-group.sample';
import { LayoutSampleComponent } from './layout/layout.sample';
import { ListSampleComponent } from './list/list.sample';
import { ListPanningSampleComponent } from './list-panning/list-panning.sample';
import { ListPerformanceSampleComponent } from './list-performance/list-performance.sample';
import { NavbarSampleComponent } from './navbar/navbar.sample';
import { NavdrawerSampleComponent } from './navdrawer/navdrawer.sample';
import { ProgressbarSampleComponent } from './progressbar/progressbar.sample';
import { RippleSampleComponent } from './ripple/ripple.sample';
import { SliderSampleComponent } from './slider/slider.sample';
import { SplitterSampleComponent } from './splitter/splitter.sample';
import { SnackbarSampleComponent } from './snackbar/snackbar.sample';
import { ColorsSampleComponent } from './styleguide/colors/color.sample';
import { ShadowsSampleComponent } from './styleguide/shadows/shadows.sample';
import { TypographySampleComponent } from './styleguide/typography/typography.sample';
import { BottomNavSampleComponent, CustomContentComponent } from './bottomnav/bottomnav.sample';
import { BottomNavRoutingSampleComponent } from './bottomnav-routing/bottomnav-routing.sample';
import {
    BottomNavRoutingView1Component,
    BottomNavRoutingView2Component,
    BottomNavRoutingView3Component
} from './bottomnav-routing/bottomnav-routing-views.sample';
import { TabsSampleComponent } from './tabs/tabs.sample';
import { TabsRoutingSampleComponent } from './tabs-routing/tabs-routing.sample';
import {
    TabsRoutingView1Component,
    TabsRoutingView2Component,
    TabsRoutingView3Component
} from './tabs-routing/tabs-routing-views.sample';
import { TimePickerSampleComponent } from './time-picker/time-picker.sample';
import { ToastSampleComponent } from './toast/toast.sample';
import { RemoteService } from './shared/remote.service';
import { VirtualForSampleComponent } from './virtual-for-directive/virtual-for.sample';
import { LocalService } from './shared/local.service';
import { GridCellEditingComponent } from './grid-cellEditing/grid-cellEditing.component';
import { GridSampleComponent } from './grid/grid.sample';
import { GridColumnMovingSampleComponent } from './grid-column-moving/grid-column-moving.sample';
import { GridColumnPinningSampleComponent } from './grid-column-pinning/grid-column-pinning.sample';
import { GridColumnResizingSampleComponent } from './grid-column-resizing/grid-column-resizing.sample';
import { GridSummaryComponent } from './grid-summaries/grid-summaries.sample';
import { GridPerformanceSampleComponent } from './grid-performance/grid-performance.sample';
import { GridRemotePagingSampleComponent } from './grid-remote-paging/grid-remote-paging.sample';
import { GridSelectionComponent } from './grid-selection/grid-selection.sample';
import { GridRowDraggableComponent } from './grid-row-draggable/grid-row-draggable.sample';
import { GridToolbarSampleComponent } from './grid-toolbar/grid-toolbar.sample';
import { GridToolbarCustomSampleComponent } from './grid-toolbar/grid-toolbar-custom.sample';
import { GridVirtualizationSampleComponent } from './grid-remote-virtualization/grid-remote-virtualization.sample';
import { ButtonGroupSampleComponent } from './buttonGroup/buttonGroup.sample';
import { GridColumnGroupsSampleComponent } from './grid-column-groups/grid-column-groups.sample';
import { GridCellStylingSampleComponent } from './gird-cell-styling/grid-cell-styling.sample';
import { GridGroupBySampleComponent } from './grid-groupby/grid-groupby.sample';
import { DropDownSampleComponent } from './drop-down/drop-down.sample';
import { DisplayDensityDropDownComponent } from './drop-down/display-density/display-density.sample';
import { DropDownVirtualComponent } from './drop-down/drop-down-virtual/drop-down-virtual.component';
import { ComboSampleComponent } from './combo/combo.sample';
import { OverlaySampleComponent } from './overlay/overlay.sample';
import { OverlayAnimationSampleComponent } from './overlay/overlay-animation.sample';
import { OverlayPresetsSampleComponent } from './overlay/overlay-presets.sample';
import { RadioSampleComponent } from './radio/radio.sample';
import { TooltipSampleComponent } from './tooltip/tooltip.sample';
import { ExpansionPanelSampleComponent } from './expansion-panel/expansion-panel-sample';
import { GridRowEditSampleComponent } from './grid-row-edit/grid-row-edit-sample.component';
import { GridWithTransactionsComponent } from './grid-row-edit/grid-with-transactions.component';
import { TreeGridSampleComponent } from './tree-grid/tree-grid.sample';
import { TreeGridFlatDataSampleComponent } from './tree-grid-flat-data/tree-grid-flat-data.sample';
import { HierarchicalGridSampleComponent } from './hierarchical-grid/hierarchical-grid.sample';
import { HierarchicalGridRemoteSampleComponent } from './hierarchical-grid-remote/hierarchical-grid-remote.sample';
import { HierarchicalGridUpdatingSampleComponent } from './hierarchical-grid-updating/hierarchical-grid-updating.sample';
import { GridColumnPercentageWidthsSampleComponent } from './grid-percentage-columns/grid-percantge-widths.sample';
import { BannerSampleComponent } from './banner/banner.sample';
import { TreeGridWithTransactionsComponent } from './tree-grid/tree-grid-with-transactions.component';
import { CalendarViewsSampleComponent } from './calendar-views/calendar-views.sample';
import { SelectSampleComponent } from './select/select.sample';
import { GridSearchBoxComponent } from './grid-search-box/grid-search-box.component';
import { GridSearchComponent } from './grid-search/grid-search.sample';
import { AutocompleteSampleComponent, AutocompletePipeContains, AutocompleteGroupPipeContains } from './autocomplete/autocomplete.sample';
import { GridMRLSampleComponent } from './grid-multi-row-layout/grid-mrl.sample';
import { TreeGridLoadOnDemandSampleComponent } from './tree-grid-load-on-demand/tree-grid-load-on-demand.sample';
import { GridFilterTemplateSampleComponent } from './grid-filter-template/grid-filter-template.sample';
import { GridMRLConfigSampleComponent } from './grid-multi-row-layout-config/grid-mrl-config.sample';
import { GridMRLCustomNavigationSampleComponent } from './grid-mrl-custom-navigation/grid-mrl-custom-navigation';
import { GridClipboardSampleComponent } from './grid-clipboard/grid-clipboard.sample';
import { GridAutoSizeSampleComponent } from './grid-auto-size/grid-auto-size.sample';
import { GridFlexSampleComponent } from './grid-flex-layout/grid-flex.sample';
import { GridEsfLoadOnDemandComponent } from './grid-esf-load-on-demand/grid-esf-load-on-demand.component';
import { GridFilteringComponent } from './grid-filtering/grid-filtering.sample';
import { GridExternalFilteringComponent } from './grid-external-filtering/grid-external-filtering.sample';
import { AboutComponent } from './grid-state/about.component';
import { GridSaveStateComponent } from './grid-state/grid-state.component';
import { GridMasterDetailSampleComponent } from './grid-master-detail/grid-master-detail.sample';
import { DateTimeEditorSampleComponent } from './date-time-editor/date-time-editor.sample';
import { GridColumnSelectionSampleComponent, GridColumnSelectionFilterPipe } from './grid-column-selection/grid-column-selection.sample';
import { ReactiveFormSampleComponent } from './reactive-from/reactive-form-sample.component';
import { GridRowPinningSampleComponent } from './grid-row-pinning/grid-row-pinning.sample';
import { DateRangeSampleComponent } from './date-range/date-range.sample';
import {
    HierarchicalGridRemoteVirtualizationComponent
} from './hierarchical-grid-remote-virtualization/hierarchical-grid-remote-virtualization';
import { HierarchicalRemoteService } from './hierarchical-grid-remote-virtualization/hierarchical-remote.service';
import { IgxGridHierarchicalPipe } from 'igniteui-angular';
import { GridVirtualizationScrollSampleComponent } from './grid-remote-virtualization-with-scroll/grid-remote-virtualization-scroll.sample';
import { GridNestedPropsSampleComponent } from './grid-nested-props/grid-nested-props.sample';
import { GridColumnActionsSampleComponent } from './grid-column-actions/grid-column-actions.sample';
import { IgxColumnGroupingDirective } from './grid-column-actions/custom-action-directive';
import { GridAddRowSampleComponent } from './grid-add-row/grid-add-row.sample';
import { HierarchicalGridAddRowSampleComponent } from './hierarchical-grid-add-row/hierarchical-grid-add-row.sample';
import { AnimationsSampleComponent } from './styleguide/animations/animations.sample';
import { GridFormattingComponent } from './grid-formatting/grid-formatting.component';
import { GridFinJSComponent } from './grid-finjs/grid-finjs.component';
import { MainComponent } from './grid-finjs/main.component';
import { ControllerComponent } from './grid-finjs/controllers.component';
import { CommonModule } from '@angular/common';
import { GridEventsComponent } from './grid-events/grid-events.component';
import { IgxPickerIconsModule } from 'projects/igniteui-angular/src/lib/date-common/picker-icons.common';

const components = [
    ActionStripSampleComponent,
    AppComponent,
    AutocompletePipeContains,
    AutocompleteGroupPipeContains,
    AutocompleteSampleComponent,
    AvatartSampleComponent,
    BadgeSampleComponent,
    BannerSampleComponent,
    ButtonSampleComponent,
    CalendarSampleComponent,
    CardSampleComponent,
    CarouselSampleComponent,
    ExpansionPanelSampleComponent,
    ChipsSampleComponent,
    DialogSampleComponent,
    DatePickerSampleComponent,
    DropDownSampleComponent,
    DisplayDensityDropDownComponent,
    DropDownVirtualComponent,
    DragDropSampleComponent,
    ComboSampleComponent,
    IconSampleComponent,
    InputSampleComponent,
    InputGroupSampleComponent,
    LayoutSampleComponent,
    ListSampleComponent,
    ListPanningSampleComponent,
    ListPerformanceSampleComponent,
    MaskSampleComponent,
    DateTimeEditorSampleComponent,
    NavbarSampleComponent,
    NavdrawerSampleComponent,
    OverlaySampleComponent,
    OverlayAnimationSampleComponent,
    OverlayPresetsSampleComponent,
    PageHeaderComponent,
    ProgressbarSampleComponent,
    RippleSampleComponent,
    SelectSampleComponent,
    SliderSampleComponent,
    SplitterSampleComponent,
    SnackbarSampleComponent,
    BottomNavSampleComponent,
    BottomNavRoutingSampleComponent,
    BottomNavRoutingView1Component,
    BottomNavRoutingView2Component,
    BottomNavRoutingView3Component,
    TabsSampleComponent,
    TabsRoutingSampleComponent,
    TabsRoutingView1Component,
    TabsRoutingView2Component,
    TabsRoutingView3Component,
    TimePickerSampleComponent,
    ToastSampleComponent,
    VirtualForSampleComponent,
    ButtonGroupSampleComponent,
    GridCellEditingComponent,
    GridSampleComponent,
    GridAddRowSampleComponent,
    HierarchicalGridAddRowSampleComponent,
    TreeGridAddRowSampleComponent,
    GridColumnMovingSampleComponent,
    GridColumnSelectionSampleComponent,
    GridColumnSelectionFilterPipe,
    GridColumnPinningSampleComponent,
    GridColumnActionsSampleComponent,
    GridRowPinningSampleComponent,
    GridColumnResizingSampleComponent,
    GridGroupBySampleComponent,
    GridMasterDetailSampleComponent,
    GridSummaryComponent,
    GridPerformanceSampleComponent,
    GridSelectionComponent,
    GridRowDraggableComponent,
    GridToolbarSampleComponent,
    GridToolbarCustomSampleComponent,
    GridVirtualizationSampleComponent,
    GridColumnGroupsSampleComponent,
    GridMRLSampleComponent,
    GridMRLConfigSampleComponent,
    GridMRLCustomNavigationSampleComponent,
    GridCellStylingSampleComponent,
    GridRowEditSampleComponent,
    GridWithTransactionsComponent,
    TreeGridSampleComponent,
    TreeGridFlatDataSampleComponent,
    TreeGridWithTransactionsComponent,
    TreeGridLoadOnDemandSampleComponent,
    CustomContentComponent,
    ColorsSampleComponent,
    AnimationsSampleComponent,
    ShadowsSampleComponent,
    TypographySampleComponent,
    RadioSampleComponent,
    TooltipSampleComponent,
    HierarchicalGridSampleComponent,
    HierarchicalGridRemoteSampleComponent,
    HierarchicalGridRemoteVirtualizationComponent,
    HierarchicalGridUpdatingSampleComponent,
    DisplayFormatPipe,
    InputFormatPipe,
    GridColumnPercentageWidthsSampleComponent,
    CalendarViewsSampleComponent,
    GridSearchBoxComponent,
    GridSearchComponent,
    GridFilterTemplateSampleComponent,
    GridClipboardSampleComponent,
    GridAutoSizeSampleComponent,
    GridFlexSampleComponent,
    GridEsfLoadOnDemandComponent,
    GridFormattingComponent,
    GridEventsComponent,
    GridFilteringComponent,
    GridFinJSComponent,
    MainComponent,
    ControllerComponent,
    GridExternalFilteringComponent,
    GridSaveStateComponent,
    AboutComponent,
    ReactiveFormSampleComponent,
    DateRangeSampleComponent,
    GridRemotePagingSampleComponent,
    GridVirtualizationScrollSampleComponent,
    GridNestedPropsSampleComponent,
    IgxColumnGroupingDirective
];

@NgModule({
    declarations: components,
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HammerModule,
        FormsModule,
        CommonModule,
        ReactiveFormsModule,
        HttpClientModule,
        IgxIconModule,
        IgxInputGroupModule,
        IgxActionStripModule,
        IgxGridModule,
        IgxTreeGridModule,
        IgxHierarchicalGridModule,
        IgxDragDropModule,
        IgxDateRangePickerModule,
        IgxPickerIconsModule,
        IgxDividerModule,
        SharedModule,
        routing,
        HammerModule,
        IgxDateTimeEditorModule,
        IgxButtonModule
    ],
    providers: [
        LocalService,
        RemoteService,
        HierarchicalRemoteService,
        GridBaseAPIService,
        IgxGridHierarchicalPipe,
        IgxExcelExporterService,
        IgxIconService,
        IgxCsvExporterService,
        IgxOverlayService,
        { provide: DisplayDensityToken, useFactory: () => ({ displayDensity: DisplayDensity.comfortable }) }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
