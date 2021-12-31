const tiles = {
    title: ["Library Construction", "AI model", "Training approach", "Results"],
    img: ['construction.png', 'construction.png', 'construction.png', 'construction.png'],
    description: [
        "The main idea of the library is to have levels, which contain layers. These are: Convolutional-, Dense-, Pooling- and Flatten Layers. There is also a \"Multi Dense-Layer\", that is designed for higher efficiency regarding space complexity, but less performance (see <a href='./../research'>Research</a>). Each layer's input is an output of a layer from one of the previos levels. This allows a construction of parallel layers like in the inception modules and the use of residuals.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
    ]
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