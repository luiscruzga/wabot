// Modules to install separately
const request = require('request');
const AsciiTable = require('ascii-table');
const countries = require('./config/countries.json');
function sortByKey(in_key){
	return function(a, b) {
		if(a[in_key] > b[in_key]){
			return -1;
		}else if (a[in_key] < b[in_key]){
			return 1;
		}else{
			return 0;
		}
	}
}

var pad = function(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

var generateAsciiTable = function(data, in_title = '', in_sort = {}){
    if(data.table.rows.length > 0){
        var table = new AsciiTable().fromJSON({
            title: in_title,
            heading: data.table.headers,
            rows: data.table.rows
        })

        for(var i=0; i < data.table.rows[0].length; i++){
            table.setAlign(i, AsciiTable.CENTER);
        }

        if(typeof in_sort.column != 'undefined' && in_sort.column != undefined){
            table.sortColumn(in_sort.column, function(a, b) {
                if(typeof in_sort.order != 'undefined' && in_sort.order != undefined){
                    if(in_sort.order == 'DESC'){
                        return b - a
                    }else{
                        return a - b
                    }
                }else{
                    return b - a
                }
            })
        }
        const message = table.toString();
        return message;

    }else{
        return '';
    }

}

function getAllCases(){
	return new Promise(function(resolve, reject) {
		request('https://corona.lmao.ninja/v2/countries', function(error, response, body) {
			if(error){
				reject(error);
			}else if(response.statusCode != 200){
				reject(body.toString('utf8'));
			}else{
				let _info = JSON.parse(body.toString('utf8'));
				resolve(_info);
			}
		});
	})
}

const defaultConfig = {
    idChat: '',
    search: '',
    title: 'Coronavirus',
    rowsToDisplay: 10,
    headers: ["Country", "Cases", "Today", "Deaths", "Recovery", "Actives"],
    filters: [
        {
            "name": "deaths",
            "values": ["death", "deaths", "muerte", "muertes", "muertos"]
        },
        {
            "name": "cases",
            "values": ["cases", "case", "casos", "caso"]
        },
        {
            "name": "todayDeaths",
            "values": ["today", "hoy"]
        },
        {
            "name": "active",
            "values": ["active", "activos", "activo"]
        }
    ],
    messageError: '*Ooops, an error occurred while trying to search, try again later*',
    messageNoDataFound: '*No information about your search could be found*'
}
/**
 * Plugin to obtain information on the coronavirus by countries, cases, deaths, etc.
 * @function coronavirus
 * @memberof Plugins
 * @param {string} idChat - Chat id to send the new image to
 * @param {string} search - Search parameter (country, cases, deaths, etc)
 * @param {string} title - Title to display in image
 * @param {number} rowsToDisplay - Number of countries to show in the image
 * @param {string[]} headers - Name of the headers to display
 * @param {object[]} filters - Configuration of the filters to be able to search
 * @param {string} filters.name - Filter name
 * @param {string[]} filters.values - Possible values ​​that the user can enter
 * @param {string} messageError - Message to send in case of error
 * @param {string} messageNoDataFound - Message to send in case of not finding information
 * @see {@link https://deepai.org/machine-learning-model/toonify|DeepAiToonify}
 */
module.exports = {
    /**
    * Id - Name of the plugin to use
    * @property {string}  id - Name of the plugin to use
    */
    id: 'coronavirus',
    plugin(_args) {
        const args = this.mergeOpts(defaultConfig, _args);
        if (args.idChat !== '') {
            let params = args.search.trim();
            getAllCases()
            .then(data => {
                let _info = [];
                let sortKey = '';
                let _country = '';
                let _data;
                let _exists = false;
                if(params.length > 0){
                    let args_ = params.split(' ');
                    args_.forEach(fil_ => {
                        _exists = false;
                        const _value = fil_.toLowerCase();
                        args.filters.forEach(filter => {
                            if(filter.values.indexOf(_value) !== -1){
                                _exists = true;
                                sortKey = filter.name;
                            }
                        })
                        /*SI NO ENCONTRO COMO FILTRO DEBE SER PAIS*/
                        if(!_exists){
                            let infoCountry = countries.find(obj => (obj.nombre.toLowerCase().indexOf(_value) !== -1 || obj.name.toLowerCase().indexOf(_value) !== -1))
                            if(infoCountry !== undefined){
                                _country = infoCountry.name.toLowerCase();
                            }
                        }
                    })
                }

                if(_country !== ''){
                    orderedData = data.find(obj => obj.country.toLowerCase() === _country);
                    
                    if(orderedData !== undefined){
                        _info.push({
                            'country': orderedData.country,
                            'cases': orderedData.cases,
                            'today': orderedData.todayCases,
                            'deaths': orderedData.deaths,
                            'recovered': orderedData.recovered,
                            'active': orderedData.active,
                            'casesPerMillon': orderedData.casesPerOneMillion,
                            'deathsPerMillon': orderedData.deathsPerOneMillion
                        });
                    }
                }else{
                    _data = data;
                    let orderedData;
                    if(sortKey === ''){
                        orderedData = _data.sort(sortByKey('cases'));
                    }else{
                        orderedData = _data.sort(sortByKey(sortKey));
                    }
                    
                    let cont = 0;
                    orderedData.forEach(register => {
                        cont++;
                        if(cont <= args.rowsToDisplay){
                            _info.push({
                                'country': register.country,
                                'cases': register.cases,
                                'today': register.todayCases,
                                'deaths': register.deaths,
                                'recovered': register.recovered,
                                'active': register.active,
                                'casesPerMillon': register.casesPerOneMillion,
                                'deathsPerMillon': register.deathsPerOneMillion
                            });
                        }
                    })
                }
                if(_info.length === 0){
                    this.sendMessage({
                        "idChat": args.idChat, 
                        "message": args.messageNoDataFound
                    });
                }else{
                    let registers = [];
                    _info.forEach(register => {
                        registers.push([register.country, register.cases, register.today, register.deaths, register.recovered, register.active]);
                    })
                    let dataAscii = {
                        "table": {
                            "headers": args.headers,
                            "rows": registers
                        }
                    }

                    let title = args.title;
                    const message = generateAsciiTable(dataAscii, title);
                    if (message != ''){
                        this.sendText2Image({
                            "idChat": args.idChat, 
                            "message": message
                        });
                    }else{
                        this.sendMessage({
                            "idChat": args.idChat, 
                            "message": args.messageError
                        });
                    }
                }
            })
            .catch(err => {
                this.sendMessage({
                    "idChat": args.idChat, 
                    "message": args.messageError
                });
            })
        }
    }
};
