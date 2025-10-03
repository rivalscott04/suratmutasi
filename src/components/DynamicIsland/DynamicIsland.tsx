import { ReactNode, useEffect, useRef, useState } from 'react'
import { SpringConfig, animated, useSpring } from 'react-spring'

export enum IslandMode {
  DEFAULT = 'Default',
  STRETCHED = 'Stretched',
  SPLIT = 'Split',
  LARGE = 'Large',
  SQUARE = 'Square',
}

type TransitionMode = `from${IslandMode}To${IslandMode}`

type SharedIslandScene<Name extends string> = {
  name: Name
}

type StretchedIslandScene<Name extends string> = SharedIslandScene<Name> & {
  mode: IslandMode.STRETCHED
  left: ReactNode
  right: ReactNode
}

type SplitIslandScene<Name extends string> = SharedIslandScene<Name> & {
  mode: IslandMode.SPLIT
  left: ReactNode
  right: ReactNode
}

type LargeIslandScene<Name extends string> = SharedIslandScene<Name> & {
  mode: IslandMode.LARGE
  left: ReactNode
  right: ReactNode
}

type SquareIslandScene<Name extends string> = SharedIslandScene<Name> & {
  mode: IslandMode.SQUARE
  item: ReactNode
}

type IslandScene<Name extends string = string> =
  | StretchedIslandScene<Name>
  | SplitIslandScene<Name>
  | LargeIslandScene<Name>
  | SquareIslandScene<Name>

export type DynamicIslandProps<
  Name extends string,
  T extends IslandScene<Name>
> = {
  scenes: T[]
  /**
   * When it's null, it means default scene.
   */
  currentSceneName: T['name'] | null
  /**
   * When it's true, the island will animate shrinking down before hiding.
   */
  isHiding?: boolean
  /**
   * When it's true, the island will animate in (for mount animation).
   */
  isVisible?: boolean
}

type DistributiveOmit<T, K extends keyof any> = T extends any
  ? Omit<T, K>
  : never

export const makeScene = <
  Name extends string,
  T extends DistributiveOmit<IslandScene, 'name'>
>(
  name: Name,
  options: T
): IslandScene<Name> => {
  return {
    name,
    ...options,
  }
}

export type SceneName<T extends IslandScene[]> = null | T[number]['name']

const Gaussian = animated('feGaussianBlur')
const ColorMatrix = animated('feColorMatrix')

const flatMove: SpringConfig = {
  tension: 300,
  mass: 0.1,
}

