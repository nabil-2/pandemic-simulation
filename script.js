const web = {
    init() {
        web.api = new apiC;
        web.handleApp();
        web.redraw();
        $(".ctrl i:first-child").on("click", ()=> {
            alert("Die Berechnungen können abhängig von Rechenleistung und Bevölkerungszahl einen Moment dauern.");
            $(".loading").css({display: "block"});
            web.asnycCall(web.start, web.redraw).then(()=> {
                $(".loading").css({display: "none"});
            });
        });
    },
    async asnycCall(fct, arg) {
        await fct(arg);
    },
    start(callback) {
        return new Promise((resolve, reject)=> {
            callback();
            resolve();
        });
    },
    api: null,
    handleSettings() {  
        web.readMeasures();
        web.api.population = $("#populationVal").val();
        web.api.startInfections = $("#startIval").val();
        let i=0;
        for(it in web.api.probabilities) {
            let $inputs = $(".probabilities input");
            web.api.probabilities[it].m = $($inputs.get(i)).val();
            i++;
        }
        i=0;
        for(it in web.api.values) {
            let $inputs = $("#avgInt input");
            web.api.values[it] = $($inputs.get(i)).val();
            i++;
        }
    },
    measures: [],
    readMeasures() {
        web.measures = [];
        $(".measures table tr:not(:first-child)").each((ix, el)=>{
            let day = $(el).children("td:nth-child(1)").children("input#measureDay").val();
            let measure/*  = $(el).children("td:nth-child(2)").children("select#measurement").find(":selected").val() */,
                measureGer = $(el).children("td:nth-child(2)").children("#measurement").find(":selected").text();
            let status = $(el).children("td:nth-child(3)").children("input#measureStatus").is(":checked");
            switch(measureGer) {
                case "Lockdown":
                    measure = "lockdown";
                    break;
                case "Maskenpflicht":
                    measure = "facemask";
                    break;
                case "Abstandsregelung":
                    measure = "socialDistance";
                    break;
                case "Reiseverbot":
                    measure = "travelingProhibition";
                    break;
            }
            //let s = status=="on";
            web.measures.push([measureGer, parseInt(day), measure, status]);
        });
    },
    setDefaults() {
        let tmp = [];
        for(let i=0; i<web.measures.length; i++) {
            tmp.push([]);
            for(let j=0; j<web.measures[i].length; j++) {
                tmp[i].push(web.measures[i][j]);
            }
        }
        tmp.forEach((el, ix, arr)=> {
            tmp[ix].splice(0, 1);
        });
        web.api.measuresPlan = tmp;
        web.api.init();
        $(".overallI").text(web.api.overallInfections);
        $(".infectionRoot table tr").each(function(ix, el) {
            $(this).children("td:last-child").html(web.api.infectionRoot[ix]);
        });
        let template = `<tr>
            <th>Tag</th>
            <th>S</th>
            <th>I</th>
            <th>R</th>
            <th>Q</th>
            <th>C</th>
        </tr>`;
        web.api.stats.forEach((el, ix, arr)=> {
            template += "<tr>";
            for(let val in el) {
                template += `<td>${el[val]}</td>`;
            }
            template += "</tr>"
            $(".furtherStats tbody").html(template);
        });
    },
    handleApp() {
        $(".ctrl i:last-child").on("click", ()=> {
            location.reload();
        });
        $("input#population").on('change mousemove', function() {
            $("input#populationVal").val($(this).val());
        });
        $("input#populationVal").on('change', function() {
            $("input#population").val($(this).val());
        });
        $("input#startI").on('change mousemove', function() {
            $("input#startIval").val($(this).val());
        });
        $("input#startIval").on('change', function() {
            $("input#startI").val($(this).val());
        });
        $("#addMeasure").on("click", ()=> {
            $(".measures table tbody").append(`
            <tr>
                <td><input type="number" id="measureDay" min="1" value="1" /></td>
                <td><select id="measurement">
                    <option>Lockdown</option>
                    <option>Maskenpflicht</option>
                    <option>Abstandsregelung</option>
                    <option>Reiseverbot</option>
                </select></td>
                <td><input type="checkbox" id="measureStatus" checked="checked"/></td>
                <td><img src="delete.jpg" /></td>
            </tr>                
            `);
            $($("div.measures tr").get(1)).css({
                "background-color": "white"
            });
            $(".measures img").on("click", function() {
                $(this).parent().parent().remove();
            });
        });
        $(".measures img").on("click", function() {
            $(this).parent().parent().remove();
            $("div.measures tr:nth-child(even)").css({
                "background-color": "#dddddd"
            });
        });
        $("#populationVal").val(web.api.population);
        $("#population").val(web.api.population);
        $("#startIval").val(web.api.startInfections);
        $("#startI").val(web.api.startInfections);
        let i=0;
        for(it in web.api.probabilities) {
            let el = web.api.probabilities[it];
            let $inputs = $(".probabilities input");
            $($inputs.get(i)).val(el.m);
            i++;
        }
        i=0;
        for(it in web.api.values) {
            let $inputs = $("#avgInt input");
            $($inputs.get(i)).val(web.api.values[it]);
            i++;
        }
    },
    redraw() {
        web.api = new apiC();
        web.handleSettings();
        web.setDefaults();
        google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(drawChart);
        function drawChart() {
            let data = new google.visualization.DataTable();
            data.addColumn('string', 'x');
            data.addColumn({type: 'string', role: 'annotation'});
            data.addColumn({type: 'string', role: 'annotationText'});
            data.addColumn('number', 'Infektionen');
            //data.addColumn('number', 'Genesungen/Tode');
            data.addColumn('number', 'Quarantänisierte');
            //data.addRow(["G", 'Foo', 'Foo annotation', 8, 1, 0.5]);
            web.api.stats.forEach((el, ix, arr)=> {
                let line1 = null, line2 = null;
                let events = "";
                web.measures.forEach((el2, ix, arr)=> {
                    if(el.day == el2[1]) {
                        events += el2[0];
                        line1 = el2[0];
                        if(!el2[3]) {
                            events += " aufgehoben";
                            line1 += " aufgehoben";
                        }
                        events += ", ";
                        line2 = "Tag " + el.day + ": " + events;
                    }
                });
                if(line2) line2 = line2.substring(0, line2.length-2);
                data.addRow([el.day.toString(), line1, line2, el.infections/*, el.recovered*/, el.quarantine]);
            });
            var options = {
                title: 'Pandemie-Entwicklung',
                hAxis: {title: 'Tag',  titleTextStyle: {color: '#333'}},
                vAxis: {minValue: 0},
                annotations: {
                    style: 'line'
                }
            };
            var chart = new google.visualization.AreaChart(document.getElementById('chart_div'));
            chart.draw(data, options);
        }
    }
}