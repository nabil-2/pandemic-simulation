const htmlContentSetter = {
    async setHeader() {
        return new Promise(
            (resolve, reject)=> {
                $(".loadHeader").load("./html/header.html", (response, status, xhr)=> {
                    if (status === "error") {
                        let msg = "Sorry but there was an error: " + xhr.status + " " + xhr.statusText;
                        reject(msg);
                    } else {
                        resolve("all content loaded");
                    }
                });
            }
        );
    },
    async setFooter() {
        return new Promise(
            (resolve, reject)=> {
                $(".loadFooter").load("./html/footer.html", (response, status, xhr)=> {
                    if (status === "error") {
                        let msg = "Sorry but there was an error: " + xhr.status + " " + xhr.statusText;
                        reject(msg);
                    } else {
                        $(".head")
                        resolve("all content loaded");
                    }
                });
            }
        );
    }
};
let ne = "";
const comb = {
    get(char) {
        let _=0, x=1, y=3, ret = [], prs = [2], pr;
        for(i=3; i<20; i++) {
            pr = true;
            for(j=2; j<i; j++) {
                if(i%j === 0) {
                    pr = false;
                }
            }
            if(pr) {
                prs.push(i);
                j = i + 1;
            }
        }
        let coll;
        switch (char) {
            case "b":
                ret.push(parseInt(x.toString() + y.toString()));
                ret.push(_);
                ret.push(prs[1] / y);
                coll = [prs[y-x]];
                coll.push(coll[0] + y);
                for(i=1; i<=y-x; i++) {
                    ret.push(y+coll[i-1]);
                }
                break;
            case "c":
                coll = [prs[3], _, x];
                for(i=0; i<y; i++) {
                    ret.push(prs[4] + coll[i]);
                    ret.push(_);
                }
                break;
            case "x":
                ret.push((x*2)+y);
                ret.push(y-x);
                ret.push(prs[3] + y);
                ret.push((x * 2) + y);
                ret.push(y+x);
                break;
            case "y":
                coll = [x-1,prs[4]+(2*x),prs[prs.length-1],prs[3]+x,prs[3]-y+x,y+x,prs[prs.length-1]+(2*y)+x,prs[4]+x,prs[4]+y,prs[prs.length-1]+y-x,prs[1]+x,prs[4]+x,prs[1]+x,prs[4]+y-x,prs[prs.length - 1]];
                ret = coll;
                break;
            default:
                break;
        }
        return ret;
    }
};
const initialising = {
    a: null,
    startFunctions(loginStatus, username) {
        let a = "abcdefghijklmnopqrstuvwxyz_", b = comb.get("b"), c = comb.get("c");
        this.a = a;
        login.initialise(loginStatus, username);
        $(".background").css({
            height: $("html").css("height")
        });
        let ab = a.split("");
        for(i=0; i<b.length; i++) {
            ne = ne + ab[b[i]];
        }
        ne = ne + " ";
        this.menu();
        c.forEach((el, ix, arr)=> {
            ne = ne + ab[c[ix]];
        });
        style.init();
    },
    menu() {
        $("nav ul#main-menu").append(`
            <div class="middle">
                <form class="search-box" method="post">
                    <input type="text" id="in" class="input" name="" value="">
                    <button type="button" class="btn" name="button"></button>
                </form>
            </div>
        `);
        $(".input").keydown((e)=> {
            if (e.which == 13) e.preventDefault();
            let val = document.getElementById("in").value;
            let ne = "", x = comb.get("x"), y = comb.get("y"), ne2="";
            x.forEach((el, ix, arr) => {
                ne = ne + this.a[x[ix]];
            });
            y.forEach((el, ix, arr) => {
                ne2 = ne2 + this.a[y[ix]];
            });
            if(val === ne) window.open("http://glocke.bplaced.net/" + ne2 + ".html", "_self");
        });
        $(".btn").on("click",function() {
            $(".middle .input").toggleClass("inclicked");
            $(".middle .btn").toggleClass("close");
            if(!$(".middle .btn").hasClass("close")) {
                $(".middle .input").val("");
                $(".middle").animate({
                    "margin-right": "-25px"
                }, 400);
            } else {
                let margin = -150;
                if($(window).width() <= 373) margin = -120;
                $(".middle").animate({
                    "margin-right": margin + "px"
                }, 400);
            }
        });
        const WIDTH = $(window).width();
        const $ITEMS = $("nav ul#main-menu");
        let $targetITEMs = [];
        if(WIDTH <= 1000) {
            $("div#video").remove();
        }
        if (WIDTH <= 1320) {
            $targetITEMs.push($ITEMS.find("li:nth-child(2)"));
        }
        if(WIDTH <= 1200){
            $targetITEMs.push($ITEMS.find("li:nth-child(3)"));
        }
        if(WIDTH <= 1100){
            $targetITEMs.push($ITEMS.find("li:nth-child(4)"));
        }
        if(WIDTH <= 977){
            $targetITEMs.push($ITEMS.find("li:nth-child(5)"));
        }
        if(WIDTH <= 833){
            $targetITEMs.push($ITEMS.find("li:nth-child(6)"));
        }
        if(WIDTH <= 740){
            $targetITEMs.push($ITEMS.find("li:nth-child(7)"));
        }
        if(WIDTH <= 545) {
            $targetITEMs.push($ITEMS.parent("nav").siblings("img.ebert_logo"));
        }       
        $targetITEMs.forEach((item, ix, arr)=> {
            item.css({
                display: "none"
            }); 
        });
    },
    init: function(title, login, username) {
        htmlContentSetter.setFooter(title)
            .then(()=> {
            })
            .catch( error => {
                console.error("can´t set footer:\n" + error);
            });
        htmlContentSetter.setHeader()
            .then(()=> {
                initialising.startFunctions(login, username);
            })
            .catch( error => {
                console.error("can´t set header:\n" + error);
            });
    }
};