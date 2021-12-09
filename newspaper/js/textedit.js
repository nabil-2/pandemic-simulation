const textedit = {
    imgNames: null,
    text: null,
    start: null,
    length: null,
    length: null,
    end: null,
    articleTxt: null,    
    update(e) {
        let range = $("textarea#content").getSelection();
        textedit.text = range.text;
        textedit.start = range.start;
        textedit.length = range.length;
        textedit.end = range.end;
        textedit.articleTxt = $("textarea#content").val();
        let unselected = false,
            start = $("textarea#content")[0].selectionStart,
            end = $("textarea#content")[0].selectionEnd;
        if(textedit.length == 0 && start == end) {
            let stPart = textedit.articleTxt.substring(0, start),
                ndPart = textedit.articleTxt.substring(start, $("textarea#content")[0].value.length);
            switch($(e.target).text().split(" ")[1]) {
                case "(**)": //bold
                    stPart = stPart.concat("**");
                    break;
                case "(__)": //italic
                    stPart = stPart.concat("__");
                    break;
                case "(--)": //sub
                    stPart = stPart.concat("--");
                    break;
                case "(++)": //super
                    stPart = stPart.concat("++");
                    break;
                case "(~~)": //underline
                    stPart = stPart.concat("~~");
                    break;
                default:
                    break;
            }
            $("textarea#content").val(stPart + ndPart);
            return;
        }
        let stPart = textedit.articleTxt.substring(0, range.start),
            ndPart = textedit.articleTxt.substring(textedit.start, textedit.end),
            rdPart = textedit.articleTxt.substring(textedit.end, textedit.articleTxt.length);

        switch($(e.target).text().split(" ")[1]) {
            case "(**)": //bold
                let remove;
                if(stPart.endsWith("**") && rdPart.startsWith("**")) {
                    remove = true;
                    stPart = stPart.slice(0, -2);
                    rdPart = rdPart.slice(0, -2);
                    console.log(stPart);
                    console.log(rdPart);
                }
                if(ndPart.startsWith("**") && ndPart.endsWith("**")) {
                    remove = true;
                    ndPart = ndPart.slice(2, -2);
                }
                if(!remove) {
                    stPart = stPart.concat("**");
                    ndPart = ndPart.concat("**");
                }
                break;
            case "(__)": //italic
                stPart = stPart.concat("__");
                ndPart = ndPart.concat("__");
                break;
            case "(--)": //sub
                stPart = stPart.concat("--");
                ndPart = ndPart.concat("--");
                break;
            case "(++)": //super
                stPart = stPart.concat("++");
                ndPart = ndPart.concat("++");
                break;
            case "(~~)": //underline
                stPart = stPart.concat("~~");
                ndPart = ndPart.concat("~~");
                break;
            default:
                break;
        }
        let result = stPart.concat(ndPart);
        result = result.concat(rdPart);
        $("textarea#content").val(result);
    },
    preview() {
        let data = textedit.articleTxt;
        console.log(data);
        if(!data) {
            data = "Kein Text vorhanden!";
        } else {
            while(data.includes('**') || data.includes('__') || data.includes('~~')){
                data = data.replace('**', '<b>');
                data = data.replace('**', '</b>');
                data = data.replace('__', '<i>');
                data = data.replace('__', '</i>');
                data = data.replace('~~', '<u>');
                data = data.replace('~~', '</u>');
                data = data.replace('--', '<sub>');
                data = data.replace('--', '</sub>');
                data = data.replace('++', '<sup>');
                data = data.replace('++', '</sup>');
            }
        }
        $("div.background").fadeIn(400);
        $(".preview").fadeIn(400).css({
            top: `20px`
        }).children("p").html(data);
        $(".preview #close, .preview #close *").on("click", (event)=> {
            $(".preview").hide();
            $(".background").fadeOut(200);
        });
    },
    imgNr() {
        $(".articleTxt > div:nth-child(3) a").on("click", ()=> {
            $("select.imgNr").focus();
        });
        let values = this.imgNames;
        let valuesLength,
            noArray = false;
        if(!Array.isArray(values)) {
            noArray = true;
            valuesLength = 1;
        } else {
            valuesLength = values.length;
        }
        $("select.imgNr").html("<option value='default'>Bild auswählen</option>");
        for(i=1; i<=valuesLength; i++) {
            let optionValue;
            if(noArray) {
                optionValue = "kein Bild hochgeladen";
            } else {
                optionValue = values[i-1];
            }
            $("select.imgNr").append(`<option>${optionValue}</option>`);
        }
    },
    init() {
        $(".articleTxt > div:nth-child(2) a").on("click", ()=> {
            textedit.articleTxt = $("textarea#content").val();
            this.preview();
        });
        $(".legend a").on("click", textedit.update);
        $(".loginBTN").on("click", ()=> {
            $(".login_btn").click();
        });
        this.imgNr();
        $("select.imgNr").change(() => {
            $("select.imgNr option[value='default']").attr('selected', false);
            textedit.articleTxt = $("textarea#content").val();
            let img;
            $("select.imgNr option:selected").each(function () {
                img = $(this).text();
            });
            let cursorIx = $("textarea#content").getSelection().start;
            let stPart = textedit.articleTxt.substring(0, cursorIx),
                ndPart = textedit.articleTxt.substring(cursorIx, $("textarea#content")[0].value.length);
            stPart += `^^${img}^^`;
            $("textarea#content").val(stPart + ndPart);
            $("select.imgNr option[value='default']").attr('selected', true);
        });
    }
}