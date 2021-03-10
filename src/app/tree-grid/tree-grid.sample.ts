import { Component, ViewChild, OnInit } from '@angular/core';
import { IgxTreeGridComponent, IgxExcelExporterService, IgxCsvExporterService,
    IgxCsvExporterOptions, IgxExcelExporterOptions, CsvFileTypes, GridSelectionMode } from 'igniteui-angular';
import { HIERARCHICAL_SAMPLE_DATA } from '../shared/sample-data';

@Component({
    providers: [],
    selector: 'app-tree-grid-sample',
    styleUrls: ['tree-grid.sample.css'],
    templateUrl: 'tree-grid.sample.html'
})

export class TreeGridSampleComponent implements OnInit {
    @ViewChild('grid1', { static: true }) public grid1: IgxTreeGridComponent;

    public data: Array<any>;
    public columns: Array<any>;
    public selectionMode;
    public density = '';
    public displayDensities;
    public selectionModes: GridSelectionMode[] = ['none', 'single', 'multiple', 'multipleCascade'];

    private nextRow = 1;

    constructor(private excelExporterService: IgxExcelExporterService,
        private csvExporterService: IgxCsvExporterService) {
}
    public ngOnInit(): void {
        this.selectionMode = GridSelectionMode.multiple;
        this.displayDensities = [
            { label: 'compact', selected: this.density === 'compact', togglable: true },
            { label: 'cosy', selected: this.density === 'cosy', togglable: true },
            { label: 'comfortable', selected: this.density === 'comfortable', togglable: true }
        ];

        this.columns = [
            { field: 'ID', width: 150, resizable: true, movable: true, pinned: true },
            { field: 'CompanyName', width: 150, resizable: true, movable: true },
            { field: 'ContactName', width: 150, resizable: true, movable: true },
            { field: 'ContactTitle', width: 150, resizable: true, movable: true },
            { field: 'Address', width: 150, resizable: true, movable: true },
            { field: 'City', width: 150, resizable: true, movable: true },
            { field: 'Region', width: 150, resizable: true, movable: true },
            { field: 'PostalCode', width: 150, resizable: true, movable: true },
            { field: 'Phone', width: 150, resizable: true, movable: true },
            { field: 'Fax', width: 150, resizable: true, movable: true }
        ];
        this.data = HIERARCHICAL_SAMPLE_DATA.slice(0);
    }

    public addRow() {
        this.grid1.addRow({
            ID: `ADD${this.nextRow++}`,
            CompanyName: 'Around the Horn',
            ContactName: 'Thomas Hardy',
            ContactTitle: 'Sales Representative',
            Address: '120 Hanover Sq.',
            City: 'London',
            Region: null,
            PostalCode: 'WA1 1DP',
            Country: 'UK',
            Phone: '(171) 555-7788',
            Fax: '(171) 555-6750'
        });
    }

    public selectDensity(event) {
        this.density = this.displayDensities[event.index].label;
    }

    public addChildRow() {
        const selectedRowId = this.grid1.selectedRows[0];
        this.grid1.addRow (
            {
                ID: `ADD${this.nextRow++}`,
                CompanyName: 'Around the Horn',
                ContactName: 'Thomas Hardy',
                ContactTitle: 'Sales Representative',
                Address: '120 Hanover Sq.',
                City: 'London',
                Region: null,
                PostalCode: 'WA1 1DP',
                Country: 'UK',
                Phone: '(171) 555-7788',
                Fax: '(171) 555-6750'
            },
            selectedRowId);
    }

    public deleteRow() {
        this.grid1.deleteRow(this.grid1.selectedRows[0]);
    }

    public undo() {
        this.grid1.transactions.undo();
    }

    public redo() {
        this.grid1.transactions.redo();
    }

    public commit() {
        this.grid1.transactions.commit(this.data, this.grid1.primaryKey, this.grid1.childDataKey);
    }

    public exportToExcel() {
        this.excelExporterService.export(this.grid1, new IgxExcelExporterOptions('TreeGrid'));
    }

    public exportToCSV() {
        this.csvExporterService.export(this.grid1, new IgxCsvExporterOptions('TreeGrid', CsvFileTypes.CSV));
    }
}
