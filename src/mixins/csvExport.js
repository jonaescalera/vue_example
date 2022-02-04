import constans from '../constants/id-types'

export const csvMixin = {
    methods: {
        // downloads a csv file from an array of data
        csvExport(arrData, name) {
          //Byte order mark  
          let universalBOM = "\uFEFF";
          let csvContent = [];
          csvContent += [
            Object.keys(arrData[0]).join(","),
            ...arrData.map(item => Object.values(item).join(","))
          ]
            .join("\n")
            .replace(/(^\[)|(\]$)/gm, "");

          const data = 'data:text/csv; charset=utf-8,' + encodeURIComponent(universalBOM+csvContent);
          const link = document.createElement("a");
          link.setAttribute("href", data);
          link.setAttribute("download", name + ".csv");
          link.click();
        },
        // converts a csv file into a JSON import devices
        createJSONForImportDevices(csv) {
          let lines = csv.split("\n");
          let result = [];
          let headers = lines[0].split(",");
          let name = headers.find(h=> h.trim() === 'name');
          let mac_address = headers.find(h=> h.trim() === constans.MAC_ADDRESS);
          if (!mac_address || !name) {
            //not a valid csv format, must be 2 columns only
            return
          }
          for (let i=1;i<lines.length;i++) {
              let obj = {};
              let currentline = lines[i].split(",");
              for(let j=0; j<headers.length; j++){   
                if (currentline && currentline[j]) {
                  obj[headers[j].trim()] = currentline[j].trim();
                }               
              }
              //avoid empty lines
              if (obj.name || obj.macId ) {
                result.push(obj);
              }
          }
          return result;
        },
        createJSONForImportGateways(csv) {
          let lines = csv.split("\n");
          let result = [];
          let headers = lines[0].split(",");
          let name = headers.find(h=> h.trim() === 'name');
          let node_address = headers.find(h=> h.trim() === constans.NODE_ADDRESS);
          if (name != 'name' || node_address != constans.NODE_ADDRESS) {
            return
          }
          for (let i=1;i<lines.length;i++) {
              let obj = {};
              let currentline = lines[i].split(",");
              for(let j=0; j<headers.length; j++){   
                if (currentline && currentline[j]) {
                  obj[headers[j].trim()] = currentline[j].trim();
                }               
              }
              //avoid empty lines
              if (obj.name || obj.node_address ) {
                result.push(obj);
              }
          }
          return result;
        },
        removeCol(csv, col) {
          const lines = csv.split("\n");
          const headers = lines[0].split(",");
          const colNameToRemove = headers.find(h=> h.trim() === col);
          const index = headers.indexOf(colNameToRemove);
          let newLines = [];
          lines.map((line)=>{
            let fields = line.split(",");
            fields.splice(index, 1)
            newLines.push(fields)
          })
          let arrData = '';
          for (let index = 0; index < newLines.length; index++) {
            const element = newLines[index];
            arrData += element.join(',') + '\n'
          }
          return arrData;
        },  
        // downloads a csv file obtained from the server
        downloadFile(filename, data){
          const blob = new Blob([data], { type: 'octet/stream' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style = 'display: none';
          a.href = url;
          a.download = `${filename}.csv`
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
      }
    }
  };