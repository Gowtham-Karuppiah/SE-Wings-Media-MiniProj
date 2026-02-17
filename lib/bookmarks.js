export function addBookmark(item) {
  try {
    const bookmarks = JSON.parse(localStorage.getItem('wings-bookmarks') || '[]')
    const exists = bookmarks.some(b => b.id === item.id)
    if (!exists) {
      bookmarks.unshift({
        id: item.id,
        title: item.title,
        type: item.type,
        thumbnail: item.thumbnail,
        author: item.author,
        savedAt: new Date().toISOString()
      })
      localStorage.setItem('wings-bookmarks', JSON.stringify(bookmarks))
      return true
    }
    return false
  } catch (e) {
    console.error('Error saving bookmark:', e)
    return false
  }
}

export function removeBookmark(itemId) {
  try {
    const bookmarks = JSON.parse(localStorage.getItem('wings-bookmarks') || '[]')
    const filtered = bookmarks.filter(b => b.id !== itemId)
    localStorage.setItem('wings-bookmarks', JSON.stringify(filtered))
    return true
  } catch (e) {
    console.error('Error removing bookmark:', e)
    return false
  }
}

export function isBookmarked(itemId) {
  try {
    const bookmarks = JSON.parse(localStorage.getItem('wings-bookmarks') || '[]')
    return bookmarks.some(b => b.id === itemId)
  } catch (e) {
    return false
  }
}

export function getBookmarks() {
  try {
    return JSON.parse(localStorage.getItem('wings-bookmarks') || '[]')
  } catch (e) {
    return []
  }
}

export function clearBookmarks() {
  try {
    localStorage.setItem('wings-bookmarks', '[]')
    return true
  } catch (e) {
    return false
  }
}

export function addToHistory(item) {
  try {
    const history = JSON.parse(localStorage.getItem('wings-history') || '[]')
    const filtered = history.filter(h => h.id !== item.id)
    filtered.unshift({
      id: item.id,
      title: item.title,
      type: item.type,
      thumbnail: item.thumbnail,
      author: item.author,
      viewedAt: new Date().toISOString()
    })
    const limited = filtered.slice(0, 50)
    localStorage.setItem('wings-history', JSON.stringify(limited))
  } catch (e) {
    console.error('Error saving to history:', e)
  }
}

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem('wings-history') || '[]')
  } catch (e) {
    return []
  }
}

export function clearHistory() {
  try {
    localStorage.setItem('wings-history', '[]')
    return true
  } catch (e) {
    return false
  }
}
