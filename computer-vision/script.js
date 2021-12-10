const tiles = {
    title: ["Library Construction", "AI model", "Training approach", "Results"],
    img: ['construction.png', 'construction.png', 'construction.png', 'construction.png'],
    description: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."]
};

const init = () => {
    for(let i=0; i<tiles.title.length; i++) {
        $('#sections').append(`
            <div>
                <div>
                    <h3>${tiles.title[i]}</h3>
                    <p>${tiles.description[i]}</p>
                </div>
                <img src='./img/${tiles.img[i]}' />
            </div>
        `);
    }
}