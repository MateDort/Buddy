/**
 * Rive-backed buddy character.
 *
 * When .riv files arrive, drop them in public/rive/ and set RIVE_READY = true.
 * The state machine input names must match the strings in INPUTS below.
 * Until then this renders the SVG placeholder.
 */

import { useRive, useStateMachineInput } from '@rive-app/react-canvas'
import { BuddyCharacter, type Expression } from './BuddyCharacter'

export type { Expression }

// ── Config ────────────────────────────────────────────────────────────────────

/** Flip to true once .riv assets land in public/rive/ */
const RIVE_READY = false

const RIVE_SRC = '/rive/biscuit.riv'
const STATE_MACHINE = 'BiscuitStateMachine'

/** Map Expression → Rive state machine trigger input name */
const INPUTS: Record<Expression, string> = {
  idle:     'idle',
  happy:    'happy',
  hungry:   'hungry',
  thinking: 'thinking',
  speaking: 'speaking',
  eating:   'eating',
  yawn:     'yawn',
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  size?: number
  expression?: Expression
}

function RiveCharacter({ size = 200, expression = 'idle' }: Props) {
  const { rive, RiveComponent } = useRive({
    src: RIVE_SRC,
    stateMachines: STATE_MACHINE,
    autoplay: true,
  })

  // Trigger the correct state machine input when expression changes
  const idleInput     = useStateMachineInput(rive, STATE_MACHINE, INPUTS.idle)
  const happyInput    = useStateMachineInput(rive, STATE_MACHINE, INPUTS.happy)
  const hungryInput   = useStateMachineInput(rive, STATE_MACHINE, INPUTS.hungry)
  const thinkingInput = useStateMachineInput(rive, STATE_MACHINE, INPUTS.thinking)
  const speakingInput = useStateMachineInput(rive, STATE_MACHINE, INPUTS.speaking)
  const eatingInput   = useStateMachineInput(rive, STATE_MACHINE, INPUTS.eating)
  const yawnInput     = useStateMachineInput(rive, STATE_MACHINE, INPUTS.yawn)

  // Fire the trigger for the current expression
  const inputs = { idle: idleInput, happy: happyInput, hungry: hungryInput, thinking: thinkingInput, speaking: speakingInput, eating: eatingInput, yawn: yawnInput }
  const target = inputs[expression]
  if (target && !target.value) {
    target.fire?.()
  }

  return (
    <div style={{ width: size, height: size * 1.25, flexShrink: 0 }}>
      <RiveComponent style={{ width: '100%', height: '100%' }} />
    </div>
  )
}

/**
 * BuddyCharacterRive — drop-in replacement for BuddyCharacter.
 * Uses SVG placeholder until RIVE_READY is true.
 */
export function BuddyCharacterRive({ size = 200, expression = 'idle' }: Props) {
  if (!RIVE_READY) {
    return <BuddyCharacter size={size} expression={expression} />
  }
  return <RiveCharacter size={size} expression={expression} />
}
