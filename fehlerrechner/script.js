/* 
todo:
- trash-icon
- Fehlerfortpflanzung
*/

const sin = x=>Math.sin(x);
const cos = x=>Math.cos(x);
const E = Math.E;
const PI = Math.PI;
const tan = x=>Math.tan(x);
const ln = x=>Math.log(x);
const log = x=>Math.log10(x);
const pow = (x, y)=>Math.pow(x, y);
const sqrt = x=>Math.sqrt(x);

const k = Object.freeze({
    'sysErr': 0,
    'sum': 1,
    'mean': 2,
    'sdev': 3,
    'sdevM': 4,
    'error': 5,
    'vals': 6,
    'calcs': 7
});

class Table {
    constructor($table, id, rows, ...columns) {
        this.id = id;
        this.$table = $table;
        this.data = [];
        this.len = Object.keys(k).length;
        for(let i=0; i<this.len; i++) this.data.push({});
        for(let cID of columns) {
            this.createColumn(cID, k.vals);
        }
        //remove trash form first column
        for(let i=0; i<rows; i++) this.createRow();
        this.setEventListener();
        this.setLayoutListener();
    }

    createColumn(id, type) {
        this.$table.find('thead th:last-child').before(`
            <th><i class="fa fa-trash-o" aria-hidden="true"></i><i class="fa fa-files-o" aria-hidden="true"></i><input type="text" class="${id}" value="${id}" /></th>
        `);
        this.$table.find('tbody tr td:last-child').before(`<td><input type="number"/></td>`);
        this.$table.find('tfoot tr').not(':last').append('<td></td>');
        this.$table.find('tfoot tr:first-child td').not(':first').html('<input class="error" type="number"/>');
        for(let i in this.data) {
            this.data[i][id] = null;
        }
        this.data[type][id] = []
        let i;
        for(let t in this.data[k.vals]) {
            i = this.data[k.vals][t].length;
            break;
        }
        for(let k=0; k<i; k++) this.data[type][id].push(null);
        if(type == k.vals) {
            delete this.data[k.calcs][id];
        } else if(type == k.calcs) {
            delete this.data[k.vals][id];
        } else {
            throw new Error("Unknown Type: must be vals: 0 or calcs: 1");
        }
    }

    dropColumn(id) {
        for(let i in this.data) {
            if(this.data[i].hasOwnProperty(id)) delete this.data[i][id];
        }       
    }

    renameColumn(oldID, newID) {
        if(oldID == newID) return;
        for(let i in this.data) {            
            if(this.data[i].hasOwnProperty(oldID)) {
                this.data[i][newID] = this.data[i][oldID];
                delete this.data[i][oldID];
            }
        }
    }

    setVal(id, row, val, type) {
        if(this.data[type].hasOwnProperty(id)) {
            this.data[type][id][row] = val;
        }
        if(type == k.vals) this.updateData();
    }

    setSysErr(id, val) {
        if(this.data[k.sysErr].hasOwnProperty(id)) {
            if(!val) val = 0;
            this.data[k.sysErr][id] = val;
        }
        this.updateData();

    }

    deleteVal(id, row) {
        if(this.data[k.vals].hasOwnProperty(id)) {
            this.data[k.vals][id].splice(row, 1);
        }
        this.updateData()
    }

    createRow() {
        let i;
        for(let t in this.data[k.vals]) {
            i = this.data[k.vals][t].length;
            break;
        }
        const tbodyTemplate = `
        <tr>
            <td>${i+1}</td>
            <td><i class="fa fa-trash-o" aria-hidden="true"></i></td>
        </tr>`;
        let cLen = Object.keys(this.data[k.vals]).length;
        cLen += Object.keys(this.data[k.calcs]).length;
        this.$table.find('tbody').append(tbodyTemplate).find('tr:last-child td:last-child').before('<td><input type="number"/></td>'.repeat(cLen));
        for(let t of [k.vals, k.calcs]) {
            for(let i in this.data[t]) {
                this.data[t][i].push(null);
            }
        }
        style();
    }

    deleteRow(n) {
        for(let t of [k.vals, k.calcs]) {
            for(let i in this.data[t]) {
                this.data[t][i].splice(n, 1);
            }
        }
        this.updateData();
    }

