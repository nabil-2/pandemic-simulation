class Article {
    constructor($article) {
        this.title = $article.find("p.title").html();
        this.description = $article.find("p.description").html();
        this.imgURL = $article.find("p.imgURL").html();
        this.alt = $article.find("p.alt").html();
        this.author = $article.find("p.author").html();
        this.date = $article.find("p.date").html();
        this.articleID = $article.find("p.articleID").html();
    }
    getTitle() {
        return this.title;
    }
    getDescription() {
        return this.description;
    }
    getImgURL() {
        return this.imgURL;
    }
    getAlt() {
        return this.alt;
    }
    getAuthor() {
        return this.author;
    }
    getDate() {
        return this.date;
    }
    getArticleID() {
        return this.articleID;
    }
}

const search = {
    init() {
        this.readData();
        this.sortBy();
    },
    readData() {
        let articles = [];
        $(".foundArticles > div").each((index1, thisCategoryInfos) => {
            articles.push([]);
            $(thisCategoryInfos).children("article").each((index2, thisArticleInfos)=> {
                articles[index1].push(new Article($(thisArticleInfos)));
            });
        });
        this.createArticles(articles);
        if(articles.length === 0) $(".wrapper").html("<p class='noResults'>Es tut uns Leid! Wir konnten für ihre Suche leider keine Ergebnisse finden.</p>");
    },
    createArticles(articles) {
        articles.forEach((element, ix1, el) => {
            $("div.searchResults").append("<div></div>")
            articles[ix1].forEach( el => {
                $(`div.searchResults > div:nth-child(${ix1+1})`).append(`
                    <div>
                        <article>
                            <div><img src="${el.getImgURL()}" alt="${el.getAlt()}"/></div>
                            <div>
                                <h1>${el.getTitle()}</h1>
                                <p>${el.getDescription()}</p>
                                <a>Autor: ${el.getAuthor()}</a>
                                <a>Erschienen am: ${el.getDate()}</a>
                            </div>
                            <div class="articleID" style="display: none;">${el.getArticleID()}</div>
                        </article>
                    </div>
                `);
            });
        });
        $(".searchResults article, .searchResults img, .searchResults h1, .searchResults p").on("click", function () {
            if ($(this)[0].tagName === "ARTICLE") {
                window.open(window.location.href.replace("search", "post/" + $(this).children("div.articleID").text()), "_self");
            }
        });
    },
    sortBy() {
        $(".filters > div:last-child select").each((ix, el)=> {
            const $select = $(el);
            $select.change(() => {
                let selected;
                $select.find("option:selected").each(function () {
                    selected = $(this).text();
                });
                $sortDiv = $(".searchResults")
                if(ix === 1) $sortDiv =  $sortDiv.children("div");
                if (selected === $select.find("option:last-child").text()) {
                    $sortDiv.css({
                        "flex-direction": "column-reverse"
                    });
                } else {
                    $sortDiv.css({
                        "flex-direction": "column"
                    });
                }
            });
        });
    }
};