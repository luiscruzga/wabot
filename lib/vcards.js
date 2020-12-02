const _vCard = require('vcard');
const CardJs = require('vcards-js');
const card = new _vCard();
const typeVcardDefault = require('../types/vcardContent.json');

class Vcard {
    extractVcard(content){
        return new Promise((resolve, reject) => {
            card.readData(content, (err, json) => {
                resolve(json);
            });
        });
    }

    createVcard(data){    
        var vCard = CardJs();
        let vcardTemplate = typeVcardDefault.spec;
        let _data = Object.assign(vcardTemplate, data);
        //set properties
        if(_data.firstName !== '') vCard.firstName = _data.firstName;
        if(_data.middleName !== '') vCard.middleName = _data.middleName;
        if(_data.lastName !== '') vCard.lastName = _data.lastName;
        if(_data.organization !== '') vCard.organization = _data.organization;
        
        if(_data.birthday !== '') vCard.birthday = new Date(_data.birthday);
        if(_data.title !== '') vCard.title = _data.title;
        if(_data.url !== '') vCard.url = _data.url;
        if(_data.note !== '') vCard.note = _data.note;

        if(_data.nickname !== '') vCard.nickname = _data.nickname;
        if(_data.namePrefix !== '') vCard.namePrefix = _data.namePrefix;
        if(_data.nameSuffix !== '') vCard.nameSuffix = _data.nameSuffix;
        if(_data.gender !== '') vCard.gender = _data.gender;
        if(_data.role !== '') vCard.role = _data.role;

        //set other phone numbers
        if(_data.homePhone !== '') vCard.homePhone = _data.homePhone;
        if(_data.workPhone !== '') vCard.workPhone = _data.workPhone;
        if(_data.cellPhone !== '') vCard.cellPhone = _data.cellPhone;
        if(_data.pagerPhone !== '') vCard.pagerPhone = _data.pagerPhone;

        //set fax/facsimile numbers
        if(_data.homeFax !== '') vCard.homeFax = _data.homeFax;
        if(_data.workFax !== '') vCard.workFax = _data.workFax;

        //set email addresses
        if(_data.email !== '') vCard.email = _data.email;
        if(_data.workEmail !== '') vCard.workEmail = _data.workEmail;

        //set address information
        if(_data.homeAddressLabel !== '') vCard.homeAddress.label = _data.homeAddressLabel;
        if(_data.homeAddressStreet !== '') vCard.homeAddress.street = _data.homeAddressStreet;
        if(_data.homeAddressCity !== '') vCard.homeAddress.city = _data.homeAddressCity;
        if(_data.homeAddressStateProvince !== '') vCard.homeAddress.stateProvince = _data.homeAddressStateProvince;
        if(_data.homeAddressPostalCode !== '') vCard.homeAddress.postalCode = _data.homeAddressPostalCode;
        if(_data.homeAddressCountryRegion !== '') vCard.homeAddress.countryRegion = _data.homeAddressCountryRegion;

        if(_data.workAddressLabel !== '') vCard.workAddress.label = _data.workAddressLabel;
        if(_data.workAddressStreet !== '') vCard.workAddress.street = _data.workAddressStreet;
        if(_data.workAddressCity !== '') vCard.workAddress.city = _data.workAddressCity;
        if(_data.workAddressStateProvince !== '') vCard.workAddress.stateProvince = _data.workAddressStateProvince;
        if(_data.workAddressPostalCode !== '') vCard.workAddress.postalCode = _data.workAddressPostalCode;
        if(_data.workAddressCountryRegion !== '') vCard.workAddress.countryRegion = _data.workAddressCountryRegion;

        //set social media URLs
        if(_data.socialUrlsFacebook !== '') vCard.socialUrls['facebook'] = _data.socialUrlsFacebook;
        if(_data.socialUrlsLinkedin !== '') vCard.socialUrls['linkedIn'] = _data.socialUrlsLinkedin;
        if(_data.socialUrlsTwitter !== '') vCard.socialUrls['twitter'] = _data.socialUrlsTwitter;
        if(_data.socialUrlsFlickr !== '') vCard.socialUrls['flickr'] = _data.socialUrlsFlickr;
        if(_data.socialUrlsCustom !== '') vCard.socialUrls['custom'] = _data.socialUrlsCustom;

        //link to image
        if(_data.photo !== ''){
            if(_data.photo.indexOf('http') !== -1){
                vCard.photo.attachFromUrl(_data.photo, 'JPEG');
            }else {
                vCard.photo.attachFromUrl(_data.photo);
            }
        }
        vCard.version = '3.0';

        return vCard.getFormattedString();
    }
}

module.exports = Vcard;