function main() {
    let tableText = decodeURI(window.location.href.split('?')[1]);
    $('div.table table').append(tableText);
    $('i.fa').css({display: 'none'});
    $('tfoot tr:not(:first-child) td').each((ix, el)=> {
        let val = $(el).text().replace('.', ',');
        $(el).html(`<p>${val}</p>`);
    }).find('p').on('click', (e)=> {
        $(e.target).toggle();
    }).parent('td').on('click', (e)=> {
        $(e.target).children('p').toggle();
    });
    $('tbody td input').each((ix, el)=> {
        $(el).attr('disabled', false);
        let val = $(el).val().replace(',', '.');
        val = parseFloat(val);
        if(!val && val != 0) return;
        $(el).val(val.toFixed(3));
    });
}