import './App.css'
import { Movies } from './components/Movies'
import { useMovies } from './hooks/useMovies'
import { useState, useEffect, useRef, useCallback } from 'react'
import debounce from 'just-debounce-it'


//https://www.omdbapi.com/?s=Avengers&apikey=8c340d6a

function useSearch () {
  const [search, updateSearch] = useState('')
  const [error, setError] = useState(null)
  const isFirstInput = useRef(true)

  useEffect(() => {
    if (isFirstInput.current) {
      isFirstInput.current = search === ""
      return
    }
    if (search === '') {
      setError('No se puede buscar una película vacía')
      return
    }

    if (search.match(/^\d+$/)) {
      setError('No se puede buscar una película con un número')
      return
    }

    if (search.length < 3) {
      setError('La búsqueda debe tener al menos 3 caracteres')
      return
    }

    setError(null)
  }, [search])

  return { search, updateSearch, error }
}

function App() {
  const [sort, setSort] = useState(false)
  const { search, updateSearch, error } = useSearch()
  const {movies, loading, getMovies} = useMovies( { search, sort } )
  const debouncedGetMovies = useCallback(
      debounce(search => {
      getMovies({search})
    }, 300)
  , [getMovies])


  const handleSubmit = (event) => {
    event.preventDefault()
    getMovies({search})
  }

  const handleChange = (event) => {
    const newSearch = event.target.value
    updateSearch(newSearch)
    debouncedGetMovies(newSearch)

  }

  const handleSort = () => {
    setSort(!sort)
  }

  return (
    <div className="page">
      <header>
        <h1>Buscador de peliculas</h1>
        <form className="form" onSubmit={handleSubmit}>
          <input style={{
              border: '1px solid transparent',
              borderColor: error ? 'red' : 'transparent'
            }} onChange={handleChange} name="query" value={search} type="text" placeholder="Avengers, Star Wars, The Matrix..." />
            <input type="checkbox" onChange={handleSort}/>
          <button type='submit'>Buscar</button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </header>

      <main>
        {
          loading ? <p>Cargando ...</p> : <Movies movies={movies}/>
        }
      </main>
    </div>
  )
}

export default App
