const user = {
    articles: [],
    init() {
        this.readArticles();
        this.buildArticles();
        this.sortBy();
    },
    readArticles() {
        $(".articleInfo > article").each((index, thisArticleInfos)=> {
            let article = {};
            thisArticleInfos = $(thisArticleInfos);
            article.title = thisArticleInfos.find("p.title").html();
            article.description = thisArticleInfos.find("p.description").html();
            article.imgURL = thisArticleInfos.find("p.imgURL").html();
            article.alt = thisArticleInfos.find("p.alt").html();
            article.date = thisArticleInfos.find("p.date").html();
            article.articleID = thisArticleInfos.find("p.articleID").html();    
            this.articles.push(article);
        });
    },
    buildArticles() {
        this.articles.forEach((el ,ix ,arr)=> {
            $("div.articles").append(`
                <div>
                    <article>
                        <div><img src="${el.imgURL}" alt="${el.alt}"/></div>
                        <div>
                            <h1>${el.title}</h1>
                            <p>${el.description}</p>
                            <a>Veröffentlicht am: ${el.date}</a>
                            <a>Artikel löschen</a>
                        </div>
                        <div class="articleID" style="display: none;">${el.articleID}</div>
                    </article>
                </div>
            `);
        });
        $(".articles article").on("click", function () {         
            window.open(window.location.href.replace("user", "post/" + $(this).children("div.articleID").text()), "_self");
        });
    },
    sortBy() {
        const sort = () => {
            let selected;
            $(".sortBy select").find("option:selected").each(function () {
                selected = $(this).text();
            });
            let direction = "column"
            if (selected === "aufsteigend") direction = direction + "-reverse";
            $(".articles").css({
                "flex-direction": direction
            });
        }
        sort();
        $(".sortBy select").change(() => {
            sort();
        });
    }
};