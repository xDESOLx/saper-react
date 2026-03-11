import { useMemo } from "react"

export default function Field({ field, gameState, onClick, onRightClick, onHover }) {
    const background = useMemo(() => {
        return {
            'clicked': 'bg-slate-300',
            'hidden': 'bg-slate-800',
            'flagged': 'bg-slate-800'
        }[field.state]
    }, [field.state])
    return (
        <div onContextMenu={e => {
            e.preventDefault()
            onRightClick()
        }} onClick={onClick} onMouseOver={onHover} className={`aspect-square ${field.isBomb && gameState === 'game-over'
            ? 'bg-red-800 animate-pulse'
            : field.isBomb && gameState === 'won'
                ? 'bg-green-800 animate-pulse'
                : background} ${field.highlighted ? 'border-2' : 'border-0'} border-blue-500 flex items-center justify-center text-xl font-bold transition-colors duration-300 rounded-md`}>
            {gameState === 'game-over' && field.isBomb && '💣'}
            {field.state === 'clicked' && field.adjecentBombs}
            {field.state === 'flagged' && gameState !== 'game-over'  && '🚩'}
        </div>
    )
}