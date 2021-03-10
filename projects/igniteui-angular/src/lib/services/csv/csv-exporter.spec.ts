import { ExportUtilities } from '../exporter-common/export-utilities';
import { IgxCsvExporterService } from './csv-exporter';
import { CsvFileTypes, IgxCsvExporterOptions } from './csv-exporter-options';
import { CSVWrapper } from './csv-verification-wrapper.spec';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { first } from 'rxjs/operators';

import { configureTestSuite } from '../../test-utils/configure-suite';

describe('CSV exporter', () => {
    configureTestSuite();
    let exporter: IgxCsvExporterService;
    const fileTypes = [ CsvFileTypes.CSV, CsvFileTypes.TSV, CsvFileTypes.TAB ];

    beforeEach(() => {
        exporter = new IgxCsvExporterService();

        // Spy the saveBlobToFile method so the files are not really created
        spyOn(ExportUtilities as any, 'saveBlobToFile');
    });
    afterEach(() => {
        exporter.columnExporting.unsubscribe();
        exporter.rowExporting.unsubscribe();
    });

    /* ExportData() tests */
    for (const fileType of fileTypes) {
        const typeName = CsvFileTypes[fileType];
        const options = new IgxCsvExporterOptions('Test' + typeName, fileType);

        it(typeName + ' should not fail when data is empty.', async () => {
            const wrapper = await getExportedData([], options);
            wrapper.verifyData('');
        });

        it(typeName + ' should export empty objects successfully.', async () => {
            const wrapper = await getExportedData(SampleTestData.emptyObjectData(), options);
            wrapper.verifyData('');
        });

        it(typeName + ' should export string data without headers successfully.', async () => {
            const wrapper = await getExportedData(SampleTestData.stringArray(), options);
            wrapper.verifyData(wrapper.noHeadersStringData);
        });

        it(typeName + ' should export number data without headers successfully.', async () => {
            const wrapper = await getExportedData(SampleTestData.numbersArray(), options);
            wrapper.verifyData(wrapper.noHeadersNumberData);
        });

        it(typeName + ' should export date time data without headers successfully.', async () => {
            const wrapper = await getExportedData(SampleTestData.dateArray(), options);
            wrapper.verifyData(wrapper.noHeadersDateTimeData);
        });

        it(typeName + ' should export object data without headers successfully.', async () => {
            const wrapper = await getExportedData(SampleTestData.noHeadersObjectArray(), options);
            wrapper.verifyData(wrapper.noHeadersObjectData);
        });

        it(typeName + ' should export regular data successfully.', async () => {
            const wrapper = await getExportedData(SampleTestData.contactsData(), options);
            wrapper.verifyData(wrapper.contactsData);
        });

        it(typeName + ' should export data with missing values successfully.', async () => {
            const wrapper = await getExportedData(SampleTestData.contactsDataPartial(), options);
            wrapper.verifyData(wrapper.contactsPartialData);
        });

        it(typeName + ' should export data with special characters successfully.', async () => {
            const wrapper = await getExportedData(SampleTestData.getContactsFunkyData(options.valueDelimiter), options);
            wrapper.verifyData(wrapper.contactsFunkyData);
        });
    }

    it('CSV should export data with a custom delimiter successfully.', async () => {
        const options = new IgxCsvExporterOptions('CustomDelimiter', CsvFileTypes.CSV);
        options.valueDelimiter = '###';
        const wrapper = await getExportedData(SampleTestData.getContactsFunkyData(options.valueDelimiter), options);
        wrapper.verifyData(wrapper.contactsFunkyData);
    });

    it('CSV should use a default delimiter when given an invalid one.', async () => {
        const options = new IgxCsvExporterOptions('InvalidDelimiter', CsvFileTypes.CSV);
        options.valueDelimiter = '';
        await getExportedData(SampleTestData.contactsData(), options);
        expect(options.valueDelimiter).toBe(',');
    });

    it('CSV should overwrite file type successfully.', async () => {
        const options = new IgxCsvExporterOptions('Export', CsvFileTypes.CSV);
        options.fileType = CsvFileTypes.TAB;
        await getExportedData(SampleTestData.getContactsFunkyData('\t'), options);
        expect(options.fileName.endsWith('.tab')).toBe(true);
    });

    it('should fire \'columnExporting\' for each data field.', async () => {
        const options = new IgxCsvExporterOptions('ExportEvents', CsvFileTypes.CSV);
        const cols = [];
        exporter.columnExporting.subscribe((value) => {
            cols.push({ header: value.header, index: value.columnIndex });
        });

        await getExportedData(SampleTestData.personJobData(), options);
        expect(cols.length).toBe(3);
        expect(cols[0].header).toBe('ID');
        expect(cols[0].index).toBe(0);
        expect(cols[1].header).toBe('Name');
        expect(cols[1].index).toBe(1);
        expect(cols[2].header).toBe('JobTitle');
        expect(cols[2].index).toBe(2);
    });

    it('should fire \'rowExporting\' for each data row.', async () => {
        const options = new IgxCsvExporterOptions('ExportEvents', CsvFileTypes.CSV);
        const rows = [];
        exporter.rowExporting.subscribe((value) => {
            rows.push({ data: value.rowData, index: value.rowIndex });
        });

        await getExportedData(SampleTestData.personJobData(), options);
        expect(rows.length).toBe(10);
        for (let i = 0; i < rows.length; i++) {
            expect(rows[i].index).toBe(i);
            expect(JSON.stringify(rows[i].data)).toBe(JSON.stringify(SampleTestData.personJobData()[i]));
        }
    });

    const getExportedData = (data: any[], csvOptions: IgxCsvExporterOptions) => {
        const result = new Promise<CSVWrapper>((resolve) => {
            exporter.exportEnded.pipe(first()).subscribe((value) => {
                const wrapper = new CSVWrapper(value.csvData, csvOptions.valueDelimiter);
                resolve(wrapper);
            });
            exporter.exportData(data, csvOptions);
        });
        return result;
    };
});
