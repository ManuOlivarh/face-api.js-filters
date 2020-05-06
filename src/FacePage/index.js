import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from "react-redux";
import mapStateToProps from './mapStateToProps';
import mapDispatchToProps from './mapDispatchToProps';
import Camera from './Camera';
import Canva from './Canva';
import * as faceapi from 'face-api.js';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './style.css';



var settings = {
    className: "slider variable-width",
    dots: false,
    infinite: true,

    speed: 100,
    slidesToShow: 1,
    slidesToScroll: 1,
    variableWidth: true
};
class FacePage extends Component {


    constructor(props) {
        super(props);
        this.state = {
            controller: 'game',
            loading: false,
            authorized: false,
            checkAutorization: true,
            positionIndex: 0,
            filterName: 'playa1',
            imageFilter: new Image(),
            showFilter: true,
            filterSize: 0,
            filterY: 68,
            landStart: 63,
            landEnd: 13
        }
        this.setVideoHandler = this.setVideoHandler.bind(this);
        this.isModelLoaded = this.isModelLoaded.bind(this);
        this.switchFilter = this.switchFilter.bind(this);

    }

    async setVideoHandler() {
        if (this.isModelLoaded() !== undefined) {
            try {
                let result = await faceapi.detectSingleFace(this.props.video.current, this.props.detector_options).withFaceLandmarks().withFaceExpressions().withAgeAndGender();
                if (result !== undefined) {
                    console.log("face detected", 1);
                    const dims = faceapi.matchDimensions(this.props.canvas.current, this.props.video.current, true);
                    const resizedResult = faceapi.resizeResults(result, dims);
                    //  faceapi.draw.drawDetections(this.props.canvas.current, resizedResult);
                    //faceapi.draw.drawFaceLandmarks(this.props.canvas.current, resizedResult);

                    const currentCanvas = ReactDOM.findDOMNode(this.props.canvas.current);
                    var canvasElement = currentCanvas.getContext("2d");
                    this.addFilter(canvasElement, result);
                    this.addBoxIndexOfLandmark(canvasElement, result.landmarks.positions[this.state.positionIndex]);
                    this.addBackgroundInformation(canvasElement, result);
                    this.addGenderAndAgeInformation(canvasElement, result);
                    this.addEmotionInformation(canvasElement, resizedResult, result);

                } else {
                    console.log("face detected", 1);
                }
            } catch (exception) {
                console.log(exception);
            }
        }
        setTimeout(() => this.setVideoHandler());
    }

    addBoxIndexOfLandmark(canvasElement, landkmarkPosition) {
        let width = 10, height = 10;
        canvasElement.setTransform(1, 0, 0, 1, 0, 0);
        canvasElement.fillStyle = 'rgb(255, 87, 51)';
        canvasElement.fillRect(landkmarkPosition.x, landkmarkPosition.y, width, height);
        canvasElement.closePath();
        canvasElement.setTransform(1, 0, 0, 1, 0, 0);
    }

    addBackgroundInformation(canvasElement, result) {
        let positionX = result.landmarks.positions[8].x,
            positionY = result.landmarks.positions[8].y + 10;
        canvasElement.fillStyle = "black";
        canvasElement.fillRect(positionX - 45, positionY - 12, 90, 45);
    }

    addGenderAndAgeInformation(canvasElement, result) {
        // Edad y Sexo
        canvasElement.font = "10px Comic Sans MS";
        //canvasElement.font="30px Arial";
        canvasElement.fillStyle = "red";
        let positionX = result.landmarks.positions[8].x,
            positionY = result.landmarks.positions[8].y + 10,
            gender = (result.gender) === "male" ? "Hombre" : "Mujer",
            age = "Edad: " + result.age.toFixed();
        gender = "Sexo: " + gender;

        canvasElement.textAlign = "center";
        canvasElement.fillStyle = "white";
        canvasElement.fillText(gender, positionX, positionY);
        canvasElement.fillText(age, positionX, positionY + 15);
    }

    addEmotionInformation(canvasElement, resizedResult, result) {
        const expressions = resizedResult.expressions;
        const maxValue = Math.max(...Object.values(expressions));
        let emotion = Object.keys(expressions).filter(
            item => expressions[item] === maxValue
        );
        emotion = emotion[0];
        emotion = (emotion === "happy") ? "feliz" : emotion;
        emotion = (emotion === "neutral") ? "neutral" : emotion;
        emotion = (emotion === "angry") ? "enojado" : emotion;
        emotion = (emotion === "sad") ? "triste" : emotion;
        emotion = (emotion === "surprised") ? "sorprendido" : emotion;
        emotion = (emotion === "fearful") ? "temeroso" : emotion;

        let positionX = result.landmarks.positions[8].x,
            positionY = result.landmarks.positions[8].y + 10;
        canvasElement.fillText("Emocion: " + emotion, positionX, positionY + 30);
    }

