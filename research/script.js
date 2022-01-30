const tiles = {
    title: ["Fundamental Change: Multidemensional Dense Layer"],
    img: ['neuron_distribution.png'],
    description: [
        "The Multidimensional Dense Layer work similar to normal Dense Layers: there are neurons which are connected by weights. The difference to the commonly used layers is the way of obtaining the weights.<br>Usually they are just stored in data structures, whereas the Multidense Layers calculate them during runtime and thus reducing the required storage space enormously. This removes the necessity for concepts like Bottleneck Layers and storage-related restrictions when designing the model. This decrease in parameters is possible because the weights are calculated by feeding the distance between the i-th and j-th neuron in n-dimesnional space into a weight function, that returns the weight and is treated as the equivalent to normal weights.<br>Therefore each neuron is characterized by n components of their coordinate in space. This reduces the number of parameters for 2 Layers of size I and J from I*J to n*(I+J). The number of dimensions n is an adjustable hyperparameter.<br>It has to be mentioned, that this approach leads to a slightly worse converion rate and does take a lot of computing power, espacially for the calculation of the Euclidean distance for each neuron. Therefore this methode does not fit all problems.",
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
            height: height * 1.7
        });
    }
    $('#sections').append(`
            <div class='demo'>
                <h3>Performance</h3>
                <p>The left plot shows the training performance of a neural network with common Dense Layers learning to classify handwritten digits using the MNIST-Dataset with a Batch-Size of 256. Compared to the right graph of a Multidense-Layer network, that learns to solve the same problem, it outperforms the other network regarding convergence and error rate. But considering, that the Multidense Network uses less than 5% of the number of parameters the normal network uses, it is still a solid performance. The noise in the right graph is only due to a sprained axis and a smaller batch size of only 64 images.</p>
                <img src='./img/comparison.png' />
            </div>
        `)
}