    updateData(notInitialCall) {
        for(let key in this.data[k.calcs]) {
            let calc = this.$table.find('thead th input.' + key).val().split("=")[1];
            this.calculate(calc, key);
        }
        for(let t of [k.vals, k.calcs]) {
            for(let i in this.data[t]) {
                let sum = null,
                    n = 0;
                for(let val of this.data[t][i]) {
                    if(!val && val != 0) continue;
                    sum += val;
                    n++;
                }
                this.data[k.sum][i] = sum;
                let mean = sum/n; 
                this.data[k.mean][i] = mean;
                if(t == k.calcs) {
                    this.errorCalc(i);
                    continue;
                }
                if(n<2) continue;
                let squaredSum = 0;
                for(let val of this.data[t][i]) {
                    if(!val) continue;
                    squaredSum += (val-mean) ** 2;
                }
                let sdev = Math.sqrt(squaredSum/(n-1));
                this.data[k.sdev][i] = sdev;
                let sdevM = sdev/Math.sqrt(n);
                this.data[k.sdevM][i] = sdevM;
                let sysErr = this.data[k.sysErr][i];
                let err = Math.sqrt(sysErr**2 + sdev**2);
                this.data[k.error][i] = err;
            }
        }
        if(this.data[k.calcs].hasOwnProperty('L1') && this.data[k.calcs].hasOwnProperty('L2')) {
            let n = this.$table.find('tbody tr').length;
            let b = this.data[k.sum]['L1'] - n*this.data[k.mean][this.x]*this.data[k.mean][this.y];
            b /= this.data[k.sum]['L2'] - n*Math.pow(this.data[k.mean][this.x], 2);
            let a = this.data[k.mean][this.y] - b*this.data[k.mean][this.x];
            this.n = n;
            this.a = a.toFixed(4);
            this.b = b.toFixed(4);
            let sa, sb, sy;
            if(this.data[k.calcs].hasOwnProperty('d2') && this.data[k.calcs].hasOwnProperty('L3')) {
                sb = this.data[k.sum]['d2'];
                sb /= this.data[k.sum]['L3'];
                sb /= n-2;
                sa = sb*this.data[k.sum]['L2']/n;
                sb = Math.sqrt(sb);
                sa = Math.sqrt(sa);
                sy = Math.sqrt(this.data[k.sum]['d2']/(n-2));
                this.$table.find('div#lin-reg span.a').text(a.toFixed(4));
                this.$table.find('div#lin-reg span.b').text(b.toFixed(4));
                this.$table.find('div#lin-reg span.sa').text(sa.toFixed(4));
                this.$table.find('div#lin-reg span.sb').text(sb.toFixed(4));
                this.$table.find('div#lin-reg span.sy').text(sy.toFixed(4));
            }
        }
        if(!notInitialCall) {
            for(let keyT in tables) {
                if(keyT == this.id) continue;
                tables[keyT].updateData(true);
            }
        }
        this.setDOM();
    }

    errorCalc(id) {
        let derivatives = [],
            variables = [];
        let sdevM = {};
        const calc = this.$table.find('thead th input.' + id).val().split("=")[1];
        let n = 5;
        let dx = Math.pow(10, -n);
        for(let keyT in tables) {
            for(let t of [k.vals, k.calcs]) {
                for(let keyData in tables[keyT].data[t]) {
                    let search = `${keyT}.${keyData}`;
                    if(calc.includes(search)) {
                        variables.push(search);
                        sdevM[search] = tables[keyT].data[k.sdevM][keyData];
                    }
                }
            }
        }
        for(let t of [k.vals, k.calcs]) {
            for(let key in this.data[t]) {
                let i = 0;
                while(calc.indexOf(key, i) >= 0) {
                    let ix = calc.indexOf(key, i);
                    if(calc[ix-1] != "." || !calc[ix-1]) {
                        variables.push(key);
                        sdevM[key] = this.data[k.sdevM][key];
                    }
                    i = ix + 1;
                }
            }
        }
        variables = [...new Set(variables)];
        for(let variable of variables) {
            let ixs = [];
            let i = 0;
            while(calc.indexOf(variable, i) >= 0) {
                let ix = calc.indexOf(variable, i);
                if(calc[ix-1] != "." || !calc[ix-1]) {
                    ixs.push(ix);
                }
                i = ix + 1;
            }
            let derivative = calc;
            for(ix of ixs.reverse()) {
                let sub = `(${variable} + ${dx})`;
                derivative = derivative.slice(0, ix) + sub + derivative.slice(ix + variable.length);
            }
            derivatives.push(`(${derivative}-(${calc}))/${dx}`);
        }
        let result = 0;
        for(let iDer in derivatives) {
            let derivative = derivatives[iDer],
                variable = variables[iDer];
            let tmp;
            try {
                tmp = this.evaluateMean(derivative);
            } catch(error) {
                console.error(error);
                return;
            }
            tmp *= parseFloat(sdevM[variable]);
            tmp = Math.pow(tmp, 2);
            result += tmp;
        }
        result = Math.sqrt(result);
        this.data[k.error][id] = result;
    }

