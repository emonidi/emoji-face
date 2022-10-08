import { useEffect, useRef, useState } from 'react'
import './App.css'
import Camera from './camera'

function App() {

  const images = [
    './devil.png',
    './pngwing.com.png',
    './melting-face_1fae0.png',
    './vite.svg',
    './money-mouth-face_1f911.png',
    './sunglasses-svgrepo-com.svg',
    'https://upload.wikimedia.org/wikipedia/commons/e/e6/Oxygen480-emotes-face-raspberry.svg',
    'https://www.svgrepo.com/show/292366/sunglasses.svg',
    'https://upload.wikimedia.org/wikipedia/commons/0/04/Oxygen480-emotes-face-sad.svg',
    './pngegg.png',
    './pngegg (1).png'
  ]

  const [count, setCount] = useState(0)
  const [hasLoaded,setHasLoaded] = useState(false);
  const [overlay, setOverlay] = useState(images[0])
  const overlayRef = useRef();

  

  const onCamResult = ({face, canvas}) => {
    
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(face && face.image && face.image.width > 0){
        ctx.drawImage(face.image, 0, 0, canvas.width, canvas.height);
    }
  
    face.multiFaceLandmarks.forEach(dots => {
      const projectedWidth = (dots[152].y - dots[10].y)*canvas.height*1.5;
      ctx.drawImage(overlayRef.current, (dots[195].x * canvas.width) - projectedWidth / 2, (dots[195].y * canvas.height) - projectedWidth / 2, projectedWidth, projectedWidth);
    }) 

    
    ctx.restore();
  }

  return (
    <div className="App">
      {overlay.src}
      <Camera setLoaded={(hasLoaded)=>{
        setHasLoaded(hasLoaded)
      }} onFrameResult={onCamResult}>
       
      </Camera>
      <div className='images'>
        {
          images.map(img=> <img onClick={(ev)=>{
             setOverlay(ev.target.src);
          }} key={img} src={img}/>)
        }
      </div>
      <img src={overlay} style={{display:"none"}} ref={overlayRef}/>
    </div>
  )
}

export default App