    addFilter(canvasElement, result) {
        let startIndex = (this.state.landStart), endIndex = (this.state.landEnd), ajustX = (this.state.filterSize), ajustY = (this.state.filterY);
        let positionX1 = result.landmarks.positions[startIndex].x - ajustX,
            positionY1 = result.landmarks.positions[startIndex].y + ajustY,
            positionX2 = result.landmarks.positions[endIndex].x + ajustX,
            positionY2 = result.landmarks.positions[endIndex].y + ajustY,
            m = ((positionY2 - positionY1) / (positionX2 - positionX1)) * 100;


        let width = positionX2 - positionX1,
            height = width * 0.8;

        positionY1 -= (height / 4);
        positionY2 -= (height / 4);

        var TO_RADIANS = Math.PI / 180,
            angleInRad = (m / 2.5) * TO_RADIANS;
        console.log("TO_RADIANS", TO_RADIANS);
        console.log(width)
        canvasElement.setTransform(1, 0, 0, 1, 0, 0);
        canvasElement.translate(positionX1, positionY1 - 50);
        canvasElement.rotate(angleInRad);
        canvasElement.drawImage(this.state.imageFilter, 0, 0, width, height);
        /*canvasElement.translate(positionX1 ,positionY1) 
        canvasElement.translate(1,0,0,0,positionX1+(width/2),positionY1); 
        canvasElement.rotate(angleInRad);    */
        //canvasElement.drawImage(this.state.imageFilter,0,0,width,height);
        //canvasElement.restore();
        canvasElement.setTransform(1, 0, 0, 1, 0, 0);
        //this.rotateAndPaintImage(canvasElement, this.state.imageFilter, angleInRad, positionX1, positionY1,20,0 );
    }

    rotateAndPaintImage(context, image, angleInRad, positionX, positionY, axisX, axisY) {
        context.translate(positionX, positionY);
        context.rotate(angleInRad);
        context.drawImage(image, -axisX, -axisY);
        context.rotate(-angleInRad);
        context.translate(-positionX, -positionY);
    }

    isModelLoaded() {
        if (this.props.selected_face_detector === this.props.SSD_MOBILENETV1) return faceapi.nets.ssdMobilenetv1.params;
        if (this.props.selected_face_detector === this.props.TINY_FACE_DETECTOR) return faceapi.nets.tinyFaceDetector.params;
    }


    async componentDidMount() {
        console.log("height: " + window.screen.height + ", width: " + window.screen.width);

        // obtener parametros de configuracion y asignar el modelo que vamos a usar para reconocer rostros
        this.setDetectorOptions();
        this.props.SET_VIDEO_HANDLER_IN_GAME_FACENET(this.setVideoHandler);

        // asignar los archivos del model a face-api
        let modelFolder = "/models";

        let dirs = {
            playa1: '/filter/sunglasses1.svg',
            playa2: '/filter/sunglasses2.svg',
        }


        let valor = 'playa1'
        try {
            await faceapi.loadFaceLandmarkModel(modelFolder);
            await faceapi.nets.ageGenderNet.loadFromUri(modelFolder);
            await faceapi.nets.faceExpressionNet.loadFromUri(modelFolder);
            if (this.props.selected_face_detector === this.props.SSD_MOBILENETV1) await faceapi.nets.ssdMobilenetv1.loadFromUri(modelFolder);
            if (this.props.selected_face_detector === this.props.TINY_FACE_DETECTOR) await faceapi.nets.tinyFaceDetector.load(modelFolder);

            this.state.imageFilter.src = (dirs[valor]);
            this.state.imageFilter.onload = function () {
                console.log("image is loaded");

            }
        } catch (exception) {
            console.log("exception", exception);
        }
    }


