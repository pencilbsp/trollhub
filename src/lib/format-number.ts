import numeral from "numeral";

numeral.register("locale", "vi-custom", {
  delimiters: {
    thousands: ".",
    decimal: ",",
  },
  abbreviations: {
    thousand: " N",
    million: " Tr",
    billion: " B",
    trillion: " T",
  },
  ordinal: function (number) {
    return number === 1 ? "st" : "th";
  },
  currency: {
    symbol: "₫",
  },
});

numeral.locale("vi-custom");

export default numeral;
