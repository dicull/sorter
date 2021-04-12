export const removeItemsFromArray = <T>(array: T[], from: number[]) => {
  const filteredFrom = from.filter(v => v < array.length && v >= 0)
  // sort id so it's easier to offset index
  const orderedFrom = filteredFrom.slice().sort()
  // map id to item
  const movedItems = orderedFrom.reduce((acc, cur, i) => {
    acc[cur] = array.splice(cur - i, 1)[0]
    return acc
  }, {})
  // put items back to the correct order
  return filteredFrom.map(id => movedItems[id])
}