const archiv = {
    articlesPerPage: 10,
    page: 1,
    loadedArticles: [],
    init() {
        this.readArticles();
        this.pageHandler();
    },
    readArticles() {
        this.loadedArticles = [];
        allArticles.forEach((el, ix, arr) => {
            allArticles[ix].index = ix;
        });
        let articleNo = this.articlesPerPage * this.page;
        if(articleNo > allArticles.length) articleNo = allArticles.length;
        for(i=0; i<articleNo; i++) {
            this.loadedArticles.push(allArticles[i]);
        }
    },
    loadArticles() {
        let start = (this.page === 1) ? 1 : (this.page - 1) * this.articlesPerPage + 1;3
        let end = this.articlesPerPage * this.page;
        if(this.loadedArticles.length > 0 && this.loadedArticles.length * this.page < start) return;
        $articles = $(".articles");
        let newEnd = (allArticles.length < end) ? allArticles.length : end;
        this.loadedArticles = [];
        this.readArticles()
        $articles.html("");;
        for(i=(start-1); i<newEnd; i++) {
            let el = this.loadedArticles[i];   
            $articles.append(`
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
                        <div class="index" style="display: none;">${el.index}</div>
                    </article>
                </div>
            `);
            el.loaded = true;
        }
        $(".articles article").on("click", function () {
            window.open(window.location.href.replace("archiv", "post/" + $(this).find("div.articleID").text()), "_self");
        });
    },
    pageHandler() {
        const sortBy = () => {
            let selected;
            $(".pages .sortBy select").find("option:selected").each(function () {
                selected = $(this).text();
            });
            let direction = "column"
            if (selected === "aufsteigend") direction = direction + "-reverse";
            $(".articles").css({
                "flex-direction": direction
            });
        }
        sortBy();
        $(".pages .sortBy select").change(() => {
            sortBy();
        });
        $pageNoSelect = $(".pages .pageNo select");
        const pageNr = ()=> {
            $pageNoSelect.html("");
            if (allArticles.length < this.articlesPerPage) {
                $pageNoSelect.html("<option value='V1'>1</option>");
            } else {
                for (i = 1; i <= Math.ceil(allArticles.length / this.articlesPerPage); i++) {
                    $pageNoSelect.append(`<option value="V${i}">${i}</option>`);
                }
                $(`.pages .pageNo select option[value='V${this.page}']`).attr('selected', true);
            }
        }
        pageNr();
        let currentAPP;
        $(".pages .app select option:selected").each(function () {
            currentAPP = parseInt($(this).text());
        });
        this.articlesPerPage = currentAPP;
        const appChange = (local) => {
            if(local) {
                this.loadArticles(1, this.articlesPerPage * this.page);
                return;
            }
            let selected;
            $(".pages .app select").find("option:selected").each(function () {
                selected = $(this).text();
            });
            this.articlesPerPage = parseInt(selected);
            pageNr();
            this.loadArticles();
            currentAPP = this.articlesPerPage;
        }
        appChange(true);
        $(".pages .app select").change(() => {
            appChange();
        });
        const pageNoChange = () => {
            let selected;
            $pageNoSelect.find("option:selected").each(function () {
                selected = $(this).text();
            });
            this.page = parseInt(selected);
            this.loadArticles();
        }
        pageNoChange();
        $pageNoSelect.change(() => {
            pageNoChange()
        });
    }
}