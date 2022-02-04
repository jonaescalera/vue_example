const tableData = 
[
  {
    "name": "Neo Blue Neo",
    "available": true,
    "site": "North Building",
    "area": "Floor F",
    "zone": "Zone 3",
    "batteryLevel": null,
    "lastSeen": "2019-03-12 13:00:00",
    "statusActive": true 
  },
  {
    "name": "Babby e",
    "available": true,
    "site": "facility 34B",
    "area": "Floor 284",
    "zone": "Zone 14",
    "batteryLevel": 3,
    "lastSeen": "2019-03-11 14:41:00",
    "statusActive": true 
  },
  {
    "name": "Neo Blue neo BlueAVeryLongWordToTest",
    "available": true,
    "site": "Building 721",
    "area": "Blue Floor",
    "zone": "Zone 1",
    "batteryLevel": 0,
    "lastSeen": "2019-04-25 11:00:00",
    "statusActive": false
  },
  {
    "name": "Vital Precision Flow",
    "available": false,
    "site": "South Vienna",
    "area": "Level 8362",
    "zone": "Zone 13",
    "batteryLevel": 0,
    "lastSeen": "2019-11-02 15:42:00",
    "statusActive": true 
  },
  {
    "name": "Drager",
    "available": false,
    "site": "West Wing",
    "area": "Lower Floor B",
    "zone": "Zone 2",
    "batteryLevel": null,
    "lastSeen": "2020-01-05 09:00:00",
    "statusActive": false 
  },
  {
    "name": "Omnibed",
    "available": false,
    "site": "Building South",
    "area": "Floor C",
    "zone": "Zone 52",
    "batteryLevel": 0,
    "lastSeen": "2020-01-12 21:00:00",
    "statusActive": true 
  },
  {
    "name": "System Seven",
    "available": true,
    "site": "Building 2846",
    "area": "Floor 93",
    "zone": "Zone 43",
    "batteryLevel": 1,
    "lastSeen": "2019-03-12 13:00:00",
    "statusActive": false
  },
  {
    "name": "Neo Blue",
    "available": true,
    "site": "Facility D",
    "area": "Upper Level 4",
    "zone": "Zone 7",
    "batteryLevel": 2,
    "lastSeen": "2019-05-12 13:00:00",
    "statusActive": false
  },
  {
    "name": "Drager",
    "available": true,
    "site": "East Village",
    "area": "Red Floor 2",
    "zone": "Zone 4",
    "batteryLevel": 1,
    "lastSeen": "2019-03-12 13:00:00",
    "statusActive": true 
  },
  {
    "name": "System Seven",
    "available": true,
    "site": "Building 34",
    "area": "Floor E",
    "zone": "Zone 3",
    "batteryLevel": 3,
    "lastSeen": "2016-03-12 13:00:00",
    "statusActive": true 
  },
  {
    "name": "Omnibed",
    "available": false,
    "site": "Building South",
    "area": "Floor C",
    "zone": "Zone 52",
    "batteryLevel": null,
    "lastSeen": "2020-01-12 21:00:00",
    "statusActive": true 
  },
  {
    "name": "System Seven",
    "available": true,
    "site": "Building 2846",
    "area": "Floor 93",
    "zone": "Zone 43",
    "batteryLevel": 1,
    "lastSeen": "2019-03-12 13:00:00",
    "statusActive": true 
  },
  {
    "name": "Neo Blue",
    "available": true,
    "site": "Facility D",
    "area": "Upper Level 4",
    "zone": "Zone 7",
    "batteryLevel": 2,
    "lastSeen": "2019-05-12 13:00:00",
    "statusActive": true 
  },
  {
    "name": "Drager",
    "available": true,
    "site": "East Village",
    "area": "Red Floor 2",
    "zone": "Zone 4",
    "batteryLevel": 1,
    "lastSeen": "2019-03-12 13:00:00",
    "statusActive": true 
  },
  {
    "name": "System Seven",
    "available": true,
    "site": "Building 34",
    "area": "Floor E",
    "zone": "Zone 3",
    "batteryLevel": 3,
    "lastSeen": "2016-03-12 13:00:00",
    "statusActive": true 
  }
]

const filterFields = [
        {
          name: "Site",
          field: 'site',
          filterPrefix: 'eq',
          options: [{id: 0, value: "Option A"}, {id: 1, value: "Option B"}],
          cols: "6"
        },
        {
          name: "Area",
          field: 'area',
          filterPrefix: 'eq',
          options: [{id: 0, value: "Option A"}, {id: 1, value: "Option B"}],
          cols: "6"
        },
        {
          name: "Zone",
          field: 'zone',
          filterPrefix: 'eq',
          options: [{id: 0, value: "Option A"}, {id: 1, value: "Option B"}],
          cols: "6"
        },
        {
          name: "Location",
          field: 'location',
          filterPrefix: 'eq',
          options: [{id: 0, value: "Option A"}, {id: 1, value: "Option B"}],
          cols: "6"
        },
        {
          name: "Monitorig Status",
          field: 'monitoringStatus',
          filterPrefix: 'eq',
          options: [{id: 0, value: "Option A"}, {id: 1, value: "Option B"}],
          cols: "12"
        }
      ]

