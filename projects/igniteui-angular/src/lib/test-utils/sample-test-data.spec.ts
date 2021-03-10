import { Calendar } from '../calendar/calendar';
import { cloneValue } from '../core/utils';
import { ValueData } from '../services/excel/test-data.service.spec';

export class SampleTestData {

    public static timeGenerator: Calendar = new Calendar();
    public static today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);

    public static stringArray = () => ([
        'Terrance Orta',
        'Richard Mahoney LongerName',
        'Donna Price',
        'Lisa Landers',
        'Dorothy H. Spencer'
    ]);

    public static numbersArray = () => ([
        10,
        20,
        30
    ]);

    public static dateArray = () => ([
        new Date('2018'),
        new Date(2018, 3, 23),
        new Date(30),
        new Date('2018/03/23')
    ]);

    public static excelDateArray = () => ([
        new Date(2018, 3, 23),
        new Date('2018/03/23')
    ]);

    public static emptyObjectData = () => ([
        {},
        {},
        {}
    ]);

    public static noHeadersObjectArray = () => ([
        new ValueData('1'),
        new ValueData('2'),
        new ValueData('3')
    ]);

    public static oneItemNumberData = () => ([{ index: 1, value: 1 }]);

    /* Fields: index: number, value: number; 2 items. */
    public static numberDataTwoFields = () => ([
        { index: 1, value: 1 },
        { index: 2, value: 2 }
    ]);

    /* Fields: index: number, value: number, other: number, another: number; 2 items. */
    public static numberDataFourFields = () => ([
        { index: 1, value: 1, other: 1, another: 1 },
        { index: 2, value: 2, other: 2, another: 2 }
    ]);

    /* Fields: Number: number, String: string, Boolean: boolean; Date: date; 3 items. */
    public static differentTypesData = () => ([
        { Number: 1, String: '1', Boolean: true, Date: new Date(2018, 3, 3) },
        { Number: 2, String: '2', Boolean: false, Date: new Date(2018, 5, 6) },
        { Number: 3, String: '3', Boolean: true, Date: new Date(2018, 9, 22) }
    ]);

    /* Fields: Name: string, Avatar: string; 3 items. */
    public static personAvatarData = () => ([
        {
            Name: 'Person 1',
            Avatar: 'https://randomuser.me/api/portraits/men/43.jpg'
        },
        {
            Name: 'Person 2',
            Avatar: 'https://randomuser.me/api/portraits/women/66.jpg'
        },
        {
            Name: 'Person 3',
            Avatar: 'https://randomuser.me/api/portraits/men/92.jpg'
        }
    ]);

    /* Fields: name: string, phone: string; 5 items. */
    public static contactsData = () => ([
        {
            name: 'Terrance Orta',
            phone: '770-504-2217'
        }, {
            name: 'Richard Mahoney LongerName',
            phone: ''
        }, {
            name: 'Donna Price',
            phone: '859-496-2817'
        }, {
            name: '',
            phone: '901-747-3428'
        }, {
            name: 'Dorothy H. Spencer',
            phone: '573-394-9254'
        }
    ]);

    /* Fields: name: string, phone: string; 6 items. Remarks: Contains special and cyrilic characters. */
    public static contactsFunkyData = () => ([
        {
            name: 'Terrance Mc\'Orta',
            phone: '(+359)770-504-2217 | 2218'
        }, {
            name: 'Richard Mahoney /LongerName/',
            phone: ''
        }, {
            name: 'Donna, \/; Price',
            phone: '859 496 28**'
        }, {
            name: '\r\n',
            phone: '901-747-3428'
        }, {
            name: 'Dorothy "H." Spencer',
            phone: '573-394-9254[fax]'
        }, {
            name: 'Иван Иванов (1,2)',
            phone: '№ 573-394-9254'
        }
    ]);

    /* Fields: name: string, phone: string; 3 items. Remarks: Contains records without values for one of the fields. */
    public static contactsDataPartial = () => ([
        {
            name: 'Terrance Orta',
            phone: '770-504-2217'
        }, {
            name: 'Richard Mahoney LongerName'
        }, {
            phone: '780-555-1331'
        }
    ]);

    /* Data fields: ID: number, Name: string; 3 items. */
    public static personIDNameData = () => ([
        { ID: 1, Name: 'Johny' },
        { ID: 2, Name: 'Sally' },
        { ID: 3, Name: 'Tim' }
    ]);

    /* Data fields: FirstName: string, LastName: string, age:number; 3 items. */
    public static personNameAgeData = () => ([
        { FirstName: 'John', LastName: 'Brown', age: 20 },
        { FirstName: 'Ben', LastName: 'Affleck', age: 30 },
        { FirstName: 'Tom', LastName: 'Riddle', age: 50 }
    ]);

    /* Data fields: ID: number, Name: string, LastName: string, Region: string; 7 items. */
    public static personIDNameRegionData = () => ([
        { ID: 2, Name: 'Jane', LastName: 'Brown', Region: 'AD' },
        { ID: 1, Name: 'Brad', LastName: 'Williams', Region: 'BD' },
        { ID: 6, Name: 'Rick', LastName: 'Jones', Region: 'ACD' },
        { ID: 7, Name: 'Rick', LastName: 'BRown', Region: 'DD' },
        { ID: 5, Name: 'ALex', LastName: 'Smith', Region: 'MlDs' },
        { ID: 4, Name: 'Alex', LastName: 'Wilson', Region: 'DC' },
        { ID: 3, Name: 'Connor', LastName: 'Walker', Region: 'OC' }
    ]);

    /* Data fields: ID: number, Name: string, JobTitle: string, HireDate: string; 10 items, sorted by ID. */
    public static personJobDataFull = () => ([
        { ID: 1, Name: 'Casey Houston', JobTitle: 'Vice President', HireDate: '2017-06-19T11:43:07.714Z' },
        { ID: 2, Name: 'Gilberto Todd', JobTitle: 'Director', HireDate: '2015-12-18T11:23:17.714Z' },
        { ID: 3, Name: 'Tanya Bennett', JobTitle: 'Director', HireDate: '2005-11-18T11:23:17.714Z' },
        { ID: 4, Name: 'Jack Simon', JobTitle: 'Software Developer', HireDate: '2008-12-18T11:23:17.714Z' },
        { ID: 5, Name: 'Celia Martinez', JobTitle: 'Senior Software Developer', HireDate: '2007-12-19T11:23:17.714Z' },
        { ID: 6, Name: 'Erma Walsh', JobTitle: 'CEO', HireDate: '2016-12-18T11:23:17.714Z' },
        { ID: 7, Name: 'Debra Morton', JobTitle: 'Associate Software Developer', HireDate: '2005-11-19T11:23:17.714Z' },
        { ID: 8, Name: 'Erika Wells', JobTitle: 'Software Development Team Lead', HireDate: '2005-10-14T11:23:17.714Z' },
        { ID: 9, Name: 'Leslie Hansen', JobTitle: 'Associate Software Developer', HireDate: '2013-10-10T11:23:17.714Z' },
        { ID: 10, Name: 'Eduardo Ramirez', JobTitle: 'Manager', HireDate: '2011-11-28T11:23:17.714Z' }
    ]);

    /* Data fields: ID: number, Name: string, JobTitle: string, WokingHours: number, HireDate: string, Performance: array;
       3 items, sorted by ID. */
    public static personJobHoursDataPerformance = () => ([
        { ID: 1, Name: 'Casey Houston', JobTitle: 'Vice President', WorkingHours: 4, HireDate: '2017-06-19T11:43:07.714Z', Performance:
            [
                {Points: 3, Week: 1},
                {Points: 6, Week: 2},
                {Points: 1, Week: 3},
                {Points: 12, Week: 4}
            ]
        },
        { ID: 2, Name: 'Gilberto Todd', JobTitle: 'Director', WorkingHours: 6, HireDate: '2015-12-18T11:23:17.714Z', Performance:
            [
                {Points: 8, Week: 1},
                {Points: 7, Week: 2},
                {Points: 4, Week: 3},
                {Points: 9, Week: 4}
            ]
        },
        { ID: 3, Name: 'Tanya Bennett', JobTitle: 'Director', WorkingHours: 8, HireDate: '2005-11-18T11:23:17.714Z', Performance:
            [
                {Points: 1, Week: 1},
                {Points: 3, Week: 2},
                {Points: 14, Week: 3},
                {Points: 29, Week: 4}
            ]
        }
    ]);

    public static hireDate = () => ([
        { ID: 1, HireDate: new Date(2008, 3, 20).toISOString() },
        { ID: 2, HireDate: new Date(2015, 11, 8) },
        { ID: 3, HireDate: new Date(2012, 6, 30).toISOString() },
        { ID: 4, HireDate: new Date(2010, 1, 5).toISOString() },
        { ID: 5, HireDate: new Date(2020, 4, 17).toISOString() },
    ]);

    /* Data fields: ID: number, Name: string, JobTitle: string; 10 items, sorted by ID. */
    public static personJobData = () => ([
        { ID: 1, Name: 'Casey Houston', JobTitle: 'Vice President' },
        { ID: 2, Name: 'Gilberto Todd', JobTitle: 'Director' },
        { ID: 3, Name: 'Tanya Bennett', JobTitle: 'Director' },
        { ID: 4, Name: 'Jack Simon', JobTitle: 'Software Developer' },
        { ID: 5, Name: 'Celia Martinez', JobTitle: 'Senior Software Developer' },
        { ID: 6, Name: 'Erma Walsh', JobTitle: 'CEO' },
        { ID: 7, Name: 'Debra Morton', JobTitle: 'Associate Software Developer' },
        { ID: 8, Name: 'Erika Wells', JobTitle: 'Software Development Team Lead' },
        { ID: 9, Name: 'Leslie Hansen', JobTitle: 'Associate Software Developer' },
        { ID: 10, Name: 'Eduardo Ramirez', JobTitle: 'Manager' }
    ]);

    /* Data fields: ID: number, Name: string, JobTitle: string, Company: string; 10 items, sorted by ID. */
    public static personIDNameJobCompany = () => ([
        { ID: 1, Name: 'Casey Houston', JobTitle: 'Vice President', Company: 'Company A' },
        { ID: 2, Name: 'Gilberto Todd', JobTitle: 'Director', Company: 'Company C' },
        { ID: 3, Name: 'Tanya Bennett', JobTitle: 'Director', Company: 'Company A' },
        { ID: 4, Name: 'Jack Simon', JobTitle: 'Software Developer', Company: 'Company D' },
        { ID: 5, Name: 'Celia Martinez', JobTitle: 'Senior Software DEVELOPER', Company: 'Company B' },
        { ID: 6, Name: 'Erma Walsh', JobTitle: 'CEO', Company: 'Company C' },
        { ID: 7, Name: 'Debra Morton', JobTitle: 'Associate Software Developer', Company: 'Company B' },
        { ID: 8, Name: 'Erika Wells', JobTitle: 'Software Development Team Lead', Company: 'Company A' },
        { ID: 9, Name: 'Leslie Hansen', JobTitle: 'Associate Software Developer', Company: 'Company D' },
        { ID: 10, Name: 'Eduardo Ramirez', JobTitle: 'Manager', Company: 'Company E' }
    ]);

    /* Data fields: ID: number, Name: Object{FirstName: string, LastName: string },
    JobTitle: string, Company: string; 10 items, sorted by ID. */
    public static personNameObjectJobCompany = () => ([
        { ID: 1, Name: { FirstName: 'Casey', LastName: 'Houston' }, JobTitle: 'Vice President', Company: 'Company A' },
        { ID: 2, Name: { FirstName: 'Gilberto', LastName: 'Todd' } , JobTitle: 'Director', Company: 'Company C' },
        { ID: 3, Name: { FirstName: 'Tanya', LastName: 'Bennett' } , JobTitle: 'Director', Company: 'Company A' },
        { ID: 4, Name: { FirstName: 'Jack', LastName: 'Simon' }, JobTitle: 'Software Developer', Company: 'Company D' },
        { ID: 5, Name: { FirstName: 'Celia', LastName: 'Martinez' }, JobTitle: 'Senior Software DEVELOPER', Company: 'Company B' },
        { ID: 6, Name: { FirstName: 'Erma', LastName: 'Walsh' }, JobTitle: 'CEO', Company: 'Company C' },
        { ID: 7, Name: { FirstName: 'Debra', LastName: 'Morton' } , JobTitle: 'Associate Software Developer', Company: 'Company B' },
        { ID: 8, Name: { FirstName: 'Erika', LastName: 'Wells' } , JobTitle: 'Software Development Team Lead', Company: 'Company A' },
        { ID: 9, Name: { FirstName: 'Leslie', LastName: 'Hansen' } , JobTitle: 'Associate Software Developer', Company: 'Company D' },
        { ID: 10, Name: { FirstName: 'Eduardo', LastName: 'Ramirez' }, JobTitle: 'Manager', Company: 'Company E' }
    ]);
    /* Data fields: ID: number, CompanyName: string, ContactName: string, ContactTitle: string, Address: string,
        City: string, Region: string, PostalCode: string, Country: string, Phone: string, Fax: string;
        11 items, sorted by ID. */
    public static contactInfoData = () => ([
        {
            ID: 'ALFKI',
            CompanyName: 'Alfreds Futterkiste',
            ContactName: 'Maria Anders',
            ContactTitle: 'Sales Representative',
            Address: 'Obere Str. 57',
            City: 'Berlin',
            Region: null,
            PostalCode: '12209',
            Country: 'Germany',
            Phone: '030-0074321',
            Fax: '030-0076545'
        },
        {
            ID: 'ANATR',
            CompanyName: 'Ana Trujillo Emparedados y helados',
            ContactName: 'Ana Trujillo',
            ContactTitle: 'Owner',
            Address: 'Avda. de la Constitución 2222',
            City: 'México D.F.',
            Region: null,
            PostalCode: '05021',
            Country: 'Mexico',
            Phone: '(5) 555-4729',
            Fax: '(5) 555-3745'
        },
        {
            ID: 'ANTON',
            CompanyName: 'Antonio Moreno Taquería',
            ContactName: 'Antonio Moreno',
            ContactTitle: 'Owner',
            Address: 'Mataderos 2312',
            City: 'México D.F.',
            Region: null,
            PostalCode: '05023',
            Country: 'Mexico',
            Phone: '(5) 555-3932',
            Fax: null
        },
        {
            ID: 'AROUT',
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
        {
            ID: 'BERGS',
            CompanyName: 'Berglunds snabbköp',
            ContactName: 'Christina Berglund',
            ContactTitle: 'Order Administrator',
            Address: 'Berguvsvägen 8',
            City: 'Luleå',
            Region: null,
            PostalCode: 'S-958 22',
            Country: 'Sweden',
            Phone: '0921-12 34 65',
            Fax: '0921-12 34 67'
        },
        {
            ID: 'BLAUS',
            CompanyName: 'Blauer See Delikatessen',
            ContactName: 'Hanna Moos',
            ContactTitle: 'Sales Representative',
            Address: 'Forsterstr. 57',
            City: 'Mannheim',
            Region: null,
            PostalCode: '68306',
            Country: 'Germany',
            Phone: '0621-08460',
            Fax: '0621-08924'
        },
        {
            ID: 'BLONP',
            CompanyName: 'Blondesddsl père et fils',
            ContactName: 'Frédérique Citeaux',
            ContactTitle: 'Marketing Manager',
            Address: '24, place Kléber',
            City: 'Strasbourg',
            Region: null,
            PostalCode: '67000',
            Country: 'France',
            Phone: '88.60.15.31',
            Fax: '88.60.15.32'
        },
        {
            ID: 'BOLID',
            CompanyName: 'Bólido Comidas preparadas',
            ContactName: 'Martín Sommer',
            ContactTitle: 'Owner',
            Address: 'C/ Araquil, 67',
            City: 'Madrid',
            Region: null,
            PostalCode: '28023',
            Country: 'Spain',
            Phone: '(91) 555 22 82',
            Fax: '(91) 555 91 99'
        },
        {
            ID: 'BONAP',
            CompanyName: 'Bon app\'',
            ContactName: 'Laurence Lebihan',
            ContactTitle: 'Owner',
            Address: '12, rue des Bouchers',
            City: 'Marseille',
            Region: null,
            PostalCode: '13008',
            Country: 'France',
            Phone: '91.24.45.40',
            Fax: '91.24.45.41'
        },
        {
            ID: 'BOTTM',
            CompanyName: 'Bottom-Dollar Markets',
            ContactName: 'Elizabeth Lincoln',
            ContactTitle: 'Accounting Manager',
            Address: '23 Tsawassen Blvd.',
            City: 'Tsawassen',
            Region: 'BC',
            PostalCode: 'T2F 8M4',
            Country: 'Canada',
            Phone: '(604) 555-4729',
            Fax: '(604) 555-3745'
        },
        {
            ID: 'BSBEV',
            CompanyName: 'B\'s Beverages',
            ContactName: 'Victoria Ashworth',
            ContactTitle: 'Sales Representative',
            Address: 'Fauntleroy Circus', City: 'London',
            Region: null, PostalCode: 'EC2 5NT',
            Country: 'UK',
            Phone: '(171) 555-1212',
            Fax: null
        }
    ]);

    /* Data fields: ID: number, CompanyName: string, ContactName: string, ContactTitle: string, Address: string,
        City: string, Region: string, PostalCode: string, Country: string, Phone: string, Fax: string;
        27 items, sorted by ID. */
    /* eslint-disable max-len */

    public static contactInfoDataFull = () => ([
        { ID: 'ALFKI', CompanyName: 'Alfreds Futterkiste', ContactName: 'Maria Anders', ContactTitle: 'Sales Representative', Address: 'Obere Str. 57', City: 'Berlin', Region: null, PostalCode: '12209', Country: 'Germany', Phone: '030-0074321', Fax: '030-0076545' },
        { ID: 'ANATR', CompanyName: 'Ana Trujillo Emparedados y helados', ContactName: 'Ana Trujillo', ContactTitle: 'Owner', Address: 'Avda. de la Constitución 2222', City: 'México D.F.', Region: null, PostalCode: '05021', Country: 'Mexico', Phone: '(5) 555-4729', Fax: '(5) 555-3745' },
        { ID: 'ANTON', CompanyName: 'Antonio Moreno Taquería', ContactName: 'Antonio Moreno', ContactTitle: 'Owner', Address: 'Mataderos 2312', City: 'México D.F.', Region: null, PostalCode: '05023', Country: 'Mexico', Phone: '(5) 555-3932', Fax: null },
        { ID: 'AROUT', CompanyName: 'Around the Horn', ContactName: 'Thomas Hardy', ContactTitle: 'Sales Representative', Address: '120 Hanover Sq.', City: 'London', Region: null, PostalCode: 'WA1 1DP', Country: 'UK', Phone: '(171) 555-7788', Fax: '(171) 555-6750' },
        { ID: 'BERGS', CompanyName: 'Berglunds snabbköp', ContactName: 'Christina Berglund', ContactTitle: 'Order Administrator', Address: 'Berguvsvägen 8', City: 'Luleå', Region: null, PostalCode: 'S-958 22', Country: 'Sweden', Phone: '0921-12 34 65', Fax: '0921-12 34 67' },
        { ID: 'BLAUS', CompanyName: 'Blauer See Delikatessen', ContactName: 'Hanna Moos', ContactTitle: 'Sales Representative', Address: 'Forsterstr. 57', City: 'Mannheim', Region: null, PostalCode: '68306', Country: 'Germany', Phone: '0621-08460', Fax: '0621-08924' },
        { ID: 'BLONP', CompanyName: 'Blondesddsl père et fils', ContactName: 'Frédérique Citeaux', ContactTitle: 'Marketing Manager', Address: '24, place Kléber', City: 'Strasbourg', Region: null, PostalCode: '67000', Country: 'France', Phone: '88.60.15.31', Fax: '88.60.15.32' },
        { ID: 'BOLID', CompanyName: 'Bólido Comidas preparadas', ContactName: 'Martín Sommer', ContactTitle: 'Owner', Address: 'C/ Araquil, 67', City: 'Madrid', Region: null, PostalCode: '28023', Country: 'Spain', Phone: '(91) 555 22 82', Fax: '(91) 555 91 99' },
        { ID: 'BONAP', CompanyName: 'Bon app\'', ContactName: 'Laurence Lebihan', ContactTitle: 'Owner', Address: '12, rue des Bouchers', City: 'Marseille', Region: null, PostalCode: '13008', Country: 'France', Phone: '91.24.45.40', Fax: '91.24.45.41' },
        { ID: 'BOTTM', CompanyName: 'Bottom-Dollar Markets', ContactName: 'Elizabeth Lincoln', ContactTitle: 'Accounting Manager', Address: '23 Tsawassen Blvd.', City: 'Tsawassen', Region: 'BC', PostalCode: 'T2F 8M4', Country: 'Canada', Phone: '(604) 555-4729', Fax: '(604) 555-3745' },
        { ID: 'BSBEV', CompanyName: 'B\'s Beverages', ContactName: 'Victoria Ashworth', ContactTitle: 'Sales Representative', Address: 'Fauntleroy Circus', City: 'London', Region: null, PostalCode: 'EC2 5NT', Country: 'UK', Phone: '(171) 555-1212', Fax: null },
        { ID: 'CACTU', CompanyName: 'Cactus Comidas para llevar', ContactName: 'Patricio Simpson', ContactTitle: 'Sales Agent', Address: 'Cerrito 333', City: 'Buenos Aires', Region: null, PostalCode: '1010', Country: 'Argentina', Phone: '(1) 135-5555', Fax: '(1) 135-4892' },
        { ID: 'CENTC', CompanyName: 'Centro comercial Moctezuma', ContactName: 'Francisco Chang', ContactTitle: 'Marketing Manager', Address: 'Sierras de Granada 9993', City: 'México D.F.', Region: null, PostalCode: '05022', Country: 'Mexico', Phone: '(5) 555-3392', Fax: '(5) 555-7293' },
        { ID: 'CHOPS', CompanyName: 'Chop-suey Chinese', ContactName: 'Yang Wang', ContactTitle: 'Owner', Address: 'Hauptstr. 29', City: 'Bern', Region: null, PostalCode: '3012', Country: 'Switzerland', Phone: '0452-076545', Fax: null },
        { ID: 'COMMI', CompanyName: 'Comércio Mineiro', ContactName: 'Pedro Afonso', ContactTitle: 'Sales Associate', Address: 'Av. dos Lusíadas, 23', City: 'Sao Paulo', Region: 'SP', PostalCode: '05432-043', Country: 'Brazil', Phone: '(11) 555-7647', Fax: null },
        { ID: 'CONSH', CompanyName: 'Consolidated Holdings', ContactName: 'Elizabeth Brown', ContactTitle: 'Sales Representative', Address: 'Berkeley Gardens 12 Brewery', City: 'London', Region: null, PostalCode: 'WX1 6LT', Country: 'UK', Phone: '(171) 555-2282', Fax: '(171) 555-9199' },
        { ID: 'DRACD', CompanyName: 'Drachenblut Delikatessen', ContactName: 'Sven Ottlieb', ContactTitle: 'Order Administrator', Address: 'Walserweg 21', City: 'Aachen', Region: null, PostalCode: '52066', Country: 'Germany', Phone: '0241-039123', Fax: '0241-059428' },
        { ID: 'DUMON', CompanyName: 'Du monde entier', ContactName: 'Janine Labrune', ContactTitle: 'Owner', Address: '67, rue des Cinquante Otages', City: 'Nantes', Region: null, PostalCode: '44000', Country: 'France', Phone: '40.67.88.88', Fax: '40.67.89.89' },
        { ID: 'EASTC', CompanyName: 'Eastern Connection', ContactName: 'Ann Devon', ContactTitle: 'Sales Agent', Address: '35 King George', City: 'London', Region: null, PostalCode: 'WX3 6FW', Country: 'UK', Phone: '(171) 555-0297', Fax: '(171) 555-3373' },
        { ID: 'ERNSH', CompanyName: 'Ernst Handel', ContactName: 'Roland Mendel', ContactTitle: 'Sales Manager', Address: 'Kirchgasse 6', City: 'Graz', Region: null, PostalCode: '8010', Country: 'Austria', Phone: '7675-3425', Fax: '7675-3426' },
        { ID: 'FAMIA', CompanyName: 'Familia Arquibaldo', ContactName: 'Aria Cruz', ContactTitle: 'Marketing Assistant', Address: 'Rua Orós, 92', City: 'Sao Paulo', Region: 'SP', PostalCode: '05442-030', Country: 'Brazil', Phone: '(11) 555-9857', Fax: null },
        { ID: 'FISSA', CompanyName: 'FISSA Fabrica Inter. Salchichas S.A.', ContactName: 'Diego Roel', ContactTitle: 'Accounting Manager', Address: 'C/ Moralzarzal, 86', City: 'Madrid', Region: null, PostalCode: '28034', Country: 'Spain', Phone: '(91) 555 94 44', Fax: '(91) 555 55 93' },
        { ID: 'FOLIG', CompanyName: 'Folies gourmandes', ContactName: 'Martine Rancé', ContactTitle: 'Assistant Sales Agent', Address: '184, chaussée de Tournai', City: 'Lille', Region: null, PostalCode: '59000', Country: 'France', Phone: '20.16.10.16', Fax: '20.16.10.17' },
        { ID: 'FOLKO', CompanyName: 'Folk och fä HB', ContactName: 'Maria Larsson', ContactTitle: 'Owner', Address: 'Åkergatan 24', City: 'Bräcke', Region: null, PostalCode: 'S-844 67', Country: 'Sweden', Phone: '0695-34 67 21', Fax: null },
        { ID: 'FRANK', CompanyName: 'Frankenversand', ContactName: 'Peter Franken', ContactTitle: 'Marketing Manager', Address: 'Berliner Platz 43', City: 'München', Region: null, PostalCode: '80805', Country: 'Germany', Phone: '089-0877310', Fax: '089-0877451' },
        { ID: 'FRANR', CompanyName: 'France restauration', ContactName: 'Carine Schmitt', ContactTitle: 'Marketing Manager', Address: '54, rue Royale', City: 'Nantes', Region: null, PostalCode: '44000', Country: 'France', Phone: '40.32.21.21', Fax: '40.32.21.20' },
        { ID: 'FRANS', CompanyName: 'Franchi S.p.A.', ContactName: 'Paolo Accorti', ContactTitle: 'Sales Representative', Address: 'Via Monte Bianco 34', City: 'Torino', Region: null, PostalCode: '10100', Country: 'Italy', Phone: '011-4988260', Fax: '011-4988261' }
    ]);
    /* eslint-enable max-len */

    /* Data fields: ID: number, CompanyName: string, ContactName: string, ContactTitle: string, Address: string,
        City: string, Region: string, PostalCode: string, Country: string, Phone: string, Fax: string; 1 item. */
    public static contactMariaAndersData = () => ([{
        ID: 'ALFKI',
        CompanyName: 'Alfreds Futterkiste',
        ContactName: 'Maria Anders',
        ContactTitle: 'Sales Representative',
        Address: 'Obere Str. 57',
        City: 'Berlin',
        Region: null,
        PostalCode: '12209',
        Country: 'Germany',
        Phone: '030-0074321',
        Fax: '030-0076545'
    }]);

    /* Data fields: Downloads: number, ID: number, ProductName: string, ReleaseDate: Date, Released: boolean;
        8 items, sorted by ID. */
    public static productInfoData = () => ([
        {
            Downloads: 254,
            ID: 1,
            ProductName: 'Ignite UI for JavaScript',
            ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'day', 15),
            Released: false
        },
        {
            Downloads: 127,
            ID: 2,
            ProductName: 'NetAdvantage',
            ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'month', -1),
            Released: true
        },
        {
            Downloads: 20,
            ID: 3,
            ProductName: 'Ignite UI for Angular',
            ReleaseDate: null,
            Released: null
        },
        {
            Downloads: null,
            ID: 4,
            ProductName: null,
            ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'day', -1),
            Released: true
        },
        {
            Downloads: 100,
            ID: 5,
            ProductName: '',
            ReleaseDate: undefined,
            Released: ''
        },
        {
            Downloads: 702,
            ID: 6,
            ProductName: 'Some other item with Script',
            ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'day', 1),
            Released: null
        },
        {
            Downloads: 1,
            ID: 7,
            ProductName: null,
            ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'month', 1),
            Released: true
        },
        {
            Downloads: 1000,
            ID: 8,
            ProductName: null,
            ReleaseDate: SampleTestData.today,
            Released: false
        }
    ]);

    /* Data fields: Downloads: number, ID: number, ProductName: string, ReleaseDate: Date, Released: boolean,
        Category: string, Items: string, Test: string;
        8 items, sorted by ID. */
    public static productInfoDataFull = () => ([
        {
            Downloads: 254,
            ID: 1,
            ProductName: 'Ignite UI for JavaScript',
            ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'day', 15),
            Released: false,
            Category: 'Category 1',
            Items: 'Item 1',
            Test: 'Test 1'
        },
        {
            Downloads: 127,
            ID: 2,
            ProductName: 'NetAdvantage',
            ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'month', -1),
            Released: true,
            Category: 'Category 2',
            Items: 'Item 2',
            Test: 'Test 2'
        },
        {
            Downloads: 20,
            ID: 3,
            ProductName: 'Ignite UI for Angular',
            ReleaseDate: null,
            Released: null,
            Category: 'Category 3',
            Items: 'Item 3',
            Test: 'Test 3'
        },
        {
            Downloads: null,
            ID: 4,
            ProductName: null,
            ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'day', -1),
            Released: true,
            Category: 'Category 4',
            Items: 'Item 4',
            Test: 'Test 4'
        },
        {
            Downloads: 100,
            ID: 5,
            ProductName: '',
            ReleaseDate: undefined,
            Released: '',
            Category: 'Category 5',
            Items: 'Item 5',
            Test: 'Test 5'
        },
        {
            Downloads: 702,
            ID: 6,
            ProductName: 'Some other item with Script',
            ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'day', 1),
            Released: null,
            Category: 'Category 6',
            Items: 'Item 6',
            Test: 'Test 6'
        },
        {
            Downloads: 0,
            ID: 7,
            ProductName: null,
            ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'month', 1),
            Released: true,
            Category: 'Category 7',
            Items: 'Item 7',
            Test: 'Test 7'
        },
        {
            Downloads: 1000,
            ID: 8,
            ProductName: null,
            ReleaseDate: SampleTestData.today,
            Released: false,
            Category: 'Category 8',
            Items: 'Item 8',
            Test: 'Test 8'
        }
    ]);

    /* Data fields: ProductID: number, ProductName: string, InStock: boolean, UnitsInStock: number, OrderDate: Date;
        10 items, sorted by ID. */
    public static foodProductData = () => ([
        { ProductID: 1, ProductName: 'Chai', InStock: true, UnitsInStock: 2760, OrderDate: new Date('2005-03-21') },
        { ProductID: 2, ProductName: 'Aniseed Syrup', InStock: false, UnitsInStock: 198, OrderDate: new Date('2008-01-15') },
        { ProductID: 3, ProductName: 'Chef Antons Cajun Seasoning', InStock: true, UnitsInStock: 52, OrderDate: new Date('2010-11-20') },
        { ProductID: 4, ProductName: 'Grandmas Boysenberry Spread', InStock: false, UnitsInStock: 0, OrderDate: new Date('2007-10-11') },
        { ProductID: 5, ProductName: 'Uncle Bobs Dried Pears', InStock: false, UnitsInStock: 0, OrderDate: new Date('2001-07-27') },
        { ProductID: 6, ProductName: 'Northwoods Cranberry Sauce', InStock: true, UnitsInStock: 1098, OrderDate: new Date('1990-05-17') },
        { ProductID: 7, ProductName: 'Queso Cabrales', InStock: false, UnitsInStock: 0, OrderDate: new Date('2005-03-03') },
        { ProductID: 8, ProductName: 'Tofu', InStock: true, UnitsInStock: 7898, OrderDate: new Date('2017-09-09') },
        { ProductID: 9, ProductName: 'Teatime Chocolate Biscuits', InStock: true, UnitsInStock: 6998, OrderDate: new Date('2025-12-25') },
        { ProductID: 10, ProductName: 'Chocolate', InStock: true, UnitsInStock: 20000, OrderDate: new Date('2018-03-01') }
    ]);

    public static foodPercentProductData = () => ([
        { ProductID: 1, ProductName: 'Chai', InStock: true, UnitsInStock: 2760, OrderDate: new Date('2005-03-21'), Discount: 0.27 },
        { ProductID: 2, ProductName: 'Syrup', InStock: false, UnitsInStock: 198, OrderDate: new Date('2008-01-15'), Discount: 0.83 },
        { ProductID: 3, ProductName: 'Seasoning', InStock: true, UnitsInStock: 5, OrderDate: new Date('2010-11-20'), Discount: -0.7 },
        { ProductID: 4, ProductName: 'Spread', InStock: false, UnitsInStock: 0, OrderDate: new Date('2007-10-11'), Discount: 11 },
        { ProductID: 5, ProductName: 'Bobs Pears', InStock: false, UnitsInStock: 0, OrderDate: new Date('2001-07-27'), Discount: -0.5},
        { ProductID: 6, ProductName: 'Sauce', InStock: true, UnitsInStock: 1098, OrderDate: new Date('1990-05-17'), Discount: 0.027 },
        { ProductID: 7, ProductName: 'Queso Cabrale', InStock: false, UnitsInStock: 0, OrderDate: new Date('2005-03-03'), Discount: 0.099 },
        { ProductID: 8, ProductName: 'Tofu', InStock: true, UnitsInStock: 7898, OrderDate: new Date('2017-09-09'), Discount: 10 },
        { ProductID: 9, ProductName: 'Chocolate', InStock: true, UnitsInStock: 698, OrderDate: new Date('2025-12-25'), Discount: .123},
        { ProductID: 10, ProductName: 'Biscuits', InStock: true, UnitsInStock: 20000, OrderDate: new Date('2018-03-01'), Discount: 0.39 }
    ]);


    /* Data fields: ProductID: number, ProductName: string, InStock: boolean, UnitsInStock: number, OrderDate: Date;
        19 items, sorted by ID. */
    public static foodProductDataExtended = () => ([
        { ProductID: 1, ProductName: 'Chai', InStock: true, UnitsInStock: 2760, OrderDate: new Date('2005-03-21') },
        { ProductID: 2, ProductName: 'Aniseed Syrup', InStock: false, UnitsInStock: 198, OrderDate: new Date('2008-01-15') },
        { ProductID: 3, ProductName: 'Chef Antons Cajun Seasoning', InStock: true, UnitsInStock: 52, OrderDate: new Date('2010-11-20') },
        { ProductID: 4, ProductName: 'Grandmas Boysenberry Spread', InStock: false, UnitsInStock: 0, OrderDate: new Date('2007-10-11') },
        { ProductID: 5, ProductName: 'Uncle Bobs Dried Pears', InStock: false, UnitsInStock: 0, OrderDate: new Date('2001-07-27') },
        { ProductID: 6, ProductName: 'Northwoods Cranberry Sauce', InStock: true, UnitsInStock: 1098, OrderDate: new Date('1990-05-17') },
        { ProductID: 7, ProductName: 'Queso Cabrales', InStock: false, UnitsInStock: 0, OrderDate: new Date('2005-03-03') },
        { ProductID: 8, ProductName: 'Tofu', InStock: true, UnitsInStock: 7898, OrderDate: new Date('2017-09-09') },
        { ProductID: 9, ProductName: 'Teatime Chocolate Biscuits', InStock: true, UnitsInStock: 6998, OrderDate: new Date('2025-12-25') },
        { ProductID: 10, ProductName: 'Pie', InStock: true, UnitsInStock: 1000, OrderDate: new Date('2017-05-07') },
        { ProductID: 11, ProductName: 'Pasta', InStock: false, UnitsInStock: 198, OrderDate: new Date('2001-02-15') },
        { ProductID: 12, ProductName: 'Krusty krab\'s burger', InStock: true, UnitsInStock: 52, OrderDate: new Date('2012-09-25') },
        { ProductID: 13, ProductName: 'Lasagna', InStock: false, UnitsInStock: 0, OrderDate: new Date('2015-02-09') },
        { ProductID: 14, ProductName: 'Uncle Bobs Dried Pears', InStock: false, UnitsInStock: 0, OrderDate: new Date('2008-03-17') },
        { ProductID: 15, ProductName: 'Cheese', InStock: true, UnitsInStock: 1098, OrderDate: new Date('1990-11-27') },
        { ProductID: 16, ProductName: 'Devil\'s Hot Chilli Sauce', InStock: false, UnitsInStock: 0, OrderDate: new Date('2012-08-14') },
        { ProductID: 17, ProductName: 'Parmesan', InStock: true, UnitsInStock: 4898, OrderDate: new Date('2017-09-09') },
        { ProductID: 18, ProductName: 'Steaks', InStock: true, UnitsInStock: 3098, OrderDate: new Date('2025-12-25') },
        { ProductID: 19, ProductName: 'Biscuits', InStock: true, UnitsInStock: 10570, OrderDate: new Date('2018-03-01') }
    ]);

    /* Generates data with the following data fields: index: number, value: number, other: number, another: number. */
    public static generateNumberData(rowsCount: number) {
        const data = [];
        for (let i = 0; i < rowsCount; i++) {
            data.push({ index: i, value: i, other: i, another: i });
        }
        return data;
    }

    /* Generates columns with 'field' and 'width' fields. */
    public static generateNumberDataSpecial(rowsCount, colsCount, defaultColWidth = null) {
        const cols = [];
        for (let j = 0; j < colsCount; j++) {
            cols.push({
                field: j.toString(),
                width: defaultColWidth !== null ? defaultColWidth : j % 8 < 2 ? 100 : (j % 6) * 125
            });
        }

        const data = [];
        for (let i = 0; i < rowsCount; i++) {
            const obj = {};
            for (let j = 0; j < cols.length; j++) {
                const col = cols[j].field;
                obj[col] = 10 * i * j;
            }
            data.push(obj);
        }
        return data;
    }

    /* Data fields: Downloads:number, ID: number, ProductName: string, ReleaseDate: Date,
                    Released: boolean, Category: string, Items: string, Test: string. */
    public static generateProductData(itemsCount: number) {
        const data = [];
        for (let i = 0; i < itemsCount; i++) {
            const item = {
                Downloads: 100 + i,
                ID: i,
                ProductName: 'ProductName' + i,
                ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'month', -1),
                Released: true,
                Category: 'Category' + i,
                Items: 'Items' + i,
                Test: 'test' + i
            };
            data.push(item);
        }

        return data;
    }

    /* Data fields: ID: string, Column1: string, Column2: string, Column3: string. */
    public static generateBigValuesData(rowsCount: number) {
        const bigData = [];
        for (let i = 0; i < rowsCount; i++) {
            for (let j = 0; j < 5; j++) {
                bigData.push({
                    ID: i.toString() + '_' + j.toString(),
                    Column1: i * j,
                    Column2: i * j * Math.pow(10, i),
                    Column3: i * j * Math.pow(100, i)
                });
            }
        }
        return bigData;
    }

    /* Data fields: ID: string, Column 1..N: number. */
    public static generateBigDataRowsAndCols(rowsCount: number, colsCount: number) {
        const bigData = [];
        for (let i = 0; i < rowsCount; i++) {
            const row = {};
            row['ID'] = i.toString();
            for (let j = 1; j < colsCount; j++) {
                row['Column ' + j] = i * j;
            }

            bigData.push(row);
        }
        return bigData;
    }

    /* Generates columns with the following fields: key, field and header. */
    public static generateColumns(count, namePrefix = 'col') {
        const cols = [];
        for (let i = 0; i < count; i++) {
            cols.push({
                key: namePrefix + i,
                field: namePrefix + i,
                header: namePrefix + i
            });
        }
        return cols;
    }

    /* Generates columns with the following fields: key, field, header and dataType. */
    public static generateColumnsByType(count, type: string, namePrefix = 'col') {
        const cols = [];
        for (let i = 0; i < count; i++) {
            cols.push({
                key: namePrefix + i,
                field: namePrefix + i,
                header: namePrefix + i,
                dataType: type
            });
        }
        return cols;
    }

    /* Generates columns with the following fields: key, dataType and editable. */
    public static generateEditableColumns(count, columnsType = 'string', namePrefix = 'col') {
        const cols = [];
        for (let i = 0; i < count; i++) {
            if (i % 2 === 0) {
                cols.push({
                    key: namePrefix + i,
                    dataType: columnsType,
                    editable: true
                });
            } else {
                cols.push({
                    key: namePrefix + i,
                    dataType: columnsType,
                    editable: false
                });
            }
        }
        return cols;
    }

    /* Generates numeric data for the specified columns collection. */
    public static generateDataForColumns(columns: any[], rowsCount: number, startFromOne = false) {
        const data = [];

        for (let r = 0; r < rowsCount; r++) {
            const record = {};
            for (let c = 0; c < columns.length; c++) {
                record[columns[c].key] = startFromOne && c === 0 ? 1 : c * r;
            }
            data.push(record);
        }

        return data;
    }

    /* Generates data with headers in the format "colNamePrefix1..N" and
    number values calculated by "colIndex * rowIndex" formula. */
    public static generateData(rowsCount, colsCount, colNamePrefix = 'col') {
        const cols = SampleTestData.generateColumns(colsCount, colNamePrefix);
        const data = [];
        for (let r = 0; r < rowsCount; r++) {
            const record = {};
            for (let c = 0; c < cols.length; c++) {
                record[cols[c].field] = c * r;
            }
            data.push(record);
        }
        return data;
    }

    /* Generate a different set of data using the specified baseData.
    Note: If a numeric ID field is available, it will be incremented accordingly. */
    public static generateFromData(baseData: any[], rowsCount: number) {
        const data = [];
        const iterations = Math.floor(rowsCount / baseData.length);
        const remainder = rowsCount % baseData.length;

        for (let i = 0; i < iterations; i++) {
            baseData.forEach((item) => {
                const currentItem = cloneValue(item);
                const id = SampleTestData.getIDColumnName(currentItem);
                if (id) {
                    currentItem[id] = item[id] + i * baseData.length;
                }
                data.push(currentItem);
            });
        }
        const currentLength = data.length;
        for (let i = 0; i < remainder; i++) {
            const currentItem = cloneValue(baseData[i]);
            const id = SampleTestData.getIDColumnName(currentItem);
            if (id) {
                currentItem[id] = currentLength + baseData[i][id];
            }
            data.push(currentItem);
        }

        return data;
    }

    /* Fields: name: string, phone: string; 6 items. Remarks: Contains special and cyrilic characters.
    Certain characters serving as delimiters can be changed. Mostly used in CSV exporters tests. */
    public static getContactsFunkyData(delimiter) {
        return [{
            name: 'Terrance Mc\'Orta',
            phone: '(+359)770-504-2217 | 2218'
        }, {
            name: 'Richard Mahoney /LongerName/',
            phone: ''
        }, {
            name: 'Donna' + delimiter + ' \/; Price',
            phone: '859 496 28**'
        }, {
            name: '\r\n',
            phone: '901-747-3428'
        }, {
            name: 'Dorothy "H." Spencer',
            phone: '573-394-9254[fax]'
        }, {
            name: 'Иван Иванов (1' + delimiter + '2)',
            phone: '№ 573-394-9254'
        }];
    }

    /* Tree data: Every employee node has ID, Name, HireDate, Age and Employees */
    public static employeeTreeData = () => ([
        {
            ID: 147,
            Name: 'John Winchester',
            HireDate: new Date(2008, 3, 20),
            Age: 55,
            OnPTO: false,
            Employees: [
                {
                    ID: 475,
                    Name: 'Michael Langdon',
                    HireDate: new Date(2011, 6, 3),
                    Age: 43,
                    OnPTO: false,
                    Employees: null
                },
                {
                    ID: 957,
                    Name: 'Thomas Hardy',
                    HireDate: new Date(2009, 6, 19),
                    Age: 29,
                    OnPTO: true,
                    Employees: undefined
                },
                {
                    ID: 317,
                    Name: 'Monica Reyes',
                    HireDate: new Date(2014, 8, 18),
                    Age: 31,
                    OnPTO: false,
                    Employees: [
                        {
                            ID: 711,
                            Name: 'Roland Mendel',
                            HireDate: new Date(2015, 9, 17),
                            Age: 35,
                            OnPTO: true,
                        },
                        {
                            ID: 998,
                            Name: 'Sven Ottlieb',
                            HireDate: new Date(2009, 10, 11),
                            Age: 44,
                            OnPTO: false,
                        }
                    ]
                }]
        },
        {
            ID: 847,
            Name: 'Ana Sanders',
            HireDate: new Date(2014, 1, 22),
            Age: 42,
            OnPTO: false,
            Employees: [
                {
                    ID: 225,
                    Name: 'Laurence Johnson',
                    HireDate: new Date(2014, 4, 4),
                    OnPTO: true,
                    Age: 44,
                },
                {
                    ID: 663,
                    Name: 'Elizabeth Richards',
                    HireDate: new Date(2017, 11, 9),
                    Age: 25,
                    OnPTO: false,
                    Employees: [
                        {
                            ID: 141,
                            Name: 'Trevor Ashworth',
                            HireDate: new Date(2010, 3, 22),
                            OnPTO: false,
                            Age: 39
                        }
                    ]
                }]
        },
        {
            ID: 19,
            Name: 'Victoria Lincoln',
            HireDate: new Date(2014, 1, 22),
            Age: 49,
            OnPTO: false,
            Employees: [
                {
                    ID: 15,
                    Name: 'Antonio Moreno',
                    HireDate: new Date(2014, 4, 4),
                    Age: 44,
                    OnPTO: true,
                    Employees: []
                }]
        },
        {
            ID: 17,
            Name: 'Yang Wang',
            HireDate: new Date(2010, 1, 1),
            Age: 61,
            OnPTO: false,
            Employees: [
                {
                    ID: 12,
                    Name: 'Pedro Afonso',
                    HireDate: new Date(2007, 11, 18),
                    Age: 50,
                    OnPTO: false,
                    Employees: [
                        {
                            ID: 109,
                            Name: 'Patricio Simpson',
                            HireDate: new Date(2017, 11, 9),
                            Age: 25,
                            OnPTO: false,
                            Employees: []
                        },
                        {
                            ID: 99,
                            Name: 'Francisco Chang',
                            HireDate: new Date(2010, 3, 22),
                            OnPTO: true,
                            Age: 39
                        },
                        {
                            ID: 299,
                            Name: 'Peter Lewis',
                            HireDate: new Date(2018, 3, 18),
                            OnPTO: false,
                            Age: 25
                        }
                    ]
                },
                {
                    ID: 101,
                    Name: 'Casey Harper',
                    HireDate: new Date(2016, 2, 19),
                    OnPTO: false,
                    Age: 27
                }]
        }
    ]);

    public static employeeScrollingData = () => ([
        { Salary: 2500, employeeID: 0, PID: -1, firstName: 'Andrew', lastName: 'Fuller', Title: 'Vice President, Sales' },
        { Salary: 3500, employeeID: 1, PID: -1, firstName: 'Jonathan', lastName: 'Smith', Title: 'Human resources' },
        { Salary: 1500, employeeID: 2, PID: -1, firstName: 'Nancy', lastName: 'Davolio', Title: 'CFO' },
        { Salary: 2500, employeeID: 3, PID: -1, firstName: 'Steven', lastName: 'Buchanan', Title: 'CTO' },
        // sub of ID 0
        { Salary: 2500, employeeID: 4, PID: 0, firstName: 'Janet', lastName: 'Leverling', Title: 'Sales Manager' },
        { Salary: 3500, employeeID: 5, PID: 0, firstName: 'Laura', lastName: 'Callahan', Title: 'Inside Sales Coordinator' },
        { Salary: 1500, employeeID: 6, PID: 0, firstName: 'Margaret', lastName: 'Peacock', Title: 'Sales Representative' },
        { Salary: 2500, employeeID: 7, PID: 0, firstName: 'Michael', lastName: 'Suyama', Title: 'Sales Representative' },
        // sub of ID 4
        { Salary: 2500, employeeID: 8, PID: 4, firstName: 'Anne', lastName: 'Dodsworth', Title: 'Sales Representative' },
        { Salary: 3500, employeeID: 9, PID: 4, firstName: 'Danielle', lastName: 'Davis', Title: 'Sales Representative' },
        { Salary: 1500, employeeID: 10, PID: 4, firstName: 'Robert', lastName: 'King', Title: 'Sales Representative' },
        // sub of ID 2
        { Salary: 2500, employeeID: 11, PID: 2, firstName: 'Peter', lastName: 'Lewis', Title: 'Chief Accountant' },
        { Salary: 3500, employeeID: 12, PID: 2, firstName: 'Ryder', lastName: 'Zenaida', Title: 'Accountant' },
        { Salary: 1500, employeeID: 13, PID: 2, firstName: 'Wang', lastName: 'Mercedes', Title: 'Accountant' },
        // sub of ID 3
        { Salary: 1500, employeeID: 14, PID: 3, firstName: 'Theodore', lastName: 'Zia', Title: 'Software Architect' },
        { Salary: 4500, employeeID: 15, PID: 3, firstName: 'Lacota', lastName: 'Mufutau', Title: 'Product Manager' },
        // sub of ID 16
        { Salary: 2500, employeeID: 16, PID: 15, firstName: 'Jin', lastName: 'Elliott', Title: 'Product Owner' },
        { Salary: 3500, employeeID: 17, PID: 15, firstName: 'Armand', lastName: 'Ross', Title: 'Product Owner' },
        { Salary: 1500, employeeID: 18, PID: 15, firstName: 'Dane', lastName: 'Rodriquez', Title: 'Team Leader' },
        // sub of ID 19
        { Salary: 2500, employeeID: 19, PID: 18, firstName: 'Declan', lastName: 'Lester', Title: 'Senior Software Developer' },
        { Salary: 3500, employeeID: 20, PID: 18, firstName: 'Bernard', lastName: 'Jarvis', Title: 'Senior Software Developer' },
        { Salary: 1500, employeeID: 21, PID: 18, firstName: 'Jason', lastName: 'Clark', Title: 'QA' },
        { Salary: 1500, employeeID: 22, PID: 18, firstName: 'Mark', lastName: 'Young', Title: 'QA' },
        // sub of ID 20
        { Salary: 1500, employeeID: 23, PID: 20, firstName: 'Jeremy', lastName: 'Donaldson', Title: 'Software Developer' }
    ]);

    /* Small tree data: Every employee node has ID, Name, HireDate, Age and Employees */
    public static employeeSmallTreeData = () => ([
        {
            ID: 147,
            Name: 'John Winchester',
            HireDate: new Date(2008, 3, 20),
            Age: 55,
            Employees: [
                {
                    ID: 475,
                    Name: 'Michael Langdon',
                    HireDate: new Date(2011, 6, 3),
                    Age: 30,
                    Employees: null
                },
                {
                    ID: 957,
                    Name: 'Thomas Hardy',
                    HireDate: new Date(2009, 6, 19),
                    Age: 29,
                    Employees: undefined
                },
                {
                    ID: 317,
                    Name: 'Monica Reyes',
                    HireDate: new Date(2014, 8, 18),
                    Age: 31,
                    Employees: [
                        {
                            ID: 711,
                            Name: 'Roland Mendel',
                            HireDate: new Date(2015, 9, 17),
                            Age: 35
                        },
                        {
                            ID: 998,
                            Name: 'Sven Ottlieb',
                            HireDate: new Date(2009, 10, 11),
                            Age: 44
                        },
                        {
                            ID: 299,
                            Name: 'Peter Lewis',
                            HireDate: new Date(2018, 3, 18),
                            Age: 25
                        }
                    ]
                }]
        },
        {
            ID: 19,
            Name: 'Yang Wang',
            HireDate: new Date(2010, 1, 1),
            Age: 61
        },
        {
            ID: 847,
            Name: 'Ana Sanders',
            HireDate: new Date(2014, 1, 22),
            Age: 42,
            Employees: [
                {
                    ID: 663,
                    Name: 'Elizabeth Richards',
                    HireDate: new Date(2017, 11, 9),
                    Age: 25
                }]
        }
    ]);

    /* Search tree data: Every employee node has ID, Name, HireDate, Age, JobTitle and Employees */
    public static employeeSearchTreeData = () => ([
        {
            ID: 147,
            Name: 'John Winchester',
            HireDate: new Date(2008, 3, 20),
            Age: 55,
            JobTitle: 'Director',
            Employees: [
                {
                    ID: 475,
                    Name: 'Michael Langdon',
                    HireDate: new Date(2011, 6, 3),
                    Age: 30,
                    JobTitle: 'Software Developer Evangelist',
                    Employees: null
                },
                {
                    ID: 957,
                    Name: 'Thomas Hardy',
                    HireDate: new Date(2009, 6, 19),
                    Age: 29,
                    JobTitle: 'Junior Software Developer',
                    Employees: undefined
                },
                {
                    ID: 317,
                    Name: 'Monica Reyes',
                    HireDate: new Date(2014, 8, 18),
                    Age: 31,
                    JobTitle: 'Manager',
                    Employees: [
                        {
                            ID: 711,
                            Name: 'Eva Mendel',
                            HireDate: new Date(2015, 9, 17),
                            JobTitle: 'Senior Software Developer',
                            Age: 35
                        },
                        {
                            ID: 998,
                            Name: 'Sven Ottlieb',
                            HireDate: new Date(2009, 10, 11),
                            JobTitle: 'Senior Software Developer',
                            Age: 44
                        },
                        {
                            ID: 299,
                            Name: 'Peter Lewis',
                            HireDate: new Date(2018, 3, 18),
                            JobTitle: 'QA Developer',
                            Age: 25
                        }
                    ]
                }]
        },
        {
            ID: 19,
            Name: 'Yang Wang',
            HireDate: new Date(2010, 1, 1),
            JobTitle: 'Software Developer',
            Age: 61
        },
        {
            ID: 847,
            Name: 'Ana Sanders',
            HireDate: new Date(2014, 1, 22),
            Age: 42,
            JobTitle: 'QA Developer',
            Employees: [
                {
                    ID: 663,
                    Name: 'Elizabeth Richards',
                    HireDate: new Date(2017, 11, 9),
                    JobTitle: 'Software Developer',
                    Age: 25
                }]
        }
    ]);

    /* All types tree data: Every employee node has ID, Name, HireDate, Age, OnPTO and Employees */
    public static employeeAllTypesTreeData = () => ([
        {
            ID: 147,
            Name: 'John Winchester',
            HireDate: new Date(2008, 3, 20),
            Age: 55,
            OnPTO: false,
            Employees: [
                {
                    ID: 475,
                    Name: 'Michael Langdon',
                    HireDate: new Date(2011, 6, 3),
                    Age: 30,
                    OnPTO: true,
                    Employees: null
                },
                {
                    ID: 957,
                    Name: 'Thomas Hardy',
                    HireDate: new Date(2009, 6, 19),
                    Age: 29,
                    OnPTO: false,
                    Employees: undefined
                },
                {
                    ID: 317,
                    Name: 'Monica Reyes',
                    HireDate: new Date(2014, 8, 18),
                    Age: 31,
                    OnPTO: true,
                    Employees: [
                        {
                            ID: 711,
                            Name: 'Roland Mendel',
                            HireDate: new Date(2015, 9, 17),
                            Age: 35,
                            OnPTO: false,
                        },
                        {
                            ID: 998,
                            Name: 'Sven Ottlieb',
                            HireDate: new Date(2009, 10, 11),
                            Age: 44,
                            OnPTO: false,
                        },
                        {
                            ID: 299,
                            Name: 'Peter Lewis',
                            HireDate: new Date(2018, 3, 18),
                            Age: 25,
                            OnPTO: false,
                        }
                    ]
                }]
        },
        {
            ID: 19,
            Name: 'Yang Wang',
            HireDate: new Date(2010, 1, 1),
            Age: 61,
            OnPTO: true
        },
        {
            ID: 847,
            Name: 'Ana Sanders',
            HireDate: new Date(2014, 1, 22),
            Age: 42,
            OnPTO: false,
            Employees: [
                {
                    ID: 663,
                    Name: 'Elizabeth Richards',
                    HireDate: new Date(2017, 11, 9),
                    Age: 25,
                    OnPTO: true
                }]
        }
    ]);

    public static employeeTreeDataDisplayOrder = () => ([
        { ID: 1, ParentID: -1, Name: 'Casey Houston', JobTitle: 'Vice President', Age: 32 },
        { ID: 2, ParentID: 1, Name: 'Gilberto Todd', JobTitle: 'Director', Age: 41 },
        { ID: 3, ParentID: 2, Name: 'Tanya Bennett', JobTitle: 'Director', Age: 29 },
        { ID: 7, ParentID: 2, Name: 'Debra Morton', JobTitle: 'Associate Software Developer', Age: 35 },
        { ID: 4, ParentID: 1, Name: 'Jack Simon', JobTitle: 'Software Developer', Age: 33 },
        { ID: 6, ParentID: -1, Name: 'Erma Walsh', JobTitle: 'CEO', Age: 52 },
        { ID: 10, ParentID: -1, Name: 'Eduardo Ramirez', JobTitle: 'Manager', Age: 53 },
        { ID: 9, ParentID: 10, Name: 'Leslie Hansen', JobTitle: 'Associate Software Developer', Age: 44 }
    ]);

    public static employeePrimaryForeignKeyTreeData = () => ([
        { ID: 1, ParentID: -1, Name: 'Casey Houston', JobTitle: 'Vice President', Age: 32 },
        { ID: 2, ParentID: 1, Name: 'Gilberto Todd', JobTitle: 'Director', Age: 41 },
        { ID: 3, ParentID: 2, Name: 'Tanya Bennett', JobTitle: 'Director', Age: 29 },
        { ID: 4, ParentID: 1, Name: 'Jack Simon', JobTitle: 'Software Developer', Age: 33 },
        { ID: 6, ParentID: -1, Name: 'Erma Walsh', JobTitle: 'CEO', Age: 52 },
        { ID: 7, ParentID: 2, Name: 'Debra Morton', JobTitle: 'Associate Software Developer', Age: 35 },
        { ID: 9, ParentID: 10, Name: 'Leslie Hansen', JobTitle: 'Associate Software Developer', Age: 44 },
        { ID: 10, ParentID: -1, Name: 'Eduardo Ramirez', JobTitle: 'Manager', Age: 53 }
    ]);

    public static employeeTreeDataPrimaryForeignKey = () => ([
        {
            ID: 147,
            ParentID: -1,
            Name: 'John Winchester',
            HireDate: new Date(2008, 3, 20),
            Age: 55,
            OnPTO: false
        },
        {
            ID: 475,
            ParentID: 147,
            Name: 'Michael Langdon',
            HireDate: new Date(2011, 6, 3),
            Age: 43,
            OnPTO: false,
            Employees: null
        },
        {
            ID: 957,
            ParentID: 147,
            Name: 'Thomas Hardy',
            HireDate: new Date(2009, 6, 19),
            Age: 29,
            OnPTO: true,
            Employees: undefined
        },
        {
            ID: 317,
            ParentID: 147,
            Name: 'Monica Reyes',
            HireDate: new Date(2014, 8, 18),
            Age: 31,
            OnPTO: false
        },
        {
            ID: 711,
            ParentID: 317,
            Name: 'Roland Mendel',
            HireDate: new Date(2015, 9, 17),
            Age: 35,
            OnPTO: true,
        },
        {
            ID: 998,
            ParentID: 317,
            Name: 'Sven Ottlieb',
            HireDate: new Date(2009, 10, 11),
            Age: 44,
            OnPTO: false,
        },
        {
            ID: 847,
            ParentID: -1,
            Name: 'Ana Sanders',
            HireDate: new Date(2014, 1, 22),
            Age: 42,
            OnPTO: false
        },
        {
            ID: 225,
            ParentID: 847,
            Name: 'Laurence Johnson',
            HireDate: new Date(2014, 4, 4),
            OnPTO: true,
            Age: 44,
        },
        {
            ID: 663,
            ParentID: 847,
            Name: 'Elizabeth Richards',
            HireDate: new Date(2017, 11, 9),
            Age: 25,
            OnPTO: false
        },

        {
            ID: 141,
            ParentID: 663,
            Name: 'Trevor Ashworth',
            HireDate: new Date(2010, 3, 22),
            OnPTO: false,
            Age: 39
        },
        {
            ID: 19,
            ParentID: -1,
            Name: 'Victoria Lincoln',
            HireDate: new Date(2014, 1, 22),
            Age: 49,
            OnPTO: false
        },
        {
            ID: 15,
            ParentID: 19,
            Name: 'Antonio Moreno',
            HireDate: new Date(2014, 4, 4),
            Age: 44,
            OnPTO: true,
            Employees: []
        },
        {
            ID: 17,
            ParentID: -1,
            Name: 'Yang Wang',
            HireDate: new Date(2010, 1, 1),
            Age: 61,
            OnPTO: false
        },
        {
            ID: 12,
            ParentID: 17,
            Name: 'Pedro Afonso',
            HireDate: new Date(2007, 11, 18),
            Age: 50,
            OnPTO: false
        },
        {
            ID: 109,
            ParentID: 12,
            Name: 'Patricio Simpson',
            HireDate: new Date(2017, 11, 9),
            Age: 25,
            OnPTO: false,
            Employees: []
        },
        {
            ID: 99,
            ParentID: 12,
            Name: 'Francisco Chang',
            HireDate: new Date(2010, 3, 22),
            OnPTO: true,
            Age: 39
        },
        {
            ID: 299,
            ParentID: 12,
            Name: 'Peter Lewis',
            HireDate: new Date(2018, 3, 18),
            OnPTO: false,
            Age: 25
        },
        {
            ID: 101,
            ParentID: 17,
            Name: 'Casey Harper',
            HireDate: new Date(2016, 2, 19),
            OnPTO: false,
            Age: 27
        }
    ]);

    public static employeeGroupByData = () => ([
        {
            ID: 475,
            ParentID: 147,
            Name: 'Michael Langdon',
            HireDate: new Date(2011, 6, 3),
            Age: 43,
            OnPTO: false,
            Employees: null
        },
        {
            ID: 957,
            ParentID: 147,
            Name: 'Thomas Hardy',
            HireDate: new Date(2009, 6, 19),
            Age: 29,
            OnPTO: true,
            Employees: undefined
        },
        {
            ID: 317,
            ParentID: 147,
            Name: 'Monica Reyes',
            HireDate: new Date(2014, 8, 18),
            Age: 31,
            OnPTO: false
        },
        {
            ID: 225,
            ParentID: 847,
            Name: 'Laurence Johnson',
            HireDate: new Date(2014, 4, 4),
            OnPTO: true,
            Age: 44,
        },
        {
            ID: 663,
            ParentID: 847,
            Name: 'Elizabeth Richards',
            HireDate: new Date(2017, 11, 9),
            Age: 25,
            OnPTO: false
        },

        {
            ID: 15,
            ParentID: 19,
            Name: 'Antonio Moreno',
            HireDate: new Date(2014, 4, 4),
            Age: 44,
            OnPTO: true,
            Employees: []
        },
        {
            ID: 12,
            ParentID: 17,
            Name: 'Pedro Afonso',
            HireDate: new Date(2007, 11, 18),
            Age: 50,
            OnPTO: false
        },
        {
            ID: 101,
            ParentID: 17,
            Name: 'Casey Harper',
            HireDate: new Date(2016, 2, 19),
            OnPTO: false,
            Age: 27
        }
    ]);

    public static excelFilteringData = () => ([
        {
            Downloads: 254,
            ID: 1,
            ProductName: 'Ignite UI for JavaScript',
            ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'day', 15),
            Released: false,
            AnotherField: 'a'
        },
        {
            Downloads: 127,
            ID: 2,
            ProductName: 'NetAdvantage',
            ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'month', -1),
            Released: true,
            AnotherField: 'a'
        },
        {
            Downloads: 20,
            ID: 3,
            ProductName: 'Ignite UI for Angular',
            ReleaseDate: null,
            Released: null,
            AnotherField: 'a'
        },
        {
            Downloads: null,
            ID: 4,
            ProductName: null,
            ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'day', -1),
            Released: true,
            AnotherField: 'a'
        },
        {
            Downloads: 100,
            ID: 5,
            ProductName: '',
            ReleaseDate: undefined,
            Released: false,
            AnotherField: 'a'
        },
        {
            Downloads: 702,
            ID: 6,
            ProductName: 'Some other item with Script',
            ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'day', 1),
            Released: null,
            AnotherField: 'Custom'
        },
        {
            Downloads: 0,
            ID: 7,
            ProductName: null,
            ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'month', 1),
            Released: true,
            AnotherField: 'custoM'
        },
        {
            Downloads: 1000,
            ID: 8,
            ProductName: null,
            ReleaseDate: SampleTestData.today,
            Released: undefined,
            AnotherField: 'custom'
        }
    ]);

    /* Data fields: Price: number, Brand: string, Model: string, Edition: string */
    public static exportGroupedDataColumns = () => ([
        { Price: 75000, Brand: 'Tesla', Model: 'Model S', Edition: 'Sport' },
        { Price: 100000, Brand: 'Tesla', Model: 'Roadster', Edition: 'Performance' },
        { Price: 65000, Brand: 'Tesla', Model: 'Model S', Edition: 'Base' },
        { Price: 150000, Brand: 'BMW', Model: 'M5', Edition: 'Competition' },
        { Price: 100000, Brand: 'BMW', Model: 'M5', Edition: 'Performance' },
        { Price: 75000, Brand: 'VW', Model: 'Arteon', Edition: 'Business' },
        { Price: 65000, Brand: 'VW', Model: 'Passat', Edition: 'Business' },
        { Price: 100000, Brand: 'VW', Model: 'Arteon', Edition: 'R Line' },
    ]);

    /**
     * Generates simple array of primitve values
     *
     * @param rows Number of items to add to the array
     * @param type The type of the items
     */
    public static generateListOfPrimitiveValues(rows: number, type: string): any[] {
        const data: any[] = [];
        for (let row = 0; row < rows; row++) {
            if (type === 'Number') {
                data.push(row);
            } else if (type === 'String') {
                data.push(`Row ${row}`);
            } else if (type === 'Boolean') {
                data.push(row % 7 === 0);
            }
        }
        return data;
    }

    /* Generates hierahical data  */
    public static generateHGridData(count: number, level: number, parendID?) {
        const prods = [];
        const currLevel = level;
        let children;
        for (let i = 0; i < count; i++) {
            const rowID = parendID ? parendID + i : i.toString();
           if (level > 0 ) {
                children = this.generateHGridData(count / 2 , currLevel - 1, rowID);
           }
           prods.push({
            ID: rowID, ChildLevels: currLevel,  ProductName: 'Product: A' + i, Col1: i,
            Col2: i, Col3: i, childData: children, childData2: children });
        }
        return prods;
    }

    /* Gets the name of the identifier column if exists. */
    private static getIDColumnName(dataItem: any) {
        if (!dataItem) {
            return undefined;
        }

        if (dataItem['ID']) {
            return 'ID';
        } else if (dataItem['Id']) {
            return 'Id';
        } else if (dataItem['id']) {
            return 'id';
        } else {
            return undefined;
        }
    }
}