    evaluateMean(calc) {
        let val = undefined;
        let expressions = [];
        let calcLoc = calc;
        for(let keyT in tables) {
            for(let t of [k.vals, k.calcs]) {
                for(let keyData in tables[keyT].data[t]) {
                    let search = `${keyT}.${keyData}`,
                        sub = `tables['${keyT}'].data['${k.mean}']['${keyData}']`;
                    if(calcLoc.includes(search)) expressions.push(sub);
                    calcLoc = calcLoc.split(search).join(sub);
                }
            }
        }
        for(let key in this.data[k.mean]) {
            let ixs = [];
            let i = 0;
            while(calcLoc.indexOf(key, i) >= 0) {
                let ix = calcLoc.indexOf(key, i);
                if(calcLoc[ix-1] != "'" || !calcLoc[ix-1]) ixs.push(ix);
                i = ix + 1;
            }
            for(ix of ixs.reverse()) {
                let sub = `this.data['${k.mean}']['${key}']`;
                calcLoc = calcLoc.slice(0, ix) + sub + calcLoc.slice(ix + key.length);
                expressions.push(sub);
            }
        }
        let defined = true;
        for(let exp of expressions) {
            let res = eval(exp);
            if(!res && res != 0) {
                defined = false;
                break;
            }
        }
        if(defined) val = eval(calcLoc);
        return val;
    }

    idFromIx(ix) {
        return this.$table.find(`thead th:nth-child(${ix+1}) input`).val().split("=")[0];
    }

    setDOM() {
        this.$table.find('tfoot tr').each((iR, tr)=> {
            if(iR == 0) return;
            $(tr).find('td').each((iC, td)=> {
                if(iC == 0) return;
                let id = this.idFromIx(iC);
                let val = this.data[iR][id];
                if(!val && val != 0) {
                    $(td).text('');
                    return;
                }
                $(td).text(val.toFixed(3));
            });
        });
        for(let key in this.data[k.calcs]) {
            let ix = this.$table.find('thead th input.' + key).parent('th').prevAll().length;
            this.$table.find('tbody tr').each((i, tr)=> {
                $(tr).children('td').each((j, td)=> {
                    if(j != ix) return;
                    let val = this.data[k.calcs][key][i];
                    if(!val && val != 0) return;
                    $(td).find('input').val(val.toFixed(4));
                });
            });
        }
        style();
    }

    setEventListener() {
        this.$table.find('thead i.fa-files-o').on('click', (e)=> {
            let ix = $(e.target).parent('th').prevAll().length;
            let id = this.idFromIx(ix);
            let type = k.vals;
            if(!this.data[type].hasOwnProperty(id)) type = k.calcs;
            let str = "[";
            for(let val of this.data[type][id]) {
                str += val + ","
            }
            str = str.substring(0, str.length-1);
            str += "]";
            navigator.clipboard.writeText(str);
        });
        this.$table.find('table input').off('change').each((_, el)=> {
            let $parent = $(el).parent('td');
            if($(el).hasClass('error')) {
                $(el).change(e=> {
                    let ix = $parent.prevAll().length;
                    let id = this.idFromIx(ix);
                    this.setSysErr(id, parseFloat($(e.target).val()));
                });
            } else if($parent[0]) { //tbody
                let row = parseInt($parent.siblings('td:first').text()) - 1;
                $(el).change((event)=> {
                    let ix = $parent.prevAll().length;
                    let id = this.idFromIx(ix);
                    this.setVal(id, row, parseFloat($(event.target).val()), k.vals);
                });
            } else { //thead
                $(el).change((event)=> {
                    let $input = $(event.target);
                    let [id, calc] = $input.val().split("=");
                    id = id.trim();
                    let oldID = $input.attr('class').split(" ")[0];
                    const setInput = x => {
                        let ix = $input.parent('th').prevAll().length;
                        this.$table.find('tbody tr').each((i, tr)=> {
                            $(tr).children('td').each((j, td)=> {
                                if(j != ix) return;
                                $(td).find('input').prop('disabled', !x);
                            });
                        });
                        let $sysErr = this.$table.find(`tfoot tr:first-child td:nth-child(${ix+1}) input`)
                        $sysErr.prop('disabled', !x);
                        if(!x) $sysErr.val("");
                    }
                    if(oldID) { //alt
                        if(oldID != id) { // neuID
                            $input.removeClass(oldID).addClass(id);
                            this.renameColumn(oldID, id);
                        }
                        if(calc) { //calc
                            this.toCalc(id);
                        } else {
                            this.toVal(id);
                            setInput(true);
                        }
                    } else if(calc) { //neu calc
                            this.createColumn(id, k.calcs);
                    } else { //neu val
                        this.createColumn(id, k.vals);
                    }
                    if(calc) { //disable input & neu berechnen
                        setInput(false);                        
                        this.calculate(calc, id);
                    }
                    this.updateData();
                });
            }
        });
        this.$table.find('tbody i.fa-trash-o').unbind().bind('click', e=> {
            let $tr = $(e.target).parent('td').parent('tr');
            let ix = $tr.prevAll().length;
            $tr.remove();
            this.deleteRow(ix);
            this.$table.find('tbody tr td:first-child').each((i, el)=> {
                $(el).text((i+1).toString());
            });
        });
    }