const savedFavFilters = 
[
  {
    "area": 0,
    "zone": 1,
    "id": "1",
    "name": "Filter1",
    "location": null,
    "site": 0,
    "monitoringStatus": null
  },
  {
    "area": 1,
    "zone": 1,
    "id": "2",
    "name": "Filter2",
    "location": 1,
    "site": null,
    "monitoringStatus": null
  },
  {
    "area": 0,
    "zone": 1,
    "id": "3",
    "name": "Filter3",
    "location": 0,
    "site": null,
    "monitoringStatus": 1
  },
  {
    "area": 0,
    "zone": 1,
    "id": "4",
    "name": "Filter4",
    "location": 0,
    "site": 1,
    "monitoringStatus": 1
  },
  {
    "area": 0,
    "zone": 1,
    "id": "5",
    "name": "Filter5",
    "location": 1,
    "site": 1,
    "monitoringStatus": 0
  },
  {
    "area": 1,
    "zone": 0,
    "id": "6",
    "name": "Filter6",
    "location": 0,
    "site": 0,
    "monitoringStatus": 0
  },
  {
    "area": 1,
    "zone": 1,
    "id": "7",
    "name": "Filter7",
    "location": 1,
    "site": 0,
    "monitoringStatus": 0
  },
  {
    "area": null,
    "zone": null,
    "id": "8",
    "name": "Filter8",
    "location": null,
    "site": null,
    "monitoringStatus": null
  },
  {
    "area": null,
    "zone": null,
    "id": "9",
    "name": "Filter9",
    "location": null,
    "site": null,
    "monitoringStatus": null
  },
  {
    "area": null,
    "zone": null,
    "id": "10",
    "name": "Filter10",
    "location": null,
    "site": null,
    "monitoringStatus": null
  },
  {
    "area": null,
    "zone": null,
    "id": "11",
    "name": "Filter11",
    "location": null,
    "site": null,
    "monitoringStatus": null
  },
  {
    "area": null,
    "zone": null,
    "id": "12",
    "name": "Filter12",
    "location": null,
    "site": null,
    "monitoringStatus": null
  },
  {
    "area": null,
    "zone": null,
    "id": "13",
    "name": "Filter13",
    "location": null,
    "site": null,
    "monitoringStatus": null
  },
  {
    "area": null,
    "zone": null,
    "id": "14",
    "name": "Filter14",
    "location": null,
    "site": null,
    "monitoringStatus": null
  },
  {
    "area": null,
    "zone": null,
    "id": "15",
    "name": "Filter15",
    "location": null,
    "site": null,
    "monitoringStatus": null
  }
]

