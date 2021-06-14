import { writable } from 'svelte/store'

/**
 * @typedef Rect
 * @type {[number, number, number, number]}
 */

/**
 * @typedef Point
 * @type {[number, number]}
 */

/**
 * @typedef MoveArgs
 * @type {Object}
 * @property {-1 | 0 | 1} direction
 * @property {'x' | 'y'} axis
 * @property {number} delta
 * @property {Rect} bound
 */

/**
 * @param {Point} p Point
 * @param {Rect} r Rectangle
 * @returns {boolean}
 */
export const isOverlapped = (p , r) => {
  const [px, py] = p
  const [rx, ry, rw, rh] = r

  return (px >= rx) 
    && (px <= (rx + rw)) 
    && (py >= ry) 
    && (py <= (ry + rh))
}

/**
 * 
 * @param {Point} clientPos
 * @param {DOMRect} bound
 * @param {number} size
 * @returns {Pick<MoveArgs, 'axis' | 'direction'>}
 */
export const detectScrollZone = (
  clientPos, 
  bound, 
  size
) => {
  /** @type {MoveArgs['direction']} */
  let direction = 0
  /** @type {MoveArgs['axis']} */
  let axis = 'y'

  const { x: rx, y: ry, width: rw, height: rh  } = bound
  const topBound = [rx, ry, rw, size]
  const bottomBound = [rx, ry + rh - size, rw, size]
  const leftBound = [rx, ry, size, rh]
  const rightBound = [rx + rw, ry - size, size, rh]
  
  if (isOverlapped(clientPos, topBound)) {
    direction = -1
    axis = 'y'
  }
  if (isOverlapped(clientPos, bottomBound)) {
    direction = 1
    axis = 'y'
  }
  if (isOverlapped(clientPos, leftBound)) {
    direction = -1
    axis = 'x'
  }
  if (isOverlapped(clientPos, rightBound)) {
    direction = 1
    axis = 'x'
  }

  return { direction, axis }
}

export const createAutoScrollStore = () => {
  let timer = null

  /** @type {Point} */
  const initialScrollPos = [0, 0]
  const { subscribe, update, set } = writable(initialScrollPos)

  /**
   * @param {MoveArgs} args 
   * @returns 
   */
  const start = (args) => {
    if (timer) return
    loop(args)
  }

  const stop = () => {
    cancelAnimationFrame(timer)
    timer = null
  }

  /**
   * @param {MoveArgs} args 
   * @returns 
   */
  const loop = (args) => {
    move(args)

    timer = requestAnimationFrame(() => {
      loop(args)
    })
  }

  /**
   * @param {MoveArgs} args 
   * @returns 
   */
  const move = ({ direction, axis, delta }) => {
    let id = axis === 'x' ? 0 : 1
    let change = delta * direction


    return update(scrollPos => {
      const nextScrollPos = (scrollPos.slice())
      nextScrollPos[id] += change
      return nextScrollPos
    })
  }

  return {
    subscribe,
    start,
    stop,
    set,
  }
}