    setLayoutListener() {
        this.$table.find('thead i.fa-plus').on('click', ()=> {
            let assignedIDs = Object.keys(this.data[k.vals]).concat(Object.keys(this.data[k.calcs]));
            let id = "",
                i = 1;
            do {
                id = 'x' + i.toString();
                i++;
            } while(assignedIDs.includes(id));
            this.createColumn(id, k.vals);
            this.setEventListener();
        });
        this.$table.find('tfoot i.fa-plus').on('click', ()=> {
            this.createRow();
            this.setEventListener();
        });
        this.$table.find('p span i.fa-plus').on('click', ()=> {
            createTable();
        });
        this.$table.find('p input.tID').change((e)=> {
            this.setID($(e.target).val());
        });
        this.$table.find('span.newT i:last-child').on('click', (e)=> {
            let $el = $(e.target);
            let open = 'fa-eye',
                close = 'fa-eye-slash';
            if($el.hasClass(close)) {
                $(e.target).removeClass(close).addClass(open);
                this.$table.find('table i.fa').css({
                    visibility: 'hidden'
                });
            } else if($el.hasClass(open)) {
                $(e.target).removeClass(open).addClass(close);
                this.$table.find('table i.fa').css({
                    visibility: 'visible'
                });
            }
        });
        this.$table.find('span.newT i.fa-trash-o').on('click', ()=> {
            deleteTable(this.id);
        });
        this.$table.find('div#lin-reg').toggle();
        this.$table.find('span.newT i.fa-line-chart').on('click', ()=> {
            this.$table.find('div#lin-reg').toggle();
        });
        this.$table.find('div#lin-reg button').on('click', ()=> {
            this.$table.find('div#lin-reg ul').show();
            let y = this.$table.find('div#lin-reg input.yval').val();
            let x = this.$table.find('div#lin-reg input.xval').val();
            this.x = x;
            this.y = y;
            for(let i=0; i<4; i++) {
                this.$table.find('thead i.fa-plus').click();
                let oldID = this.$table.find('thead tr th:last-child').prev().find('input').attr('class');
                let calc;
                switch(i) {
                    case 0:
                        calc = `L1=${y}*${x}`;
                        break;
                    case 1:
                        calc = `L2=${x}**2`;
                        break;
                    case 2:
                        calc = `d2=(${y}-(${this.b})*${x}-(${this.a}))**2`;
                        break;
                    case 3:
                        calc = `L3=(${x}-(${this.data[k.mean][x].toFixed(4)}))**2`
                        break;
                    default:
                        break;
                }
                $('input.' + oldID).val(calc).trigger('change');
            }
        });
    }

    translateCalc(calc, i) {
        const tmp = this.data[k.vals];
        for(let key in this.data[k.calcs]) {
            tmp[key] = this.data[k.calcs][key];
        }
        let val = undefined;
        let expressions = [];
        let calcLoc = calc;
        for(let keyT in tables) {
            for(let t of [k.vals, k.calcs]) {
                for(let keyData in tables[keyT].data[t]) {
                    let search = `${keyT}.${keyData}`,
                        sub = `tables['${keyT}'].data[${t}]['${keyData}'][parseInt(i)]`;
                    if(calcLoc.includes(search)) expressions.push(sub);
                    calcLoc = calcLoc.split(search).join(sub);
                }
            }
        }
        for(let key in tmp) {
            let ixs = [];
            let i = 0;
            while(calcLoc.indexOf(key, i) >= 0) {
                let ix = calcLoc.indexOf(key, i);
                if(calcLoc[ix-1] != "'" || !calcLoc[ix-1]) ixs.push(ix);
                i = ix + 1;
            }
            for(ix of ixs.reverse()) {
                let sub = `tmp['${key}'][parseInt(i)]`;
                calcLoc = calcLoc.slice(0, ix) + sub + calcLoc.slice(ix + key.length);
                expressions.push(sub);
            }
        }
        try {
            let defined = true;
            for(let exp of expressions) {
                let res = eval(exp);
                if(!res && res != 0) {
                    defined = false;
                    break;
                }
            }
            if(defined) val = eval(calcLoc);
        } catch(error) {
            console.error(error);
            return;
        }
        return val;
    }