const organizations = [
  {
    "name": "INOVA Health System",
    "primaryContact": "Carl Moss",
    "contactFirstName": "Carl",
    "contactLastName": "Moss",
    "location": "Brooklyn",
    "type": "Customer",
    "id": "15",
    "icon": require('../img/icons/hospital.svg'),
    "statusActive": false 
  },
  {
    "name": "Alston Mantics",
    "primaryContact": "Bernard Hubbard",
    "contactFirstName": "Bernard",
    "contactLastName": "Hubbard",
    "location": "Davinborough",
    "type": "Integration Partner",
    "id": "16",
    "icon": require('../img/icons/company.svg'),
    "statusActive": true 
  },
  {
    "name": "Biomatics",
    "primaryContact": "Miguel Massey",
    "contactFirstName": "Miguel",
    "contactLastName": "Massey",
    "location": "Lakinville",
    "type": "Reseller",
    "id": "17",
    "icon": require('../img/icons/hospital.svg'),
    "statusActive": true 
  },
  {
    "name": "Copeland Pharmaceutical Frontiers",
    "primaryContact": "Richard Erickson",
    "contactFirstName": "Richard",
    "contactLastName": "Erickson",
    "location": "New Raeganport",
    "type": "Integration Partner",
    "id": "18",
    "icon": require('../img/icons/company.svg'),
    "statusActive": false 
  },
  {
    "name": "Medical Of Warsaw",
    "primaryContact": "Aiden Briggs",
    "contactFirstName": "Aiden",
    "contactLastName": "Briggs",
    "location": "Caesarhaven",
    "type": "Reseller",
    "id": "19",
    "icon": require('../img/icons/hospital.svg'),
    "statusActive": true 
  },
  {
    "name": "Medical Wholesome Applicat…",
    "primaryContact": "Rodney Russell",
    "contactFirstName": "Rodney",
    "contactLastName": "Russell",
    "location": "Twilaburgh",
    "type": "Integration Partner",
    "id": "20",
    "icon": require('../img/icons/hospital.svg'),
    "statusActive": false 
  },
  {
    "name": "American Medical Healthcare",
    "primaryContact": "Clyde Greer",
    "contactFirstName": "Clyde",
    "contactLastName": "Greer",
    "location": "Raphaelleberg",
    "type": "Customer",
    "id": "21",
    "icon": require('../img/icons/hospital.svg'),
    "statusActive": false 
  },
  {
    "name": "Assured Industries",
    "primaryContact": "Bernard McCoy",
    "contactFirstName": "Bernard",
    "contactLastName": "McCoy",
    "location": "East Kiarra",
    "type": "Customer",
    "id": "22",
    "icon": require('../img/icons/company.svg'),
    "statusActive": true
  },
  {
    "name": "Low Tide Enterprise",
    "primaryContact": "Lloyd Ross",
    "contactFirstName": "Lloyd",
    "contactLastName": "Ross",
    "location": "East Westleyville",
    "type": "Customer",
    "id": "23",
    "icon": require('../img/icons/company.svg'),
    "statusActive": false 
  },
  {
    "name": "Low Tide Enterprise",
    "primaryContact": "Jay Shaw",
    "contactFirstName": "Jay",
    "contactLastName": "Shaw",
    "location": "Tokyo",
    "type": "Customer",
    "id": "24",
    "icon": require('../img/icons/company.svg'),
    "statusActive": true 
  },
  {
    "name": "Low Tide Enterprise",
    "primaryContact": "Jay Shaw",
    "contactFirstName": "Jay",
    "contactLastName": "Shaw",
    "location": "Tokyo",
    "type": "Customer",
    "id": "25",
    "icon": require('../img/icons/company.svg'),
    "statusActive": true 
  },
  {
    "name": "Low Tide Enterprise",
    "primaryContact": "Jay Shaw",
    "contactFirstName": "Jay",
    "contactLastName": "Shaw",
    "location": "Tokyo",
    "type": "Customer",
    "id": "26",
    "icon": require('../img/icons/company.svg'),
    "statusActive": true 
  },
  {
    "name": "Low Tide Enterprise",
    "primaryContact": "Jay Shaw",
    "contactFirstName": "Jay",
    "contactLastName": "Shaw",
    "location": "Tokyo",
    "type": "Customer",
    "id": "27",
    "icon": require('../img/icons/company.svg'),
    "statusActive": true 
  },
  {
    "name": "Low Tide Enterprise",
    "primaryContact": "Jay Shaw",
    "contactFirstName": "Jay",
    "contactLastName": "Shaw",
    "location": "Tokyo",
    "type": "Customer",
    "id": "28",
    "icon": require('../img/icons/company.svg'),
    "statusActive": true 
  },
  {
    "name": "Low Tide Enterprise",
    "primaryContact": "Jay Shaw",
    "contactFirstName": "Jay",
    "contactLastName": "Shaw",
    "location": "Tokyo",
    "type": "Customer",
    "id": "29",
    "icon": require('../img/icons/company.svg'),
    "statusActive": true 
  }
]

const deliveries = [
  {
    route: "Wall Mart, Main AV",
    date: "Agost 19th 2021",
    cart: "C123456",
    rpc: "B987654",
    upc: "U678924"
  },
  {
    route: "Costco, 1st AV",
    date: "Agost 17th 2021",
    cart: "C546456",
    rpc: "B558654",
    upc: "U678924"
  },
  {
    route: "Wallgreens, 1st AV",
    date: "Agost 18th 2021",
    cart: "C999856",
    rpc: "B984454",
    upc: "U118924"
  },
  {
    route: "Wall Mart, Main AV",
    date: "Agost 18th 2021",
    cart: "C456456",
    rpc: "B9223354",
    upc: "U651921"
  },
  {
    route: "FreshDirect, 2nd street",
    date: "Agost 17th 2021",
    cart: "C123456",
    rpc: "B987654",
    upc: "U678924"
  },
  {
    route: "FreshDirect, 2nd street",
    date: "Agost 17th 2021",
    cart: "C554456",
    rpc: "B985521",
    upc: "U444655"
  },
  {
    route: "Costco, 1st street",
    date: "June 17th 2021",
    cart: "C444456",
    rpc: "B985441",
    upc: "U554655"
  },
  {
    route: "FreshDirect, 2nd street",
    date: "July 12th 2021",
    cart: "C556456",
    rpc: "B985963",
    upc: "U945655"
  },
  {
    route: "FreshDirect, 2nd street",
    date: "Agost 17th 2021",
    cart: "C558276",
    rpc: "B785721",
    upc: "U4977655"
  },
  {
    route: "Wall Mart, Main AV",
    date: "July 22th 2021",
    cart: "C589656",
    rpc: "B955421",
    upc: "U336655"
  },
  {
    route: "Wall Mart, Franklin AV",
    date: "Agost 28th 2021",
    cart: "C559652",
    rpc: "B985482",
    upc: "U466545"
  },
  {
    route: "Costco, 2nd street",
    date: "June 21th 2021",
    cart: "C554456",
    rpc: "B983521",
    upc: "U44555"
  },
]

export default {
  tableData,
  savedFavFilters,
  organizations,
  filterFields,
  deliveries
}