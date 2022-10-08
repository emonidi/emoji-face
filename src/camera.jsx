import Webcam from "react-webcam"
import { useEffect, useRef, useState } from "react"
import { FaceMesh, VERSION } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { useAnimationFrame } from "framer-motion"

export default function camera({setLoaded, onFrameResult}) {

    const ref = useRef();
    const canvasRef = useRef();
    const [camIds, setCamIds] = useState([]);
    const [camId, setCamId] = useState(null);
    const [size,setSize] = useState({width:640,height:480});
    const [hasLoaded,setHasLoaded] = useState(false);

    useEffect(()=>{
        setLoaded(hasLoaded)
    },[hasLoaded])

    const init = async () => {
       
        if (ref && ref.current) {
          
            let faceMesh = new window.FaceMesh({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@` +
                        `${window.VERSION}/${file}`;
                }
            });
            
            

            

            faceMesh.setOptions({
                maxNumFaces: 1,
                refineLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5,
            });

            var ctx = canvasRef.current.getContext('2d');
            canvasRef.current.width = size.width;
            canvasRef.current.height = size.height;
            faceMesh.onResults(res => {
                if(!hasLoaded) {
                    setHasLoaded(true);
                }
               
                onFrameResult({face:res,canvas:canvasRef.current});
            })
            await faceMesh.initialize();

            const camera = new window.Camera(ref.current.video, {

                onFrame: async (frame) => {
                  
                    await faceMesh.send({ image: camera.video });
                },
                width: size.width,
                height: size.height,
            })

            camera.start();

        }
    }
    useEffect(() => {
       
        init();
    }, [ref])

    useEffect(() => {
        const width = window.innerWidth;
        const height = window.innerWidth/1.5;
        setSize({width,height});
        const getCams = async () => {
            const camIds = await (await navigator.mediaDevices.enumerateDevices()).filter(device => device.kind === 'videoinput')
            const userMedia = await navigator.mediaDevices.getUserMedia({video:{deviceId:camIds[0].deviceId}})
            const settings = userMedia.getVideoTracks()[0].getSettings();
            const filtered = camIds.filter(item => item.kind === 'videoinput');
            setCamIds(filtered);
          
            setCamId(filtered[0].deviceId)
            setSize({width:settings.width,height:settings.height})
        }
        getCams();
        
    }, [])



    return (
        <>
            {
                camIds.length > 0 &&
                <select  value={camId} onChange={async (ev) => {
                    
                    let camId = camIds.filter(cam => cam.deviceId === ev.target.value)[0];
                    const userMedia = await navigator.mediaDevices.getUserMedia({video:{deviceId:camId.deviceId}})
                    const settings = userMedia.getVideoTracks()[0].getSettings();
                    const filtered = camIds.filter(item => item.kind === 'videoinput');
                    setSize({width:settings.width,height:settings.height})
                    setCamId(camId.deviceId)
                }}>
                    {
                        camIds.map(cam => <option key={cam.deviceId} value={cam.deviceId}>{cam.label}</option>)
                    }
                </select>
            }
            {
                camId && <span>{camId.deviceId}</span>
            }
           
           <Webcam
                style={{"display":"none"}}
                ref={ref}
                width={size.width}
                height={size.height}
                videoConstraints={{
                    width:size.width,
                    height:  size.height ,
                    deviceId: camId
                }}
            />

            {
                !hasLoaded &&  <h1>Loading AI ...</h1>
            }
             <canvas ref={canvasRef} style={{  width:size.width,
                    height: size.height}} />           
        </>

    )
}