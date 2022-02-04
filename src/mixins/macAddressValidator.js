export const macAddressValidator = {
    computed: {
        formatMacAddress(value) {
            if (!value) {
                return '';
            }
            let formated = value.replace(/:| |[^0-9^a-f]/gi, '').slice(0, 12);
            return (formated.match(/.{1,2}/g) || []).join(':');
        }
    }
};