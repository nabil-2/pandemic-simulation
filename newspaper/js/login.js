const login = {
    display() {
        const defaultDuration = 300;
        $(".login_btn").on("click", event => {
            $(".login_form").fadeIn(defaultDuration);
            $(".background").fadeIn(defaultDuration);
        });
        $(".login_form #close, .login_form #close *").on("click", (event)=> {
            $(".login_form").hide();
            $(".background").fadeOut(defaultDuration);
        });
        $(".reg").hide();
        $(".log > .register_btn").on("click", ()=> {
            $(".log").hide();
            $(".reg").show();
        });
    },
    initialise(loginStatus, username) {
        $(".login_form").hide();
        if(loginStatus) {
            $("ul#main-menu").append(`
                <li><a href="#" class="login_btn">Login</a></li>
            `);
            $("ul#menu").append(`
                <li><a href="#" class="login_btn">Login</a></li>
            `);
        } else {
            $("ul#main-menu").append(`
                <li><a href="#">${username}</a></li>
                <li><a href="./newBlog.html">neuer Artikel</a></li>
            `);
            $("ul#menu").append(`
                <li><a href="#">${username}</a></li>
                <li><a href="./newBlog.html">neuer Artikel</a></li>
            `);
        }
        this.display();
    }
};
