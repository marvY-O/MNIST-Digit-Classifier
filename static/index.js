const labels = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
];

var data = {
    labels: labels,
    datasets: [{
        label: 'Score',
        backgroundColor: '#35A7FF',
        //borderColor: 'rgba(244, 96, 54, 1)',
        data: [0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1],
        borderWidth: 3,
    }]
};

const config = {
    type: 'bar',

    data: data,

    options: {
        plugins: {
            legend: {
                display: false // <-- this option disables tooltips
            }
        },
        animation: {
            duration: 1000,
        },
        scales: {
            y: {
                grid: {
                    display: false,
                },
                display: false,
                min: 0,
                max: 1,
                stepSize: 0.2,
                
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: "#FFFFFF",
                },
                
            }
        }
    },
    
};

const myChart = new Chart(
    document.getElementById('myChart'),
    config
);

function updateChart(newdata){
    for(let i=0; i<10; i++){
        myChart.data.datasets[0].data[i] = newdata[i];
    }
    myChart.update();
}

const paintCanvas = document.querySelector( '.js-paint' );
const context = paintCanvas.getContext( '2d' );
const smallCanvas = document.querySelector( '.small-canvas' );
const smallContext = smallCanvas.getContext('2d');
const clr_btn = document.querySelector('.clear-btn');
const pred = document.querySelector( '.prediction-value' );
const loading_gif = document.querySelector( '.loader' );
const err_msg = document.querySelector( '.server-error' );
loading_gif.style.display = "none";

context.lineCap = 'round';
context.lineWidth = 10;
width = 150;
height = 150;

let x = 0, y = 0;
let isMouseDown = false;

const stopDrawing = () => { 
    isMouseDown = false; 

    smallContext.clearRect(0, 0, smallCanvas.width, smallCanvas.height);
    smallContext.drawImage(paintCanvas, 0, 0, smallCanvas.width, smallCanvas.height);        
    smallImageData = smallContext.getImageData(0, 0, smallCanvas.width, smallCanvas.height);
    rgba = smallImageData;

    data_img = [];
    for (let i=3; i<rgba.data.length; i+=4){
        data_img.push(rgba.data[i]);
    }
    /*data_img = tf.tensor(data_img);
    data_img = tf.reshape(data_img, [150,150]);
    resized = tf.image.resizeBilinear(tf.expandDims(data_img), [28, 28]);
    resized_img = tf.FromPixels(data_img).resizeBilinear([28,28]);
    console.log(resized_img);*/

    console.log(data_img);

    if (pred.style.display == 'block'){
        pred.style.display = "none";
    }
    loading_gif.style.display = "block";

    
    $.ajax({
        type: "POST",
        url: '/model_predict',
        data: {
            "img": data_img,
        },
        dataType: "json",
        success: function (data_recieved) {
            loading_gif.style.display = "none";

            console.log("successfull");

            pred.style.display = 'block';
            pred.innerHTML = data_recieved["prediction"];

            pred.style.animation = 'pred-value-appear 1s ease 1';

            newdata = data_recieved["pred_array"];

            updateChart(newdata);
        },
        error: function () {
            loading_gif.style.display = "none";
            err_msg.style.display = "flex";
        },
        failure: function() {
            loading_gif.style.display = "none";
            err_msg.style.display = "flex";
        }
    });
    
}
const startDrawing = event => {
    isMouseDown = true;   
[x, y] = [event.offsetX, event.offsetY];  
}
const drawLine = event => {
    if ( isMouseDown ) {
        const newX = event.offsetX;
        const newY = event.offsetY;
        context.beginPath();
        context.moveTo( x, y );
        context.lineTo( newX, newY );
        context.stroke();
        x = newX;
        y = newY;
    }
}  
clr_btn.onclick = function(){ 
    context.clearRect(0, 0, width, height); 
    updateChart([0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1]);
    pred.style.animation = 'pred-value-dissappear 1s ease 1';
    setTimeout(function(){ pred.style.display = 'none'; }, 1000);
}

paintCanvas.addEventListener( 'mousedown', startDrawing );
paintCanvas.addEventListener( 'mousemove', drawLine );
paintCanvas.addEventListener( 'mouseup', stopDrawing );