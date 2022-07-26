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
const clr_btn = document.querySelector('.clear-btn');
const pred = document.querySelector( '.prediction-value' );

context.lineCap = 'round';
context.lineWidth = 10;
width = 150;
height = 150;

let x = 0, y = 0;
let isMouseDown = false;

const stopDrawing = () => { 
    isMouseDown = false; 
    rgba = context.getImageData(0, 0, width, height);
    console.log(rgba);
    data_img = [];
    for (let i=3; i<rgba.data.length; i+=4){
        data_img.push(rgba.data[i]);
    }

    $.ajax({
        type: "POST",
        url: '/model_predict',
        data: {
            "img": Array.from(data_img),
        },
        dataType: "json",
        success: function (data_recieved) {

            console.log("successfull, prediciton: ");
            console.log(data_recieved);

            pred.style.display = 'block';
            pred.innerHTML = data_recieved["prediction"];

            pred.style.animation = 'pred-value-appear 1s ease 1';

            newdata = data_recieved["pred_array"];

            updateChart(newdata);
        },
        failure: function () {
            console.log("failure");
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