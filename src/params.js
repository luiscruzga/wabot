let Params = [];
const argument_regex1 = /"\b[^"]*(?:(?!")<[^"]*)*"/gi
const argument_regex2 = /'\b[^']*(?:(?!')<[^']*)*'/gi

const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const replaceAll = (str, term, replacement) => {
  return str.replace(new RegExp(escapeRegExp(term), 'g'), replacement);
}

const assignParams = (userParams, intent) => {
    let values = {};
    if (intent.params && intent.params.length > 0){
        intent.params.forEach((intentParam) => {
            // Get user supplied value
            if (!intentParam.isNumber){
                let valueParam = Object.keys(intentParam.values).find(key => Object.keys(userParams).find(el => userParams[el].toLowerCase().trim() === intentParam.values[key].toLowerCase().trim()))
                values[intentParam.name] = typeof valueParam !== 'undefined' ? intentParam.values[valueParam] : '';
            } else {
                values[intentParam.name] = '';
            }
        });
        let pendingValues = Object.keys(values).filter(key => values[key] === '');
        if (pendingValues.length > 0){
            let pendingParams = userParams.filter(param => !Object.keys(values).find(key => values[key].toLowerCase().trim() === param.toLowerCase().trim()));
            pendingValues.forEach(pendingValue => {
                const _param = intent.params.find(obj => obj.name === pendingValue);
                if (_param.isNumber && _param.values === 'any'){
                    let _value = pendingParams.find(el => !isNaN(parseInt(el)));
                    if (_value !== undefined){
                        values[pendingValue] = _value;
                        pendingParams.splice(pendingParams.indexOf(_value),1);
                    }
                } else if (_param.values === 'any' && pendingParams.length > 0) {
                    values[pendingValue] = pendingParams[0];
                    pendingParams.splice(0,1);
                }
            });
            if (pendingParams.length > 0) {
                values['others'] = pendingParams;
            }
        } 
    }
    return values;
}

Params.getParams = (_command, arguments) => {
    if (_command.params 
        && _command.params.length === 1
        && _command.params[0].values === 'any'
    ){ 
        let value = {}
        value[_command.params[0].name] = arguments;
        return value;
    } else {
        let params = [];
        let paramsRegex = arguments.match(argument_regex1);
        if (paramsRegex){
            paramsRegex.forEach((_param) => {
                arguments = arguments.replace(_param, '').trim();
                params.push(replaceAll(_param, '"', ''));
            });
        }
        paramsRegex = arguments.match(argument_regex2);
        if (paramsRegex){
            paramsRegex.forEach((_param) => {
                arguments = arguments.replace(_param, '').trim();
                params.push(replaceAll(_param, "'", ""));
            });
        }
        Array.prototype.push.apply(params, arguments.split(' '));
        params = params.filter(el => el !== '');

        let values = assignParams(params, _command);
        return values;
    }
}

Params.getNextPendingValue = (_command, values) => {
    let pendingValues = Object.keys(values).filter(key => values[key] === '');
    if (pendingValues.length > 0){
        return _command.params.findIndex(command => (
                command.name === pendingValues[0] 
                && ( 
                    (typeof command.required !== 'undefined' && command.required)
                    || (typeof command.required === 'undefined')
                )
            ));
    } else {
        return 'no_data';
    }
}

module.exports = Params;