// Internal component that handles all hooks
const DynamicIslandInternal = <Name extends string, T extends IslandScene<Name>>({
  scenes,
  currentSceneName,
  isHiding = false,
}: DynamicIslandProps<Name, T>) => {
  const transitionModeRef = useRef<TransitionMode | null>(null)
  const previousSceneRef = useRef<IslandScene | null>(null)

  const currentScene = scenes.find(({ name }) => name === currentSceneName)

  const [currentMode, setCurrentMode] = useState<IslandMode>(
    currentScene?.mode ?? IslandMode.DEFAULT
  )

  useEffect(() => {
    const previousScene = previousSceneRef.current
    previousSceneRef.current = currentScene ?? null

    transitionModeRef.current = `from${
      previousScene?.mode ?? IslandMode.DEFAULT
    }To${currentScene?.mode ?? IslandMode.DEFAULT}`

    // Default mode
    if (currentSceneName === null) {
      setCurrentMode(IslandMode.DEFAULT)
      return
    }

    setCurrentMode(currentScene?.mode ?? IslandMode.DEFAULT)
  }, [currentSceneName])

  const dynamicIslandStyles = useSpring(
    isHiding
      ? {
          config: {
            tension: 300,
            mass: 0.8,
          },
          width: 112,
          height: 32,
          opacity: 0,
          scale: 0.8,
        }
      : currentMode === IslandMode.LARGE
      ? {
          config: {
            tension: 250,
            mass: 1.5,
          },
          from: { opacity: 0, scale: 0.8, width: 112, height: 32 }, // START HIDDEN
          width: 352,
          height: 72,
          opacity: 1,
          scale: 1,
          delay: transitionModeRef.current === 'fromSplitToLarge' ? 50 : 0,
        }
      : {
          config: { ...flatMove },
          from: { opacity: 0, scale: 0.8 }, // START HIDDEN
          width: 112,
          height: 32,
          opacity: 1,
          scale: 1,
          delay: transitionModeRef.current === 'fromSplitToDefault' ? 0 : 100,
        }
  )

  const darkRoomStyles = useSpring(
    currentMode === IslandMode.SPLIT
      ? {
          config:
            transitionModeRef.current === 'fromLargeToSplit'
              ? { ...flatMove }
              : {
                  tension: 250,
                  mass: 2,
                },
          transform: 'translateX(-42px)',
          width: 112 + 33 + 9,
          height: 32,
          delay: transitionModeRef.current === 'fromLargeToSplit' ? 100 : 0,
        }
      : currentMode === IslandMode.LARGE
      ? {
          config: {
            tension: 250,
            mass: 1.5,
          },
          transform: 'translateX(0px)',
          width: 352,
          height: 72,
          delay: transitionModeRef.current === 'fromSplitToLarge' ? 50 : 0,
        }
      : {
          config: { ...flatMove },
          transform: 'translateX(0px)',
          width: 112,
          height: 32,
          delay: transitionModeRef.current === 'fromSplitToDefault' ? 0 : 100,
        }
  )

  const expandedItemStyles = useSpring(
    currentMode === IslandMode.LARGE
      ? {
          config: {
            duration: 200,
          },
          width: 271,
          height: 55,
          filter: 'blur(0px)',
          opacity: 1,
          delay:
            100 + (transitionModeRef.current === 'fromSplitToLarge' ? 50 : 0),
          transform: 'scale(1)',
        }
      : {
          config: {
            duration: 150,
          },
          width: 86,
          height: 25,
          filter: 'blur(5px)',
          opacity: 0,
          transform: 'scale(0.9)',
        }
  )

  const lonelyIslandStyles = useSpring(
    currentMode === IslandMode.SPLIT
      ? {
          config: {
            tension: 250,
            mass: 2,
          },
          transform: 'translateX(42px)',
          delay: transitionModeRef.current === 'fromLargeToSplit' ? 200 : 0,
        }
      : {
          config: { ...flatMove },
          transform: 'translateX(0px)',
        }
  )

  const lonelyIslandAttr = useSpring(
    currentMode === IslandMode.SPLIT
      ? {
          config: {
            duration: 400,
          },
          stdDeviation: 0,
          delay: 250,
        }
      : {
          config: {
            duration: 100,
          },
          stdDeviation: 10,
        }
  )

  const minimizedModeLeftItemStyles = useSpring(
    currentMode === IslandMode.SPLIT
      ? {
          config: {
            duration: 200,
          },
          transform: 'scaleX(1)',
          filter: 'blur(0px)',
          opacity: 1,
          delay: 100,
        }
      : {
          config: {
            duration: 150,
          },
          transform: 'scaleX(0.5)',
          filter: 'blur(4px)',
          opacity: 0,
        }
  )

  const lonelyIslandItemStyles = useSpring(
    currentMode === IslandMode.SPLIT
      ? {
          config: {
            duration: 200,
          },
          transform: 'translateX(0px) scaleX(1)',
          filter: 'blur(0px)',
          opacity: 1,
          delay: 100,
        }
      : {
          config: {
            duration: 150,
          },
          transform: 'translateX(-100px) scaleX(0.5)',
          filter: 'blur(4px)',
          opacity: 0,
        }
  )

  // Don't render if no scene is active
  if (!currentSceneName || !currentScene) {
    return null
  }

  return (
    <animated.div className="dynamic-island" style={dynamicIslandStyles}>
      <animated.div className="darkroom" style={darkRoomStyles}>
        {/* Expanded mode left item */}
        <div className="expanded-mode-item-wrapper expanded-mode-left-item-wrapper">
          <animated.div className="left" style={expandedItemStyles}>
            {(currentScene && 'left' in currentScene) ? currentScene.left : (
              <div className="caller">
                <img src="/profile.png" className="photo" />
                <div className="caller-info">
                  <span className="device">iPhone</span>
                  <span className="name">Jang Haemin</span>
                </div>
              </div>
            )}
          </animated.div>
        </div>

        {/* Expanded mode right item */}
        <div className="expanded-mode-item-wrapper expanded-mode-right-item-wrapper">
          <animated.div className="right" style={expandedItemStyles}>
            {(currentScene && 'right' in currentScene) ? currentScene.right : (
              <div className="phone-booth">
                <div className="phone refuse">
                  <div className="icon">❌</div>
                </div>
                <div className="phone receive">
                  <div className="icon">✅</div>
                </div>
              </div>
            )}
          </animated.div>
        </div>

        {/* Minimized mode left item */}
        <div className="minimized-mode-item-wrapper minimized-mode-left-item-wrapper">
          <animated.div
            style={minimizedModeLeftItemStyles}
            className="minimized-mode-left-item"
          >
            <img className="photo" src="/lyft.png" />
          </animated.div>
        </div>

        {/* Minimized mode right item */}
        <div className="minimized-mode-item-wrapper minimized-mode-right-item-wrapper">
          <animated.div></animated.div>
        </div>
      </animated.div>

      <svg width="90" height="52" className="meta-animation-parts">
        <defs>
          <filter
            id="split-effect"
            width="400%"
            x="-150%"
            height="400%"
            y="-150%"
          >
            <Gaussian
              in="SourceGraphic"
              {...lonelyIslandAttr}
              result="blur"
            ></Gaussian>
            <ColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 25 -10"
              result="matrix"
            ></ColorMatrix>
          </filter>
        </defs>
        <g filter="url(#split-effect)">
          <circle cx="26" cy="26" r="15" fill="black" />
          <animated.rect
            style={lonelyIslandStyles}
            x="6"
            y="10"
            width="36"
            height="32"
            rx="16"
            fill="black"
          />
        </g>
      </svg>

      <animated.div className="lonely-island-item-wrapper">
        <animated.div
          className="lonely-island-item"
          style={lonelyIslandItemStyles}
        >
          {/* W */}
        </animated.div>
      </animated.div>
    </animated.div>
  )
}

// Wrapper component that handles conditional rendering with mount animation
const DynamicIsland = <Name extends string, T extends IslandScene<Name>>(props: DynamicIslandProps<Name, T>) => {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (props.currentSceneName !== null) {
      // Show: mount component first to allow animation
      setShouldRender(true)
    } else {
      // Hide: wait for hide animation to complete before unmounting
      const unmountTimer = setTimeout(() => {
        setShouldRender(false)
      }, 650) // Slightly longer than AuthContext delay (600ms)
      
      return () => clearTimeout(unmountTimer)
    }
  }, [props.currentSceneName])

  if (!shouldRender) {
    return null
  }

  return <DynamicIslandInternal {...props} />
}

export default DynamicIsland
