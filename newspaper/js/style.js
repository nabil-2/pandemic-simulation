const style = {
    globalStyle() {
        let clear = false;
        $("ul#menu").hide();
        $("div#icon2").on("click", (e)=> {
            if($("ul#menu").css("display") == "none") {
                $("ul#menu").slideDown("fast");
            } else {
                $("ul#menu").slideUp("fast");
            }
        });
        let expected = a.gN().toLowerCase();
        let equal = (expected === ne);
        let counter = 0;
        let DOMsBack = [
            "nav ul#main-menu",
            ".footer-distributed",
            "header",
            "button:not(.btn)",
            "input[type='submit']",
            "ul#menu li a"
        ];      
        if(!equal) clear = true;
        var back;
        DOMsBack.forEach((element, index)=> {
            if(element) back += element + ","; 
        });
        if (!$("footer .footer-company-about").text().toLowerCase().includes(expected.toLowerCase())) clear = true;
        back = back.slice(0, -1);
        if ($("footer .footer-company-about").css("display") === "none") clear = true;
        for(i=0; i<9; i++) {
            back = back.substr(1);
        }
        if (parseInt($("footer .footer-company-about").css("opacity"))<1) clear = true;
        let intervalDuration = 5000;
        if ($("footer .footer-company-about").css("visibility") === "hidden")
        setInterval(()=> {
            let colors = ["rgb(31,102,229)", "rgb(100,149,237)"];
            $(back).animate({
                backgroundColor: colors[counter]
            }, intervalDuration);
            if(counter === colors.length -  1) {
                counter = 0
            } else {
                counter++;
            }
        }, intervalDuration);
        if (clear) $("html").html("");
    },
    menu() {
        $("div#icon2").on("click", (event)=> {
            let line2 = $(".line2");
            if(line2.css("opacity") == 0) {
                line2.animate({
                    opacity: "1"
                }, 200);
            } else {
                line2.animate({
                    opacity: "0"
                }, 200);
            }
            $(".line1").toggleClass("showMenu1");
            $(".line3").toggleClass("showMenu2");
        });
        $("#main-menu > img").on("click", ()=> {
            window.location.href = "index";
        });
    },
    init() {
        this.globalStyle();
        this.menu();
    }
};