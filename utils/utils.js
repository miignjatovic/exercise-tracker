export const isValidDate = (date) => {
    if (typeof date !== 'string') return false
    
    const pattern = /^\d{4}-\d{2}-\d{2}$/
    if (!pattern.test(date)) return false

    const parsedDate = new Date(date)
    // check if its a valid date
    if (isNaN(parsedDate.getTime())) return false
    
    return parsedDate.toISOString().slice(0, 10) === date
}
