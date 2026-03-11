import { useState } from "react"
import Field from "./field"
import { useCallback } from "react"
import { useEffect } from "react"
import { useMemo } from "react"
import { useWithSound } from "./use-with-sound"
import clickSound from './assets/click.mp3'

const createMap = () => {
  const fields = []
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      fields.push({
        x,
        y,
        isBomb: Math.random() < 0.15,
        state: 'hidden',
        highlighted: false
      })
    }
  }
  return fields.map(field => {
    if (field.isBomb) {
      return {
        ...field,
        adjecentBombs: null
      }
    }
    let bombs = 0
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        if (x === 0 && y === 0) {
          continue
        }
        const adjecentField = fields.find(f => f.x === field.x + x && f.y === field.y + y)
        if (adjecentField?.isBomb) {
          bombs++
        }
      }
    }
    return bombs > 0
      ? {
        ...field,
        adjecentBombs: bombs
      }
      : {
        ...field,
        adjecentBombs: null
      }
  })
}

function App() {
  const [map, setMap] = useState(createMap());
  const [gameState, setGameState] = useState('in-progress')

  const bombsAmount = useMemo(() => map.filter(field => field.isBomb).length, [map])
  const flagsAmount = useMemo(() => map.filter(field => field.state === 'flagged').length, [map])

  const click = useWithSound(clickSound)

  const restart = useCallback(() => {
    setMap(createMap)
    setGameState('in-progress')
  }, []);
  const handleFieldClick = useCallback(field => {
    if (gameState !== 'in-progress') {
      return
    }
    if (field.state === 'hidden') {
      if (field.isBomb) {
        setGameState('game-over')
      }
      setMap(map.map(f => f !== field ? f : {
        ...f,
        state: 'clicked'
      }))
      if (!field.isBomb) {
        click.playSound()
      }
    }
  }, [click, gameState, map])

  const handleFieldHover = useCallback(field => setMap(map.map(f => {
    let highlighted = false
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        if (f.x === field.x + x && f.y === field.y + y) {
          highlighted = true
        }
      }
    }
    return {
      ...f,
      highlighted
    }
  })), [map])

  const handleFieldFlagged = useCallback(field => {
    if ((field.state === 'hidden' && flagsAmount >= bombsAmount) || gameState !== 'in-progress') {
      return
    }
    if (field.state !== 'clicked') {
      setMap(map.map(f => f !== field ? f : {
        ...f,
        state: f.state === 'hidden' ? 'flagged' : 'hidden'
      }))
    }
  }, [bombsAmount, flagsAmount, gameState, map])

  useEffect(() => {
    if (gameState !== 'in-progress') {
      return
    }
    const candidateFields = map.filter(f => f.state === 'hidden' && !f.isBomb)
    const fieldsToUpdate = []
    candidateFields.forEach(field => {
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          if (x === 0 && y === 0) {
            continue
          }
          const adjecentField = map.find(f => f.x === field.x + x && f.y === field.y + y)
          if (adjecentField?.state === 'clicked' && adjecentField?.adjecentBombs === null) {
            fieldsToUpdate.push(field)
          }
        }
      }
      if (fieldsToUpdate.length > 0) {
        setMap(map.map(f => fieldsToUpdate.find(fieldToUpdate => fieldToUpdate.x === f.x && fieldToUpdate.y === f.y)
          ? {
            ...f,
            state: 'clicked'
          }
          : f))
      }
    });
  }, [gameState, map])

  useEffect(() => {
    const bombFields = map.filter(field => field.isBomb)
    if (bombFields.every(f => f.state === 'flagged')) {
      setGameState('won')
    }
  }, [map])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      <div className="grid grid-cols-16 gap-1 sm:gap-2 w-full sm:w-xl md:w-3xl">
        {map.map(field => <Field
          key={`${field.x}-${field.y}`}
          field={field}
          map={map}
          gameState={gameState}
          onClick={() => handleFieldClick(field)}
          onRightClick={() => handleFieldFlagged(field)}
          onHover={() => handleFieldHover(field)}
        />)}
      </div>
      <div className="grid grid-cols-3 items-center gap-8 text-center">
        <p>💣: {bombsAmount}</p>
        <button onClick={restart} className="bg-green-500 text-white px-4 py-2">Restart</button>
        <p>🚩: {flagsAmount}</p>
      </div>
    </div>
  )
}

export default App