/* eslint-enable @typescript-eslint/quotes */

export class DataParent {
    public today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
    public nextDay = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1, 0, 0, 0);
    public prevDay = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1, 0, 0, 0);
    public data = [
        {
            Downloads: 254,
            ID: 1,
            ProductName: 'Ignite UI for JavaScript',
            ReleaseDate: this.today,
            Released: false
        },
        {
            Downloads: 1000,
            ID: 2,
            ProductName: 'NetAdvantage',
            ReleaseDate: this.nextDay,
            Released: true
        },
        {
            Downloads: 20,
            ID: 3,
            ProductName: 'Ignite UI for Angular',
            ReleaseDate: null,
            Released: false
        },
        {
            Downloads: null,
            ID: 4,
            ProductName: 'Ignite UI for JavaScript',
            ReleaseDate: this.prevDay,
            Released: true
        },
        {
            Downloads: 100,
            ID: 5,
            ProductName: '',
            ReleaseDate: null,
            Released: true
        },
        {
            Downloads: 1000,
            ID: 6,
            ProductName: 'Ignite UI for Angular',
            ReleaseDate: this.nextDay,
            Released: null
        },
        {
            Downloads: 0,
            ID: 7,
            ProductName: null,
            ReleaseDate: this.prevDay,
            Released: true
        },
        {
            Downloads: 1000,
            ID: 8,
            ProductName: 'NetAdvantage',
            ReleaseDate: this.today,
            Released: false
        }
    ];
}
