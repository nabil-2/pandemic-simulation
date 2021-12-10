const getProjects = ()=> {
    return `[
        {
            "name": "Computer Vision Library<br>& Image Recognition",
            "img": "computer_vision.png",
            "url": "computer-vision",
            "description": "A library for training and testing a user-definded Convolutional Neuronal Network model, capable of all common techniques for supervised image classification and image preprocessing."
        },
        {
            "name": "AI for Anomaly Detection",
            "img": "ai_anomaly_detection.png",
            "url": "anomaly-detection",
            "description": "An AI for anomaly detection in particle physics to recognize possible beyond Standard Model events when colliding hadrons (currently working on)."
        },
        {
            "name": "Research",
            "img": "research.png",
            "url": "research",
            "description": "Developing a new type of a storage space efficient neural network by decreasing unnecessary performance by calculating weights at runtime using a “weight function” instead of saving them. Achieving about 90% less storage and 10% higher error (depending on model)."
        },
        {
            "name": "Simulation of a Pandemic",
            "img": "simulation.png",
            "url": "simulation",
            "description": "A complex reconstruction of a pandemic as Web-App using real-world actions measured by comparing plots to mathematical models."
        },
        {
            "name": "Android App",
            "img": "android.jpg",
            "url": "android-app",
            "description": "A calculator for various linear- and vector algebra operations, e.g. calculating a linear combination in n-dimensional space, vector operations, calculating the determinant, etc."
        },
        {
            "name": "Web Development",
            "img": "web_dev.png",
            "url": "http://salama-art.de/en",
            "description": "Developing a <a href='http://salama-art.de/en'>personal website</a> (see footer) or a website for a <a href='./newspaper'>school newspaper</a>."
        }
    ]`;
    return new Promise((resolve, reject)=> {
        var request = new XMLHttpRequest();
        request.open("GET","http://nabils.bplaced.net/projects.json");
        request.addEventListener('load', e=> {
           if (request.status >= 200 && request.status < 300) {
              resolve(request.responseText);
           } else {
              reject(request.statusText, request.responseText);
           }
        });
        request.send();
    });    
};

const init = async ()=> {
    const projects = JSON.parse(await getProjects());
    for(const project of projects) {
        $('body #tiles').append(`<div class="project">
            <h3>${project.name}</h3>
            <p>${project.description}</p>
        </div>`);        
        let height = $('div.project:last-child p').height();
        $('#tiles div.project:last-child').css({
            'background-image': `url('./img/${project.img}')`
        }).on('click', x=> {
            $('body').append(`<a id="redirect" href="${project.url}" />`);
            $('#redirect').get(0).click();
        }).children('p').css({
            height: 0,
            "font-size": 0,
            opacity: 0,
            display: 'none'
        }).parent('div.project').hover(function() {
            $(this).children('p').css({
                display: 'block',
                "font-size": "1.35em"
            }).animate({
                height: height
            }, {
                duration: 400,
                easing: 'swing',
                complete: function() {
                    $(this).animate({
                        opacity: 1
                    }, 300);
                }
            });
        }, function() {
            $(this).children('p').animate({
                opacity: 0
            }, {
                duration: 300,
                complete: function() {
                    $(this).animate({
                        height: 0
                    }, {
                        duration: 400,
                        complete: function() {
                            $(this).css({
                                display: 'none',
                                "font-size": 0
                            });
                        }
                    });
                }
            });
        });
    }
};