    calculate(calc, id) {
        for(let i in this.data[k.calcs][id]){
            let val = this.translateCalc(calc, i);
            this.setVal(id, i, val, k.calcs);
        }
    }

    toCalc(id) {
        if(this.data[k.calcs].hasOwnProperty(id) || !this.data[k.vals].hasOwnProperty(id)) return;
        this.data[k.calcs][id] = this.data[k.vals][id];
        delete this.data[k.vals][id];
        this.data[k.sdev][id] = null;
        this.data[k.sdevM][id] = null;
    }

    toVal(id) {
        if(this.data[k.vals].hasOwnProperty(id) || !this.data[k.calcs].hasOwnProperty(id)) return;
        this.data[k.vals][id] = this.data[k.calcs][id];
        delete this.data[k.calcs][id];        
    }

    setID(id) {
        this.$table.removeClass(this.id.toString());
        tables[id] = tables[this.id];
        delete tables[this.id];
        this.id = id;
        this.$table.addClass(this.id.toString());
    }

    getID() {
        return this.id;
    }
}

let tables = {};

function createTable() {
    ix = Object.keys(tables).length
    let tID = 'T' + (ix + 1).toString();
    const tableTemplate = `
    <div class="table ${tID}">
    <p>
        <span class='newT'>
            <i class="fa fa-plus" aria-hidden="true"></i>
            <i class="fa fa-trash-o" aria-hidden="true"></i>
            <i class="fa fa-line-chart" aria-hidden="true"></i>
            <i class="fa fa-eye-slash" aria-hidden="true"></i>
        </span>
        Tabellen-ID=<input type='text' class='tID' value='${tID}' />
    </p>
    <div id="lin-reg">
        <p>
            y=<input type='text' class='yVal' value='x1' />
            x=<input type='text' class='xVal' value='x2' />
            <button>GO</button>
        </p>
        <p><ul style="display: none">
            <li>a=<span class='a'></span></li>
            <li>b=<span class='b'></span></li>
            <li>sa=<span class='sa'></span></li>
            <li>sb=<span class='sb'></span></li>
            <li>sy=<span class='sy'></span></li>
        </ul></p>
    </div>
    <table>
        <thead>
            <tr>
                <th>n</th>
                <th><i class="fa fa-plus" aria-hidden="true"></i></th>
            </tr>
        </thead>
        <tbody>
        </tbody>
        <tfoot>
            <tr>
                <td>systematischer Fehler:</td>
            </tr>
            <tr>
                <td>Summe</td>
            </tr>
            <tr>
                <td>Mittelwert</td>
            </tr>
            <tr>
                <td>Standardabweichung einzel</td>
            </tr>
            <tr>
                <td>Standardabweichung Mittel</td>
            </tr>
            <tr>
                <td>Gesamtfehler</td>
            </tr>
            <tr>
                <td><i class="fa fa-plus" aria-hidden="true"></i></td>
            </tr>
        </tfoot>
    </table>
    </div>`;    
    let n=8;
    $('div#main').append(tableTemplate);
    tables[tID] = new Table($(`.${tID}`), tID, n, 'x1', 'x2');
    console.log(tables[tID]);
    style();
}

function deleteTable(id) {
    if(Object.keys(tables).length == 1) return;
    tables[id].$table.remove();
    delete tables[id];
}

function style() {
    let selector = {
        true: 'odd',
        false: 'even'
    }
    let s = true;
    if($('tbody > tr').length % 2 == 0) {
        s = false;
    }
    $('.table tfoot tr:' + selector[s]).css({
        'background-color': 'rgba(211, 211, 211, 0.445)'
    });
    $('.table tfoot tr:' + selector[!s]).css({
        'background-color': 'transparent'
    });
}

function main() {
    createTable();
    style();
}