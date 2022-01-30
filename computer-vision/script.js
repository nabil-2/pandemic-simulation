const tiles = {
    title: ["Library Construction", "AI model", "Training approach", "Results"],
    img: ['construction.png', 'model.png', 'training.png', 'result.png'],
    description: [
        "The main idea of the library is to have levels, which contain layers. These are: Convolutional-, Dense-, Pooling- and Flatten Layers. There is also a \"Multi Dense-Layer\", that is designed for higher efficiency regarding space complexity, but less performance (see <a href='./../research'>Research</a>). Each layer's input is an output of a layer from one of the previos levels. This allows a construction of parallel layers similar to inception modules and the use of residuals.",
        "The AI model consits of four main parts. The first component is the input layer, which includes the preprocessing unit to force all images to a resolution of 196x196 pixels, convert them into rgb-colorspace and normalize the values to a centered mean.<br>The next part is the main network, that consists of three blocks, each including two to three convolutional layers followed by one max-pooling layer. From the beginning of the modules to their end the layers decrease in resolution and increase in feature map size in order to perform a feature extraction by transforming the spatial expansion.<br>The Flatten and Dense Layer, which are the thrird part, are responsible for the classification of the previously obtained features.<br>The Softmax layer at the very end transforms it's input into a probability distribution and provides a probabiliry for each possible class.",
        "The above given model was trained using images from the image net dataset. Due to limited resources and restrictions in available computing power the model was trained using a Batch-Size of eight images. The last convolutional layer of each block uses Batch Normalization.<br>The Adaptive Momentum Optimizer was used to decrease convergence time.",
        "The plot shows the confidence of the model over the epochs of the last few iterations for four validation images as well as the limited computation power in training given the results. The confidence is given by the models predicted probability for an object to be the correct class. If the highest output comes from the correct class, the output is considered to be correct. The frequency of these events for a validation batch is shown by the accuracy for each epoch. Even though the confidence does not increase very much, the accuracy does, especially in the last epochs, which show a decrease in confidence in the case of higher accuracy."
    ]
};

const init = () => {
    for(let i=0; i<tiles.title.length; i++) {
        $s = $('#sections').append(`
            <div>
                <div>
                    <h3>${tiles.title[i]}</h3>
                    <p>${tiles.description[i]}</p>
                </div>
                <img src='./img/${tiles.img[i]}' />
            </div>
        `).children("div:last-child");
        let height = $s.height();
        $s.find("img").css({
            height: height * 1.5
        });
    }
    $('#sections').append(`
        <div class='demo'>
            <h3>Demonstration</h3>
            <img src='./img/demo.png' />
        </div>
    `);
    if(screen.width <= 800) {
        alert("This website is not optimized for mobile viewports, please use a desktop device.");
    }
}