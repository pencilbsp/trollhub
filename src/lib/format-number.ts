import numeral from 'numeral';

numeral.register('locale', 'vi-custom', {
    delimiters: {
        thousands: '.',
        decimal: ',',
    },
    abbreviations: {
        thousand: ' N',
        million: ' Tr',
        billion: ' B',
        trillion: ' T',
    },
    ordinal: function (number) {
        return number === 1 ? 'st' : 'th';
    },
    currency: {
        symbol: '₫',
    },
});

numeral.register('format', 'customFormat', {
    regexps: {
        format: /(\d+)(\.\d{1,2})?[a-z]?/,
        unformat: /(\d+)(\.\d{1,2})?[a-z]?/,
    },
    format: function (value, format, roundingFunction) {
        let formattedValue;
        if (value < 1000) {
            formattedValue = numeral._.numberToFormat(value, '0', roundingFunction); // Không có chữ số thập phân
        } else {
            formattedValue = numeral._.numberToFormat(value, '0.0a', roundingFunction);
        }
        if (formattedValue.includes('K')) {
            return formattedValue.replace('K', ' N');
        } else if (formattedValue.includes('M')) {
            return formattedValue.replace('M', ' Tr');
        } else {
            return formattedValue;
        }
    },
    unformat: function (string) {
        if (string.includes(' N')) {
            return numeral._.stringToNumber(string.replace(' N', 'K'));
        } else if (string.includes(' Tr')) {
            return numeral._.stringToNumber(string.replace(' Tr', 'M'));
        } else {
            return numeral._.stringToNumber(string);
        }
    },
});

numeral.locale('vi-custom');

export default numeral;
