const slideshow = {
    DOMarticles: null,
    slider: null,
    articles: [],
    articleCounter: 0,
    articleIndex: null,
    shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
        while (0 !== currentIndex) {
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
        }          
        return array;
    },
    nextArticle(counter, index, clear) {
        counter++;
        index++;
        let last = false;
        const thisArticle = $(`#slideShow > :nth-child(${counter})`);
        let _nextArticle;
        if(counter === index) {
            _nextArticle = $("#slideShow > .articles:first-child");
            last = true;
        } else {
            _nextArticle = thisArticle.next();
        }
        this.slide(thisArticle, _nextArticle, last);            
        if(counter === index) counter = 0;            
        $(`.counter > div:nth-child(${counter + 1})`).get(0).id = "active";
    },
    startSlider() {
        let slideShow = setInterval(()=> {
            this.nextArticle(this.articleCounter, this.articleIndex, slideShow);
            this.articleCounter++;
            if(this.articleCounter === this.articleIndex + 1) this.articleCounter = 0;
        }, 5000);
        return slideShow;
    },
    slide(stArt, ndArt, last) {
        $(".counter > div").each((ix, el)=> {
            $(el).get(0).id="";
        });
        $(".articles")
                .css({
                    top: "-" + ndArt.height()
                });
        if(last) {
            this.DOMarticles
                .css({
                    left: 0,
                    top: "-" + ndArt.height()
                });
        } else {
            this.DOMarticles
                .css({
                    left: 0,
                    top: "0"
                });
        }
        this.DOMarticles.hide();
        stArt
            .show()
            .animate({
                left: "-100%"
            },
            {
                duration: 1000,
                complete: ()=> {
                    stArt.hide();
                }
            })
        ndArt
            .show()
            .css({
                left: "100%",
                top:  "-" + ndArt.height()
            })
            .animate({
                "left": "-=100%"
            },
            {
                duration: 1000,
                complete: ()=> {
                    ndArt.css({
                        top: "0"
                    });
                }
            });
        if(last) {
            ndArt
                .css({
                    left: "100%",
                    top: "0"
                });
        }
        $(".counter").css({
            left: "auto",
            top: "1em;"
        });/* verify */
        
    },
    skipArticles(artNumber, article, direction) {//artNumber => Articles to skip; direction: true: left; false: right;
        let thisArtIx; //1-based
        $(".articles").each((ix/*0-based*/, el)=> { 
            if(article.get(0) === $(`.articles:nth-child(${ix + 1})`).get(0)) {
                thisArtIx = ix + 1;
            }
        });
        console.log(thisArtIx);
        let nextArtIx = thisArtIx + artNumber;
        if(direction && thisArtIx === 1) { //from 1st do last Article
            nextArtIx = this.articles.length;
        } else if(!direction && thisArtIx === this.articles.length) { //from last to 1st Article
            nextArtIx = 1;
        }
        let nextArticleDOM = $(`.articles:nth-child(${nextArtIx})`);
        console.log(nextArtIx);
        console.log(nextArticleDOM.get(0));
        this.slide(article, nextArticleDOM);
        //restart slideshow:
        this.slider = this.startSlider();
        //nextArticle = article.siblings();
    },
    arrow: function() {
        $("#arrows div, #arrows img").on("click", (event)=> {
            clearInterval(this.slider);
            let arrow; //left: true, right: false
            if(event.target.tagName.toLowerCase() === "div") {
                if(!$(event.target).next().get(0)) {
                    arrow = false;
                } else {
                    arrow = true;
                }
            } else if(event.target.tagName.toLowerCase() === "img") {
                if(!$(event.target).parent().next().get(0)) {
                    arrow = false;
                } else {
                    arrow = true;
                }
            }
            let thisArt;
            $("#slideShow > .articles").each((ix, el)=> {
                if($(el).css("display") !== "none") {
                    thisArt = $(el);
                }
            });
            this.skipArticles(1, thisArt, arrow);
            if(arrow) { //left button
                console.log("left");                
            } else { //arrow = false => right button
                console.log("right");
            }
        });
    },
    initialise() {
        articleData.slideshow.forEach((el, ix, arr)=> {
            let url = el.imgURL;
            el.imgURL = "." + url;
            this.articles.push(el); 
        });
        const articles = this.shuffle(this.articles);
        articles.forEach((article, index, all)=> {
            let articleTemplate = `<div class="articles">
                <div>
                    <p id="articleTitle">${article.title}</p>
                    <p id="articleDescription">${article.description}</p>                    
                </div>
                <img src="${article.imgURL}">
                <p class="articleID" style="display: none;">${article.articleID}</p>
            </div>`;
            $("#slideShow").prepend(articleTemplate);
            $("#slideShow > .articles:first-child").hide();         
        });
        this.DOMarticles = $("#slideShow > .articles");
        this.articleIndex = articles.length - 1;
        let counters = "";
        for(i=0; i<=this.articleIndex; i++) {
            counters += "<div />";
        }
        $("#slideShow > .articles:first-child")
            .show()
            .parent("#slideShow") 
            .children(".counter")
            .html(counters)
            .children(":first-child")
            .get(0).id = "active";
        this.mobileVersion();
        this.slider = this.startSlider();
        this.arrow();
        this.eventListner();
    },
    eventListner() {
        $("div.articles").on("click", function () {
            window.parent.receiveIframURL($(this).children("p.articleID").text());
        });
    },
    async getHeights(index) {
        return new Promise((resolve, reject) => {
            const $el = $($(".articles img")[index]);
            $el.attr("src", this.imageURLs[index]);
            $el.ready(() => {
                const HEIGHT = $el.height();
                if (HEIGHT === 0) {
                    this.getHeights(index)
                        .then((data) => {
                            resolve(data);
                        })
                        .catch((error) => {
                            reject(error);
                        });
                } else {
                    resolve(HEIGHT);
                }
            });
            setTimeout(() => {
                reject("connection timed out");
            }, 10000);
        });
    },
    imageURLs: [],
    iframeHeight() {
        articleData.slideshow.forEach((el, ix, arr) => {
            this.imageURLs.push(el.imgURL);
        });
        const $IMAGES = $(".articles img");
        let heights = [];
        let index = 0;
        const recursive = (ix) => {
            this.getHeights(ix)
                .then((data) => {
                    heights.push(data);
                    index++;
                    if (index === this.imageURLs.length) {
                        let lowestHeight = heights.reduce((a, b) => Math.min(a, b));
                        return;
                    }
                    recursive(index);
                })
                .catch((error) => {
                    console.error(error);
                });
        };
        recursive(index);
    },
    mobileVersion() {
        let index,
            counter = 0;
        $("p#articleDescription").each((ix, el)=> {
            index = ix;
        });
        const getOffsets = ()=> {
            if(index + 1 === counter) return;
            let paragraph = $("p#articleDescription")[counter];
            const $offset = $(paragraph).offset();
            if (($(".articles").height() - $offset.top - $(paragraph).height()) < 50) {
                $(paragraph).css({
                    display: "none"
                });
            }
            counter++;
            setTimeout(() => {
                getOffsets();
            }, 6200);
        };
        setTimeout(()=> {
            getOffsets();
        }, 150);
    }
};