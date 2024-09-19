import { useState, useEffect, useRef } from 'react'
import useSound from 'use-sound';
import potions_sound from './assets/sounds/potions_sound.wav'
import './fonts/fonts.css';

import './App.css'

function App() {

  const blueRef   = useRef(null);
  const yellowRef = useRef(null);
  const greenRef  = useRef(null);
  const redRef    = useRef(null);
  
  const minNumber = 0;
  const maxNumber = 3;
  const speedGame = 600;
  
  const [sequence, setSequence] = useState([]);
  const [currentGame, setCurrentGame] = useState([]);
  const [isAllowedToPlay, setIsAllowedToPlay] = useState(false);
  const [speed, setSpeed] = useState(speedGame);
  const [turn, setTurn] = useState(0);
  const [pulses, setPulses] = useState(0);
  const [success, setSuccess] = useState(0);
  const [isGameOn, setIsGameOn] = useState(false);

  const [play] = useSound(potions_sound, {
    sprite: {
      one:   [0,    1000],
      two:   [2000, 1000],
      three: [4000, 1000],
      four:  [6000, 1000],
      error: [8000, 1000],
    },
    interrupt: true
  });

  const initGame = () => {

    // 'isGameOn = true' starts the potions fade-in animation.
    setIsGameOn(true); 

    // Waits until the fade-in animation ends and gives the user little time to get prepared.
    setTimeout(() => {
      randomNumber();
    }, 1500); 
    
  };

  const randomNumber = () => {
    setIsAllowedToPlay(false);
    const randomNumber = Math.floor(Math.random() * (maxNumber - minNumber + 1) + minNumber);
    setSequence([...sequence, randomNumber]);
    setTurn(turn + 1);
  }

  const handleClick = (index) => {
    if (isAllowedToPlay) {
      setIsAllowedToPlay(false); // Prevent further clicks
      play({ id: colors[index].sound });
      showTargetPotion(index);
      setTimeout(() => {
        hideTargetPotion(index);
        setCurrentGame([...currentGame, index]);
        setPulses(pulses + 1);
        setIsAllowedToPlay(true); // Re-allow clicks after animation
      }, speed / 2);
    }
  }; 

  const showTargetPotion = (index) => 
  {
    colors[index].ref.current.style.filter = `saturate(1.5) drop-shadow(0px 7px 1px rgb(0,0,0,.5)) drop-shadow(0px 0px 30px ${colors[index].dropShadowHex})`;
  }

  const hideTargetPotion = (index) => 
  {
    colors[index].ref.current.style.filter = 'saturate(0.3) drop-shadow(0px 7px 1px rgb(0,0,0,.5))';
  }
  
  const colors = [
    { dropShadowHex: "#e6a902", color: 'yellow', ref: yellowRef, sound: 'one' },
    { dropShadowHex: "#022fab", color: 'blue', ref: blueRef, sound: 'two' },
    { dropShadowHex: "#8c032e", color: 'red', ref: redRef, sound: 'three' },
    { dropShadowHex: "#059c41", color: 'green', ref: greenRef, sound: 'four' }
  ];

  useEffect(() => {
    if (pulses > 0) {
      if (Number(sequence[pulses - 1]) === Number(currentGame[pulses - 1])) {
        setSuccess(success + 1);
      } else {
        const index = sequence[pulses - 1];
        if (index) colors[index].ref.current.style.opacity = (1);
        play({ id: 'error' });
        setTimeout(() => {
          if (index) colors[index].ref.current.style.opacity = (0.5);
          setIsGameOn(false);
        }, speed * 2);
        setIsAllowedToPlay(false);
      }
    }
  }, [pulses]);


  useEffect(() => {
    if (!isGameOn)
    {
      setSequence([]);
      setCurrentGame([]);
      setIsAllowedToPlay(false);
      setSpeed(speedGame);
      setSuccess(0);
      setPulses(0);
      setTurn(0);
    }
  }, [isGameOn]);


  useEffect(() => {
    if (success === sequence.length && success > 0)
    {
      setSpeed(speed - sequence.length * 2);
      setTimeout(() => {
        setSuccess(0);
        setPulses(0);
        setCurrentGame([]);
        randomNumber();
      }, 500); 
    }
  }, [success]);


  useEffect(() => {
    if (!isAllowedToPlay) {
      sequence.map((item, index) => {
        setTimeout(() => {
          play({ id: colors[item].sound });
          showTargetPotion(item);
          setTimeout(() => {
            hideTargetPotion(item);
          }, speed / 2);
        }, speed * index);
      });
    }
    setIsAllowedToPlay(true);
  }, [sequence]);

  // Preload images to have them laoded on chache.
  useEffect(() => {
    colors.forEach(item => {
      const img = new Image();
      img.src = `/assets/potions/${item.color}-potion.webp`;
    });
  }, [colors]);

  return (
    <>
      {isGameOn
      ? (
        <>
          <header>
            <h1>Turn {turn}</h1>
          </header>
          <div className='container'>
            {colors.map((item, index) => {
              return (
                <img
                  draggable="false"
                  src={`/assets/potions/${item.color}-potion.webp`}
                  key={index}
                  ref={item.ref}
                  className={`potion ${item.color} ${isGameOn ? 'fade-in' : ''}`}
                  onClick={() => handleClick(index)}
                />
              )
            })}
          </div>
        </>
      )
      : (
        <>
          <div className='info'>
            <p>This game is intended to be played without zoom. For a better user experience, please keep your browser's zoom level at 100%.</p>
          </div>
          <header className="introHeader">
            <img src="/logo.png" alt="Simon's Potions Logo" />
            <h1>SIMON'S POTIONS</h1>
            <button onClick={initGame}>START</button>

          </header>
        </>
      )}
    </>
  )

}

export default App
