import * as JSZip from 'jszip';

import { EventEmitter, Injectable } from '@angular/core';
import { ExcelElementsFactory } from './excel-elements-factory';
import { ExcelFolderTypes } from './excel-enums';
import { IgxExcelExporterOptions } from './excel-exporter-options';
import { IExcelFolder } from './excel-interfaces';
import { IExportRecord, IgxBaseExporter } from '../exporter-common/base-export-service';
import { ExportUtilities } from '../exporter-common/export-utilities';
import { WorksheetData } from './worksheet-data';
import { IBaseEventArgs } from '../../core/utils';
import { WorksheetFile } from './excel-files';

export interface IExcelExportEndedEventArgs extends IBaseEventArgs {
    xlsx?: JSZip;
}

/**
 * **Ignite UI for Angular Excel Exporter Service** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/exporter_excel.html)
 *
 * The Ignite UI for Angular Excel Exporter service can export data in Microsoft® Excel® format from both raw data
 * (array) or from an `IgxGrid`.
 *
 * Example:
 * ```typescript
 * public localData = [
 *   { Name: "Eric Ridley", Age: "26" },
 *   { Name: "Alanis Brook", Age: "22" },
 *   { Name: "Jonathan Morris", Age: "23" }
 * ];
 *
 * constructor(private excelExportService: IgxExcelExporterService) {
 * }
 *
 * this.excelExportService.exportData(this.localData, new IgxExcelExporterOptions("FileName"));
 * ```
 */
@Injectable()
export class IgxExcelExporterService extends IgxBaseExporter {
    private static ZIP_OPTIONS = { compression: 'DEFLATE', type: 'base64' } as JSZip.JSZipGeneratorOptions<'base64'>;

    /**
     * This event is emitted when the export process finishes.
     * ```typescript
     * this.exporterService.exportEnded.subscribe((args: IExcelExportEndedEventArgs) => {
     * // put event handler code here
     * });
     * ```
     *
     * @memberof IgxExcelExporterService
     */
    public exportEnded = new EventEmitter<IExcelExportEndedEventArgs>();

    private _xlsx: JSZip;

    private static async populateFolderAsync(folder: IExcelFolder, zip: JSZip, worksheetData: WorksheetData) {
        for (const childFolder of folder.childFolders(worksheetData)) {
            const folderInstance = ExcelElementsFactory.getExcelFolder(childFolder);
            const zipFolder = zip.folder(folderInstance.folderName);
            await IgxExcelExporterService.populateFolderAsync(folderInstance, zipFolder, worksheetData);
        }

        for (const childFile of folder.childFiles(worksheetData)) {
            const fileInstance = ExcelElementsFactory.getExcelFile(childFile);
            if (fileInstance instanceof WorksheetFile) {
                await (fileInstance as WorksheetFile).writeElementAsync(zip, worksheetData);
            } else {
                fileInstance.writeElement(zip, worksheetData);
            }
        }
    }

    protected exportDataImplementation(data: IExportRecord[], options: IgxExcelExporterOptions): void {
        const level = data[0]?.level;

        if (typeof level !== 'undefined') {
            let maxLevel = 0;

            data.forEach((r) => {
                maxLevel = Math.max(maxLevel, r.level);
            });

            if (maxLevel > 7) {
                throw Error('Can create an outline of up to eight levels!');
            }
        }

        const worksheetData = new WorksheetData(data, this.columnWidthList, options, this._indexOfLastPinnedColumn, this._sort);

        this._xlsx = new (JSZip as any).default();

        const rootFolder = ExcelElementsFactory.getExcelFolder(ExcelFolderTypes.RootExcelFolder);

        IgxExcelExporterService.populateFolderAsync(rootFolder, this._xlsx, worksheetData)
        .then(() => {
            this._xlsx.generateAsync(IgxExcelExporterService.ZIP_OPTIONS).then((result) => {
                this.saveFile(result, options.fileName);
                this.exportEnded.emit({ xlsx: this._xlsx });
            });
        });
    }

    private saveFile(data: string, fileName: string): void {
        const blob = new Blob([ExportUtilities.stringToArrayBuffer(atob(data))], {
            type: ''
        });

        ExportUtilities.saveBlobToFile(blob, fileName);
    }
}
