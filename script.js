let video = document.querySelector(".video");
let canvas = document.querySelector(".canvas");
let width = 800;
let height = 600;
let pose;
let skeleton;
let white = false;
const ctx = canvas.getContext("2d");
ctx.fillStyle = "#FFFFFF";
ctx.strokeStyle = "#FFFFFF";
ctx.lineWidth = 5;
canvas.style.filter = `blur(1px)brightness(90%)grayscale(50%)`;
console.log("ml5 version:", ml5.version);
//image assets
function preload(part, len) {
	let arr = [];
	for (let i = 0; i < len; i++) {
		let image = new Image();
		image.src = `./assets/${part}${i}.png`;
		arr.push(image);
	}
	return arr;
}
let eyeimageArr = preload("eye", 5);
let mouthimageArr = preload("mouth", 3);
let noseimageArr = preload("nose", 3);
let eyei = 0;
let mouthi = 0;
let nosei = 0;
let eyeimage = eyeimageArr[eyei];
let mouthimage = mouthimageArr[mouthi];
let noseimage = noseimageArr[nosei];

//click event
eyeButton.addEventListener("click", () => {
	eyei = (eyei + 1) % 5;
	eyeimage = eyeimageArr[eyei];
});
mouthButton.addEventListener("click", () => {
	mouthi = (mouthi + 1) % 3;
	mouthimage = mouthimageArr[mouthi];
});
noseButton.addEventListener("click", () => {
	nosei = (nosei + 1) % 3;
	noseimage = noseimageArr[nosei];
});
background.addEventListener("click", () => {
	white = !white;
});

//poseNet setting
const poseNet = ml5.poseNet(video, modelLoaded);
// When the model is loaded
function modelLoaded() {
	console.log("Model Loaded!");
}
// Listen to new 'pose' events
poseNet.on("pose", (results) => {
	pose = results[0];
});

//get video data
function getVideo() {
	navigator.mediaDevices
		.getUserMedia({ video: true, audio: false })
		.then((localMediaStream) => {
			// console.log(localMediaStream);
			// video.src = window.URL.createObjectURL(localMediaStream);
			video.srcObject = localMediaStream;
			video.play();
		})
		.catch((err) => {
			console.log(`Something wrong happened!`, err);
		});
}
//change background
function whiteBG() {
	ctx.fillStyle = "#FFFFFF";
	ctx.beginPath();
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.stroke();
}
function videoBG() {
	ctx.drawImage(video, 0, 0, width, height);
}
//paint on canvas
function paintToCanvas() {
	setInterval(() => {
		//put webcamdata on canvas
		if (pose) {
			white ? videoBG() : whiteBG();
			let dx = pose.pose.rightEye.x - pose.pose.leftEye.x;
			let dy = pose.pose.rightEye.y - pose.pose.leftEye.y;
			let distance = Math.sqrt(dx * dx + dy * dy);
			let scale = distance / 125;
			let noseShrink = 2;
			let dNoseMouth = pose.pose.nose.y - pose.pose.rightEye.y;
			ctx.drawImage(
				eyeimage,
				pose.pose.rightEye.x - (eyeimage.width * scale) / 2,
				pose.pose.rightEye.y - (eyeimage.height * scale) / 2,
				eyeimage.width * scale,
				eyeimage.height * scale
			);
			ctx.drawImage(
				eyeimage,
				pose.pose.leftEye.x - (eyeimage.width * scale) / 2,
				pose.pose.leftEye.y - (eyeimage.height * scale) / 2,
				eyeimage.width * scale,
				eyeimage.height * scale
			);
			ctx.drawImage(
				mouthimage,
				pose.pose.nose.x - (mouthimage.width * scale) / 2,
				pose.pose.nose.y - (mouthimage.height * scale) / 2 + dNoseMouth,
				mouthimage.width * scale,
				mouthimage.height * scale
			);
			ctx.drawImage(
				noseimage,
				pose.pose.nose.x - (noseimage.width * scale) / noseShrink / 2,
				pose.pose.nose.y - (noseimage.height * scale) / noseShrink / 2,
				(noseimage.width * scale) / noseShrink,
				(noseimage.height * scale) / noseShrink
			);

			ctx.stroke();
			showSkeleton();
		}
	}, 4);
}
getVideo();
video.addEventListener("canplay", paintToCanvas);

function showSkeleton() {
	skeleton = pose.skeleton;
	for (let i = 0; i < skeleton.length; i++) {
		let a = skeleton[i][0];
		let b = skeleton[i][1];
		ctx.strokeStyle = "#FF0000";
		ctx.beginPath();
		ctx.moveTo(a.position.x, a.position.y);
		ctx.lineTo(b.position.x, b.position.y);
		ctx.stroke();
	}
}
