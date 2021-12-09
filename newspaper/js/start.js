const start = {
    articles: {},
    init() {
        this.readArticles();
        this.createBoxes();
        this.flip();
        this.further();
        this.iframeHeight();
    },
    async getHeights(index) {
        return new Promise((resolve, reject)=> {
            const $el = $($(".iframeImages img")[index]);
            $el.attr("src", this.imageURLs[index]);
            $el.ready(() => {
                const HEIGHT = $el.height();
                if(HEIGHT === 0) {
                    this.getHeights(index)
                        .then((data)=> {
                            resolve(data);
                        })
                        .catch((error)=> {
                            console.error(error);
                        });
                } else {
                    resolve(HEIGHT);
                }
            });
            setTimeout(()=> {
                reject("connection timed out");
            }, 1000);
        });
    },
    imageURLs: [],
    iframeHeight() {
        articleData.slideshow.forEach((el, ix, arr)=> {
            this.imageURLs.push(el.imgURL);
        });
        $("div#main-content").append("<div class='iframeImages'></div>");
        const $IMAGES = $("div.iframeImages");
        this.imageURLs.forEach((el, ix, arr)=> {
            $IMAGES.append(`<img width='100%' />`);
        });
        let heights = [];
        let index = 0;
        const recursive = (ix)=> {
            this.getHeights(ix)
                .then((data)=> {
                    heights.push(data);
                    index++;
                    if(index === this.imageURLs.length) {
                        $IMAGES.remove();
                        let lowestHeight = heights.reduce((a, b) => Math.min(a, b));
                        if (lowestHeight > $("iframe").height()) return;
                        if (lowestHeight < 400) lowestHeight = 400;
                        if ($(window).width() < 600 && lowestHeight == 400) lowestHeight = 300;
                        if ($(window).width() < 460 && lowestHeight == 300) lowestHeight = 250;
                        $("iframe").css({
                            height: lowestHeight + "px"
                        });
                        return;
                    }
                    recursive(index);
                })
                .catch((error)=> {
                    console.error(error);                   
                });
        };
        recursive(index);
    },
    readArticles() {
        this.articles.tiles = articleData.tiles;
        this.articles.further = articleData.further;
    },
    createBoxes() {
        const $BOXES = $("div.boxes");
        $BOXES.html("");
        const WIDTH = $(window).width();
        let column;
        if(WIDTH < 500) {
            column = 1;
        } else if(WIDTH >= 500 && WIDTH < 750) {
            column = 1
        } else if(WIDTH >= 750 && WIDTH < 1250) {
            column = 2;
        } else if(WIDTH >= 1250 && WIDTH < 1500) {
            column = 3;
        } else {
            column = 4;
        }
        let currentRow = 1;
        this.articles.tiles.forEach((article, ix, arr)=> {
            if(ix === 0) {
                $BOXES.append(`<div class="row row${currentRow}">`);
            }
            $BOXES.children(".row" + currentRow).append(`                
                <div class="card no${ix+1}"> 
                    <div class="front">
                        <h1>${article.title}</h1>
                        <img src="${article.imgURL}" alt="${article.alt}"/>
                    </div>
                    <div class="back">
                        <p>${article.description}<br><br><a style="font-size: .7em">${article.date}</a></p>    
                        <img src="${article.imgURL}" />
                    </div>
                    <a class="articleID" style="display: none">${article.articleID}</a> 
                </div>
            `);
            if(ix+1 === arr.length) {
                $BOXES.append("</div>")
            } else if((ix + 1) % column === 0) {
                currentRow++;
                $BOXES.append(`</div><div class="row row${currentRow}">`);
            }
        });
        $(".card").css({
            width: Math.round(90/column) + "%"
        });
        if((this.articles.tiles.length % column) > 2) {
            $(`.row${currentRow} .card`).css({
                width: Math.round(90/(this.articles.tiles.length % column)) + "%"
            });
        }
    },
    flip() {
        $(".card").each(function(ix, el) {
            $(this).flip();
            $(this).hover(
                ()=> {
                    $(this).flip(true);
                },
                ()=> {
                    $(this).flip(false);
                }
            );
        });
        $(".front, .back").on("click", function() {
            const ID = $(this).siblings("a.articleID").text();
            window.open(window.location.href.replace("index", "post/" + ID), "_self");
        });
    },
    further() {
        $further = $(".further");
        this.articles.further.forEach((el ,ix ,arr)=> {
            $further.append(`
                <div>
                    <article>
                        <div><img src="${el.imgURL}" alt="${el.alt}"/></div>
                        <div>
                            <h1>${el.title}</h1>
                            <p>${el.description}</p>
                            <a>Autor: ${el.author}</a>
                            <a>Veröffentlicht am: ${el.date}</a>
                        </div>
                        <div class="articleID" style="display: none;">${el.articleID}</div>
                    </article>
                </div>
            `);
        });
        $(".further article").on("click", function () {
            window.open(window.location.href.replace("index", "post/" + $(this).children("div.articleID").text()), "_self");
        });
    }
};