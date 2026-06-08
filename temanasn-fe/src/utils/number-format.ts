export const formatCurrency = (number: number, onlyNumber = false) => {
  if (!number) return 'Rp. 0';

  // number = number; // Menghapus semua digit "0" dari awal string

  let number_string = number
      .toString()
      .replace(/^0+/, '')
      .replace(/[^,\d]/g, '')
      .toString(),
    split = number_string.split(','),
    sisa = split[0].length % 3,
    rupiah = split[0].substr(0, sisa),
    ribuan = split[0].substr(sisa).match(/\d{3}/gi);

  if (ribuan) {
    let separator = sisa ? '.' : '';
    rupiah += separator + ribuan.join('.');
  }

  rupiah = split[1] != undefined ? rupiah + ',' + split[1] : rupiah;
  return onlyNumber ? rupiah : rupiah ? 'Rp. ' + rupiah : '';
};

export const currencyToNumber = (currency: string) => {
  return parseInt(currency.toString().replace(/[^0-9]/g, ''));
};