    async componentDidUpdate() {
        console.log('El estado ha cambiado')
        this.props.SET_VIDEO_HANDLER_IN_GAME_FACENET(this.setVideoHandler);

        // asignar los archivos del model a face-api
        let modelFolder = "/models";

        let dirs = {
            playa1: '/filter/drink.svg',
            playa2: '/filter/heartglasses.svg',
            playa3: '/filter/sunglasses5.svg',
            playa4: '/filter/people.svg',
            playa5: '/filter/drinkplace.svg',
            playa6: '/filter/ball.svg',
            playa7: '/filter/sunface.svg',
            playa8: '/filter/jelly.svg',
            playa9: '/filter/lifeguard.svg',
            playa10: '/filter/fashion.svg',
            playa11: '/filter/drinkwater.svg',
            playa12: '/filter/beach.svg',
            playa13: '/filter/zoo.svg',
            playa14: '/filter/boatshark.svg',
            playa15: '/filter/sunglasses7.svg',

        }



        let valor = this.state.filterName
        try {
            await faceapi.loadFaceLandmarkModel(modelFolder);
            await faceapi.nets.ageGenderNet.loadFromUri(modelFolder);
            await faceapi.nets.faceExpressionNet.loadFromUri(modelFolder);
            if (this.props.selected_face_detector === this.props.SSD_MOBILENETV1) await faceapi.nets.ssdMobilenetv1.loadFromUri(modelFolder);
            if (this.props.selected_face_detector === this.props.TINY_FACE_DETECTOR) await faceapi.nets.tinyFaceDetector.load(modelFolder);

            this.state.imageFilter.src = (dirs[valor]);
            this.state.imageFilter.onload = function () {
                console.log("image is loaded");

            }
        } catch (exception) {
            console.log("exception", exception);
        }

    }
    setDetectorOptions() {
        let minConfidence = this.props.min_confidence,
            inputSize = this.props.input_size,
            scoreThreshold = this.props.score_threshold;

        // identificar el modelo previsamente entrenado para reconocer rostos.
        // el modelo por defecto es tiny_face_detector
        let options = this.props.selected_face_detector === this.props.SSD_MOBILENETV1
            ? new faceapi.SsdMobilenetv1Options({ minConfidence })
            : new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold });
        this.props.SET_DETECTOR_OPTIONS_IN_GAME_FACENET(options);
    }


    switchFilter(e) {
        let dirs = {
            playa1: { filterSize: 0, filterY: 63, landStart: 63, landEnd: 13 },
            playa2: { filterSize: 0, filterY: 20, landStart: 0, landEnd: 16 },
            playa3: { filterSize: 0, filterY: 20, landStart: 0, landEnd: 16 },
            playa4: { filterSize: 75, filterY: 20, landStart: 0, landEnd: 16 },
            playa5: { filterSize: 200, filterY: 15, landStart: 0, landEnd: 16 },
            playa6: { filterSize: 0, filterY: 90, landStart: 63, landEnd: 13 },
            playa7: { filterSize: 75, filterY: 20, landStart: 0, landEnd: 16 },
            playa8: { filterSize: 0, filterY: 20, landStart: 0, landEnd: 16 },
            playa9: { filterSize: 150, filterY: 10, landStart: 0, landEnd: 16 },
            playa10: { filterSize: 100, filterY: -125, landStart: 0, landEnd: 16 },
            playa11: { filterSize: 0, filterY: 63, landStart: 4, landEnd: 62 },
            playa12: { filterSize: 75, filterY: -125, landStart: 0, landEnd: 16 },
            playa13: { filterSize: 125, filterY: 10, landStart: 0, landEnd: 16 },
            playa14: { filterSize: 0, filterY: 20, landStart: 0, landEnd: 16 },
            playa15: { filterSize: 0, filterY: 20, landStart: 0, landEnd: 16 },
        }


        this.setState({ filterName: e.target.value, filterSize: (dirs[e.target.value].filterSize), filterY: (dirs[e.target.value].filterY), landStart: (dirs[e.target.value].landStart), landEnd: (dirs[e.target.value].landEnd) })

    }




    render() {
        return (



            <div>
                <Camera />
                <Canva />

                <input type="number"
                    style={{ marginLeft: 1000 }}
                    value={this.state.positionIndex}
                    onChange={(event) => { this.setState({ positionIndex: event.target.value }) }} />
         

                <Slider {...settings} style={{ width: 300 }} className="slider">
                    <div style={{ width: 75 }}>
                        <button value='playa1' onClick={this.switchFilter}>Coco</button>
                    </div>
                    <div style={{ width: 75 }}>
                        <button value='playa2' onClick={this.switchFilter}>Lentes</button>
                    </div>
                    <div style={{ width: 75 }}>
                        <button value='playa3' onClick={this.switchFilter}>Delfin</button>
                    </div>
                    <div style={{ width: 75 }}>
                        <button value='playa4' onClick={this.switchFilter}>Persona</button>
                    </div>
                    <div style={{ width: 75 }}>
                        <button value='playa5' onClick={this.switchFilter}>Tienda</button>
                    </div>
                    <div style={{ width: 75 }}>
                        <button value='playa6' onClick={this.switchFilter}>Pelota</button>
                    </div>
                    <div style={{ width: 75 }}>
                        <button value='playa7' onClick={this.switchFilter}>Sunface</button>
                    </div>
                    <div style={{ width: 75 }}>
                        <button value='playa8' onClick={this.switchFilter}>Medusa</button>
                    </div>
                    <div style={{ width: 75 }}>
                        <button value='playa9' onClick={this.switchFilter}>Salvavidas</button>
                    </div>
                    <div style={{ width: 75 }}>
                        <button value='playa10' onClick={this.switchFilter}>Sombrero1</button>
                    </div>
                    <div style={{ width: 75 }}>
                        <button value='playa11' onClick={this.switchFilter}>Limonada</button>
                    </div>
                    <div style={{ width: 75 }}>
                        <button value='playa12' onClick={this.switchFilter}>Sombrero2</button>
                    </div>
                    <div style={{ width: 75 }}>
                        <button value='playa13' onClick={this.switchFilter}>Pulpo</button>
                    </div>
                    <div style={{ width: 75 }}>
                        <button value='playa14' onClick={this.switchFilter}>Tiburon</button>
                    </div>
                    <div style={{ width: 75 }}>
                        <button value='playa15' onClick={this.switchFilter}>LentesH</button>
                    </div>

                </Slider>

            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(FacePage);